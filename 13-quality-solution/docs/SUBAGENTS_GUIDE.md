# Subagents Guide

Hướng dẫn sử dụng các Claude Code subagents cho Structured Thinking workflow.

## Available Subagents

| Subagent | Purpose | Output Folder |
|----------|---------|---------------|
| `research` | Research and information gathering | `03-research/` |
| `problem_analysis` | Problem analysis and task definition | `04-task-definition/` |
| `question_analyst` | Question identification and tracking | `06-good-question/` |
| `idea_brainstorm` | Creative ideation | `05-ideas/` |
| `answer` | Answer questions with evidence | `09-good-answer/` |
| `planner` | Task planning and backlog management | `08-backlog-plan/` |
| `implementer` | Solution implementation | `12-quick-solution/` or `13-quality-solution/` |
| `learner` | Learning capture and principles | `11-lesson-learned/` and `10-principles/` |
| `ai_curator` | AI usage and prompt management | `17-AI/` |

## Quick Workflow

```bash
# 1. Define the problem
claude --subagent problem_analysis "Define task"

# 2. Quick research
claude --subagent research "Quick research on [topic]"

# 3. Plan tasks
claude --subagent planner "Create task list"

# 4. Implement
claude --subagent implementer "Build quick solution"
```

## Deep Workflow

```bash
# 1. Deep problem analysis
claude --subagent problem_analysis "Thorough problem breakdown"

# 2. Identify questions
claude --subagent question_analyst "List all unknowns"

# 3. Extensive research
claude --subagent research "Deep research on [topic]"

# 4. Brainstorm
claude --subagent idea_brainstorm "Generate solution approaches"

# 5. Answer questions
claude --subagent answer "Answer: [specific question]"

# 6. Plan
claude --subagent planner "Comprehensive implementation plan"

# 7. Implement
claude --subagent implementer "Build quality solution"

# 8. Capture learnings
claude --subagent learner "Document lessons and principles"
```

## AI Curation Workflow

```bash
# Save effective prompt
claude --subagent ai_curator "Save prompt for [purpose]"

# Document important conversation
claude --subagent ai_curator "Save conversation summary"

# Create custom agent config
claude --subagent ai_curator "Create agent for [purpose]"
```

## Question-Answer Linking

```bash
# Step 1: Create question (status: unanswered)
claude --subagent question_analyst "Question: [your question]"

# Step 2: Answer question (creates answer + updates question status)
claude --subagent answer "Answer: [question name]"
```

## Backlog Management

```bash
# Create tasks in todo/
claude --subagent planner "Create tasks for [feature]"

# Start task (moves to doing/)
claude --subagent implementer "Start: [task name]"

# Complete task (moves to done/)
claude --subagent implementer "Complete: [task name]"
```
