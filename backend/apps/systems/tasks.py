"""
Celery tasks for async policy generation
"""
import logging
from celery import shared_task
from django.utils import timezone

from .models_feedback import AIResponseFeedback
from .policy_generator import PolicyGenerator

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def generate_policy_async(self, feedback_id: int):
    """
    Asynchronously generate improvement policy from negative feedback

    Args:
        feedback_id: ID of the AIResponseFeedback to analyze

    This task:
    1. Checks if policy already generated (skip if analyzed=True)
    2. Extracts full context from feedback
    3. Calls AI to analyze and generate policy
    4. Saves policy back to feedback
    5. Marks feedback as analyzed

    Retries up to 3 times on failure.
    """
    try:
        feedback = AIResponseFeedback.objects.get(id=feedback_id)

        # Skip if already analyzed
        if feedback.analyzed:
            logger.info(f"Feedback {feedback_id} already analyzed, skipping")
            return {
                'status': 'skipped',
                'reason': 'already_analyzed',
                'feedback_id': feedback_id
            }

        # Generate policy
        generator = PolicyGenerator()
        policy_data = generator.generate_from_feedback(feedback)

        if policy_data:
            # Save policy
            generator.save_policy(policy_data, feedback)

            logger.info(f"Successfully generated policy for feedback {feedback_id}")
            return {
                'status': 'success',
                'feedback_id': feedback_id,
                'policy': {
                    'category': policy_data.get('category'),
                    'rule': policy_data.get('rule', '')[:100],  # Truncate for logging
                    'priority': policy_data.get('priority'),
                }
            }
        else:
            # Policy generation was skipped (duplicate)
            logger.info(f"Policy generation skipped for feedback {feedback_id} (duplicate)")

            # Still mark as analyzed to prevent re-processing
            feedback.analyzed = True
            feedback.policy_generated_at = timezone.now()
            feedback.save(update_fields=['analyzed', 'policy_generated_at'])

            return {
                'status': 'skipped',
                'reason': 'duplicate_policy',
                'feedback_id': feedback_id
            }

    except AIResponseFeedback.DoesNotExist:
        logger.error(f"Feedback {feedback_id} not found")
        return {
            'status': 'error',
            'error': 'feedback_not_found',
            'feedback_id': feedback_id
        }

    except Exception as e:
        logger.error(f"Error generating policy for feedback {feedback_id}: {e}")

        # Retry with exponential backoff
        try:
            raise self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for feedback {feedback_id}")
            return {
                'status': 'error',
                'error': str(e),
                'feedback_id': feedback_id
            }


@shared_task
def regenerate_all_policies():
    """
    Batch regenerate policies from ALL negative feedbacks

    Used for:
    - Manual regeneration from admin page
    - Updating policies with improved algorithm
    - Reprocessing after bug fixes

    This ignores the 'analyzed' flag and reprocesses everything.
    """
    logger.info("Starting batch policy regeneration for all negative feedbacks")

    negative_feedbacks = AIResponseFeedback.objects.filter(
        rating='negative'
    ).exclude(
        feedback_text=''
    ).exclude(
        feedback_text__isnull=True
    ).order_by('-created_at')

    total_count = negative_feedbacks.count()
    success_count = 0
    skip_count = 0
    error_count = 0

    generator = PolicyGenerator()

    for feedback in negative_feedbacks:
        try:
            policy_data = generator.generate_from_feedback(feedback)

            if policy_data:
                generator.save_policy(policy_data, feedback)
                success_count += 1
            else:
                # Skipped (duplicate)
                feedback.analyzed = True
                feedback.policy_generated_at = timezone.now()
                feedback.save(update_fields=['analyzed', 'policy_generated_at'])
                skip_count += 1

        except Exception as e:
            logger.error(f"Error regenerating policy for feedback {feedback.id}: {e}")
            error_count += 1

    logger.info(f"Batch regeneration complete: {success_count} success, {skip_count} skipped, {error_count} errors")

    return {
        'status': 'completed',
        'total': total_count,
        'success': success_count,
        'skipped': skip_count,
        'errors': error_count,
    }
