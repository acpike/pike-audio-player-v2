Yes, # Claude Code Project Guidelines

## Core Principles
- **Clean Code**: No magic numbers, meaningful variable names, clear function purposes
- **Simple CSS**: Avoid complex cascades and overengineering
- **Minimal Changes**: Each change should impact as little code as possible
- **Frequent Communication**: Check in before making changes

## Workflow Rules

### 1. Plan First
- Read the codebase thoroughly for relevant files
- Write a detailed plan in `tasks/todo.md` with specific, checkable todo items
- Include estimated complexity for each task (Simple/Medium/Complex)

### 2. Get Approval
- **ALWAYS** check in with the human before starting work
- Present your plan and wait for verification/approval
- Do not proceed without explicit confirmation

### 3. Work Incrementally
- Work on one todo item at a time
- Mark items as complete in `tasks/todo.md` as you finish them
- Commit changes frequently (after each completed todo item or logical chunk)

### 4. Communicate Progress
- Give high-level explanations of changes after each task
- Ask for confirmation before moving to the next major task
- If you encounter blockers or need to deviate from the plan, stop and ask

### 5. Follow Code Standards
- **No magic numbers**: Use named constants
- **Clean functions**: Single responsibility, clear names
- **Simple CSS**: Avoid complex selectors and cascades
- **No overengineering**: Choose the simplest solution that works

### 6. Commit Frequently
- Commit after completing each todo item
- Use clear, descriptive commit messages
- Don't accumulate large changes before committing

### 7. Document and Review
- Add a review section to `tasks/todo.md` summarizing all changes
- Include any important decisions or trade-offs made
- Note any technical debt or future improvements needed

## Before Making ANY Code Changes
1. ✅ Have I read the relevant codebase?
2. ✅ Have I written a plan in `tasks/todo.md`?
3. ✅ Has the human approved my plan?
4. ✅ Am I working on the smallest possible change?
5. ✅ Will I commit this change when complete?

## Red Flags to Avoid
- ❌ Making changes without approval
- ❌ Working on multiple tasks simultaneously
- ❌ Large commits with many unrelated changes
- ❌ Magic numbers or unclear variable names
- ❌ Complex CSS solutions when simple ones exist
- ❌ Overengineered solutions

Remember: **Always ask, never assume. Commit often, communicate frequently.**