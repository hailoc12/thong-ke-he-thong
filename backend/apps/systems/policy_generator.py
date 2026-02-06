"""
Policy Generator - Auto-generate improvement policies from user feedback
Uses AI to analyze negative feedback and extract actionable improvements
"""
import json
import logging
from typing import Dict, List, Optional
from django.conf import settings
from django.utils import timezone

# Import OpenAI client (will be configured in settings)
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logging.warning("OpenAI package not installed. Policy generation will be disabled.")

from .models_feedback import AIResponseFeedback, CustomPolicy

logger = logging.getLogger(__name__)


class PolicyGenerator:
    """
    Analyzes user feedback and generates improvement policies

    Key Features:
    - Extracts full context (question, steps, SQL, results, feedback)
    - Checks existing policies to avoid duplicates
    - Uses AI to identify root causes
    - Generates actionable policy rules
    """

    def __init__(self):
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI package is required for policy generation")

        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = getattr(settings, 'POLICY_GENERATION_MODEL', 'gpt-4')

    def generate_from_feedback(self, feedback: AIResponseFeedback) -> Optional[Dict]:
        """
        Main entry point: Generate policy from a single feedback

        Returns:
            Policy dict if generated, None if skipped (duplicate)
        """
        logger.info(f"Generating policy from feedback {feedback.id}")

        try:
            # Build rich context
            context = self._build_context(feedback)

            # Get existing policies to check for duplicates
            existing_policies = self._get_existing_policies()

            # Call AI analyzer
            policy_data = self._call_ai_analyzer(context, existing_policies)

            # Check if should skip
            if policy_data.get('skip'):
                logger.info(f"Skipping duplicate policy: {policy_data.get('reason')}")
                return None

            logger.info(f"Successfully generated policy for feedback {feedback.id}")
            return policy_data

        except Exception as e:
            logger.error(f"Error generating policy from feedback {feedback.id}: {e}")
            raise

    def _build_context(self, feedback: AIResponseFeedback) -> Dict:
        """
        Extract full context from feedback for AI analysis

        Context includes:
        - User's question
        - User's feedback explanation
        - AI's answer
        - Steps AI took
        - SQL queries executed
        - Query results (if available)
        """
        response_data = feedback.response_data or {}

        context = {
            'question': feedback.query,
            'feedback': feedback.feedback_text or 'No detailed feedback provided',
            'mode': feedback.mode,
            'answer': response_data.get('answer', 'N/A'),
            'steps': response_data.get('steps', []),
            'sql_queries': response_data.get('queries', []),
            'metadata': response_data.get('metadata', {}),
        }

        # Extract query results if available
        if 'queries' in response_data and isinstance(response_data['queries'], list):
            for query in response_data['queries']:
                if isinstance(query, dict) and 'results' in query:
                    context['query_results'] = query.get('results', [])
                    context['row_count'] = query.get('row_count', 0)
                    break

        return context

    def _get_existing_policies(self) -> List[Dict]:
        """
        Get all active policies (both auto-generated and custom)
        Used to check for duplicates
        """
        policies = []

        # Get custom policies
        custom_policies = CustomPolicy.objects.filter(is_active=True)
        for p in custom_policies:
            policies.append({
                'category': p.category,
                'rule': p.rule,
                'priority': p.priority,
                'rationale': p.rationale,
                'is_custom': True,
            })

        # Get auto-generated policies from previous feedbacks
        auto_policies = AIResponseFeedback.objects.filter(
            analyzed=True,
            generated_policies__isnull=False
        ).exclude(generated_policies={})

        for fb in auto_policies:
            if isinstance(fb.generated_policies, list):
                policies.extend(fb.generated_policies)
            elif isinstance(fb.generated_policies, dict):
                policies.append(fb.generated_policies)

        return policies

    def _call_ai_analyzer(self, context: Dict, existing_policies: List[Dict]) -> Dict:
        """
        Call OpenAI to analyze feedback and generate policy
        """
        prompt = self._build_prompt(context, existing_policies)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert at analyzing AI query failures and generating improvement policies. "
                                   "Your goal is to identify what database schema or domain knowledge was missing. IMPORTANT: Output all policy text in Vietnamese for Vietnamese users."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            raise

    def _build_prompt(self, context: Dict, existing_policies: List[Dict]) -> str:
        """
        Build the analysis prompt with full context
        """
        return f"""
You are analyzing why an AI Assistant gave a wrong answer.

QUESTION:
{context['question']}

AI'S WRONG ANSWER:
{context['answer']}

STEPS AI TOOK:
{json.dumps(context['steps'], indent=2, ensure_ascii=False)}

SQL QUERIES EXECUTED:
{json.dumps(context['sql_queries'], indent=2, ensure_ascii=False)}

USER'S FEEDBACK (explaining the problem):
{context['feedback']}

EXISTING POLICIES (avoid duplicates):
{json.dumps(existing_policies, indent=2, ensure_ascii=False)}

IMPORTANT INSTRUCTIONS:
1. Check existing policies FIRST to avoid generating duplicates
2. Only generate NEW policy if:
   - NOT covered by existing policies
   - Adds DIFFERENT knowledge/context
   - Complements (not overlaps) existing ones
3. Focus on DATABASE SCHEMA MAPPINGS and DOMAIN KNOWLEDGE
4. Policies should tell AI what it needs to KNOW, not just rules

TASK:
Identify the ROOT CAUSE of the wrong answer. What DATABASE/DOMAIN KNOWLEDGE was missing?

**CRITICAL: Output ALL text fields (rule, rationale, examples, missing_knowledge, correct_mapping) in VIETNAMESE language for Vietnamese users.**

OUTPUT FORMAT (JSON):
{{
  "skip": false,  // Set to true if duplicate
  "reason": "",  // If skip=true, explain why it's duplicate
  "category": "schema_mapping | accuracy | domain_knowledge | clarity | completeness",
  "rule": "Clear instruction about what the AI needs to know (e.g., column mappings, domain terms)",
  "priority": "high | medium | low",
  "rationale": "Brief explanation of why this policy is needed",
  "examples": ["example question 1", "example question 2"],
  "missing_knowledge": "What specific database/domain info was missing",
  "correct_mapping": "User term → Database field/value"
}}

If this is a DUPLICATE of an existing policy, return:
{{
  "skip": true,
  "reason": "This issue is already covered by existing policy: [describe which policy]"
}}
"""

    def save_policy(self, policy_data: Dict, feedback: AIResponseFeedback) -> None:
        """
        Save generated policy to the feedback record

        Note: We store policies in the feedback's generated_policies field.
        The aggregated policies are built from these when needed.
        """
        feedback.generated_policies = policy_data
        feedback.analyzed = True
        feedback.policy_generated_at = timezone.now()
        feedback.save(update_fields=['generated_policies', 'analyzed', 'policy_generated_at'])

        logger.info(f"Saved policy for feedback {feedback.id}: {policy_data.get('rule', '')[:50]}")

    @staticmethod
    def get_all_active_policies() -> List[Dict]:
        """
        Get all active policies for injection into system prompt

        Combines:
        - Auto-generated policies from feedbacks
        - Custom policies created by admin
        """
        policies = []

        # Custom policies
        custom_policies = CustomPolicy.get_active_policies()
        policies.extend(custom_policies)

        # Auto-generated policies
        auto_generated = AIResponseFeedback.objects.filter(
            analyzed=True,
            generated_policies__isnull=False
        ).exclude(generated_policies={}).order_by('-policy_generated_at')

        for feedback in auto_generated:
            policy = feedback.generated_policies
            if isinstance(policy, dict) and not policy.get('skip'):
                policies.append({
                    'category': policy.get('category', 'custom'),
                    'rule': policy.get('rule', ''),
                    'priority': policy.get('priority', 'medium'),
                    'rationale': policy.get('rationale', ''),
                    'examples': policy.get('examples', []),
                    'is_custom': False,
                })

        # Sort by priority (high > medium > low)
        priority_order = {'high': 0, 'medium': 1, 'low': 2}
        policies.sort(key=lambda p: priority_order.get(p.get('priority', 'medium'), 1))

        return policies

    @staticmethod
    def build_system_prompt_with_policies() -> str:
        """
        Build system prompt with all active policies injected

        Format:
        IMPROVEMENT GUIDELINES:
        1. [category] [PRIORITY] Rule text
           Rationale: Why this is needed
           Examples: Question examples
        """
        policies = PolicyGenerator.get_all_active_policies()

        if not policies:
            return ""

        prompt_lines = ["IMPROVEMENT GUIDELINES (from user feedback):"]
        prompt_lines.append("Follow these guidelines to improve accuracy:\n")

        for i, policy in enumerate(policies, 1):
            category = policy.get('category', 'custom').title()
            priority = policy.get('priority', 'medium').upper()
            rule = policy.get('rule', '')
            rationale = policy.get('rationale', '')
            examples = policy.get('examples', [])

            prompt_lines.append(f"{i}. [{category}] [{priority}] {rule}")
            if rationale:
                prompt_lines.append(f"   Rationale: {rationale}")
            if examples:
                prompt_lines.append(f"   Examples: {', '.join(examples[:2])}")
            prompt_lines.append("")  # Empty line

        prompt_lines.append(f"[Total: {len(policies)} active policies]")

        return "\n".join(prompt_lines)
