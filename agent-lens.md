---
name: agent-lens
description: Log agent execution context to Agent Lens for debugging
---

# Agent Lens Logger

After completing each task or significant action, log the execution context using the `agent-lens` CLI tool.

## Log Format

After each task, run:

```bash
agent-lens log \
  --prompt "The task description or prompt" \
  --project "project-name" \
  --agent "your-agent-name" \
  --status success|error \
  --context "SOUL.md,MEMORY.md,AGENTS.md,skills/github.md" \
  --skills "github,coding-agent" \
  --stdout "What you did/output" \
  --exit 0
```

## When to Log

- After completing a coding task (feature, bugfix, refactor)
- After a task fails or produces errors
- After a significant decision or architectural choice
- When starting a new subtask within a larger project

## Context Files to Include

Always include the key context files you read:
- `SOUL.md`, `IDENTITY.md` — agent identity
- `MEMORY.md`, `memory/YYYY-MM-DD.md` — memory
- `AGENTS.md` — workspace conventions
- Relevant skill files used for the task
- Project-specific config (e.g., `SPEC.md`, backend specs)

## Installation

The agent-lens CLI must be installed:
```bash
npm install -g agent-lens-cli
# or
cargo install agent-lens-cli
```

Or use via npx:
```bash
npx agent-lens-cli log --prompt "..."
```

## View Logs

Import logged executions to SQLite for Agent Lens app:
```bash
agent-lens --import
```

## Project Alias

For JIS: `--project jis`
For OASIS: `--project oasis`
For Fellowship: `--project fellowship`
