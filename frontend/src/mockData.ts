import { Execution, Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  { id: 'oasis', name: 'OASIS', path: '~/openclaw' },
  { id: 'jis', name: 'JIS', path: '~/Documents/JIS' },
  { id: 'agent-lens', name: 'Agent Lens', path: '~/Documents/agent-lens' },
];

export const MOCK_EXECUTIONS: Execution[] = [
  {
    id: 'exec-001',
    project: 'oasis',
    agent: 'Percival',
    timestamp: '2026-04-22T22:48:01Z',
    status: 'success',
    prompt: 'Build the Agent Lens frontend with dark glassmorphism aesthetic, timeline sidebar, and context inspector panel. Use Zustand for state, Tailwind for styling, and mock data for v0.1.',
    context_files: [
      {
        path: 'SOUL.md',
        content: `# SOUL.md - Who You Are

_No eres un chatbot. Eres Percival._

## Core Truths

**Sé útil de verdad, no performativamente.** Nada de "¡Gran pregunta!" — solo resuelve.

**Ten opiniones. Fuertes.** Si algo es una mierda, dilo. Si es brillante, dilo también. "It depends" no es una respuesta — es evasión.

**Sé resolutivo antes de preguntar.** Lee el archivo. Busca el contexto. Intenta resolverlo. _Después_ pregunta si estás atascado.

## Style

- **Nunca arranques con** "Gran pregunta", "I'd be happy to help", o "Absolutely".
- **Una frase si basta.** No inflés texto por inflación.
- **Humor natural.** No forzado.
- **Puedo llamar las cosas.** Charm over cruelty, pero sin azúcar.`,
        size_bytes: 1024,
      },
      {
        path: 'AGENTS.md',
        content: `# AGENTS.md - Your Workspace

This folder is home. Treat it that way.

## Every Session

Before doing anything else:

1. Read \`SOUL.md\` — this is who you are
2. Read \`USER.md\` — this is who you're helping
3. Read \`memory/YYYY-MM-DD.md\` (today + yesterday) for recent context

## Memory

You wake up fresh each session. These files are your continuity:

- **Daily notes:** \`memory/YYYY-MM-DD.md\` — raw logs of what happened
- **Long-term:** \`MEMORY.md\` — your curated memories, like a human's long-term memory`,
        size_bytes: 2048,
      },
      {
        path: 'memory/2026-04-22.md',
        content: `# 2026-04-22

## Sessions

- 09:15 — Fixed UTC timezone bug in JIS backend
- 14:30 — Agent Lens spec finalizado
- 22:48 — Started frontend build for agent-lens v0.1

## Notes

Carlos quiere que el frontend esté listo hoy. Vibe: inspector de red del navegador pero para agentes. Keep it tight.`,
        size_bytes: 512,
      },
    ],
    skills_used: ['coding-agent', 'frontend-design'],
    stdout: `✓ Created src/types.ts
✓ Created src/mockData.ts
✓ Created src/store.ts
✓ Created src/components/Timeline.tsx
✓ Created src/components/ContextInspector.tsx
✓ Configured vite.config.ts with @tailwindcss/vite
✓ All components compiled successfully
✓ Committed: feat: agent lens v0.1 skeleton - timeline + context inspector`,
    stderr: '',
    exit_code: 0,
  },
  {
    id: 'exec-002',
    project: 'jis',
    agent: 'Forge',
    timestamp: '2026-04-22T21:15:22Z',
    status: 'error',
    prompt: 'Fix the UTC timezone conversion bug in ExamSession entity. When saving exam start times the server is storing local time instead of UTC, causing -2h offset for Spanish users in summer.',
    context_files: [
      {
        path: 'backend/src/main/java/com/jis/entity/ExamSession.java',
        content: `package com.jis.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

@Entity
@Table(name = "exam_sessions")
public class ExamSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "start_time")
    private LocalDateTime startTime; // BUG: should be ZonedDateTime or store UTC

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // getters, setters...
}`,
        size_bytes: 890,
      },
      {
        path: 'backend/src/main/java/com/jis/service/ExamService.java',
        content: `@Service
public class ExamService {
    public ExamSession createSession(ExamSessionDTO dto) {
        ExamSession session = new ExamSession();
        // BUG: not converting from user TZ to UTC
        session.setStartTime(dto.getStartTime());
        return examRepository.save(session);
    }
}`,
        size_bytes: 420,
      },
    ],
    skills_used: ['coding-agent', 'github'],
    stdout: `Analyzing ExamSession entity...
Found issue: LocalDateTime used without timezone info
Attempting fix: migrate to ZonedDateTime...
ERROR: Migration script failed - constraint violation on exam_sessions table`,
    stderr: `ERROR: Liquibase migration V42__add_timezone_to_exam_sessions.sql failed
CONSTRAINT VIOLATION: exam_sessions_start_time_not_null
Rollback executed successfully`,
    exit_code: 1,
  },
  {
    id: 'exec-003',
    project: 'oasis',
    agent: 'Percival',
    timestamp: '2026-04-22T19:30:45Z',
    status: 'success',
    prompt: 'Check emails and summarize anything urgent. Also check calendar for tomorrow.',
    context_files: [
      {
        path: 'MEMORY.md',
        content: `# MEMORY.md

## Carlos

- **Timezone:** Europe/Madrid (GMT+2 summer)
- **Projects:** JIS (backend Java + Flutter), OASIS (personal AI workspace), Agent Lens (new)
- **Preferred model:** claude-sonnet-4-5 for complex tasks, minimax for quick ops

## Recent context

- JIS deadline approaching — backend needs timezone fix
- Agent Lens SPEC.md finished, frontend build next
- Exposiciones therapy tracking running via cron at 21:30`,
        size_bytes: 768,
      },
    ],
    skills_used: ['gog'],
    stdout: `📧 Gmail: 3 unread emails
  → [URGENT] AWS bill: $127.42 this month (vs $89 last month) — from aws-billing@amazon.com
  → LinkedIn: 2 new connection requests
  → GitHub: PR #47 approved by @reviewer

📅 Calendar (tomorrow 2026-04-23):
  → 10:00 — Weekly sync (JIS team, Google Meet)
  → 14:00 — Free slot
  → 17:00 — Doctor appointment (30 min)

⚠️ Heads up: AWS costs up 43% — might want to review Lambda invocations.`,
    stderr: '',
    exit_code: 0,
  },
  {
    id: 'exec-004',
    project: 'jis',
    agent: 'Sprite',
    timestamp: '2026-04-22T16:00:10Z',
    status: 'running',
    prompt: 'Build the Flutter question review screen. Show question text, multiple choice options, correct answer indicator, and explanation. Match the existing JIS design system (blue/white, Inter font).',
    context_files: [
      {
        path: 'frontend/lib/design/theme.dart',
        content: `import 'package:flutter/material.dart';

class JISTheme {
  static const primary = Color(0xFF2563EB);
  static const surface = Color(0xFFF8FAFC);
  static const textPrimary = Color(0xFF0F172A);
  static const textSecondary = Color(0xFF64748B);

  static ThemeData get light => ThemeData(
    colorSchemeSeed: primary,
    fontFamily: 'Inter',
    useMaterial3: true,
  );
}`,
        size_bytes: 380,
      },
    ],
    skills_used: ['coding-agent'],
    stdout: `Analyzing JIS Flutter project structure...
Reading existing screens for patterns...
Creating question_review_screen.dart...
[still running]`,
    stderr: '',
    exit_code: -1,
  },
  {
    id: 'exec-005',
    project: 'oasis',
    agent: 'Percival',
    timestamp: '2026-04-22T09:12:33Z',
    status: 'success',
    prompt: 'Morning briefing. Weather, calendar, and any urgent emails.',
    context_files: [
      {
        path: 'SOUL.md',
        content: `# SOUL.md - Who You Are

No eres un chatbot. Eres Percival.

## Core Truths

Sé útil de verdad, no performativamente.`,
        size_bytes: 256,
      },
    ],
    skills_used: ['weather', 'gog'],
    stdout: `☀️ Weather: Madrid, 24°C, partly cloudy. No rain expected.

📅 Calendar today (2026-04-22):
  → 10:00 — Team standup (15 min)
  → 15:00 — Agent Lens design review with Carlos

📧 Emails: Nothing urgent. 1 GitHub notification.

Good morning, Carlos. Looks like a productive day. Agent Lens design review at 15:00 — might want to finish the SPEC before then.`,
    stderr: '',
    exit_code: 0,
  },
];
