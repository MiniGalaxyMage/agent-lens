# Agent Lens — Context Debugger for AI Agents

## 1. Concept & Vision

Agent Lens es un visualizador de contexto de ejecución de agentes IA. Imagínalo como un debugger de variables, pero para el "cerebro" de un agente: qué leyó, qué vio, qué decidió. Diseñado para developers que construyen sistemas agénticos y necesitan depurar por qué un agente hizo algo inesperado.

**Feel:** Inspector de red del navegador, pero para agentes. Minimal, oscuro, denso en información pero elegante. Como si el dashboard de Linear tuviera un hijo con el inspector de Chrome.

## 2. Design Language

**Aesthetic:** Dark glassmorphism con acentos de cyan/violeta. Inspirado en apps de monitoring (Datadog, Linear dark mode, Raycast).

**Color Palette:**
- Background: `#0C0C10` (casi negro, tinte frío)
- Surface: `#16161C` (tarjetas)
- Surface elevated: `#1E1E26` (hover, activos)
- Border: `#2A2A35` (separadores sutiles)
- Accent primary: `#7C5CFF` (violeta — acciones principales)
- Accent secondary: `#00D4AA` (cyan-verde — estados OK, información)
- Accent warning: `#FFB020` (amber — warnings)
- Text primary: `#F0F0F5`
- Text secondary: `#8888A0`
- Text muted: `#55556A`

**Typography:**
- Headings: `Inter` (700, 600) — limpio, técnico
- Body: `Inter` (400, 500)
- Monospace: `JetBrains Mono` — para paths, código, timestamps

**Spatial System:**
- Base unit: 4px
- Padding cards: 16px
- Gap between sections: 24px
- Border radius: 8px (tarjetas), 6px (botones), 4px (inputs)

**Motion:**
- Micro-interactions: 150ms ease-out
- Panel transitions: 250ms ease-in-out
- Hover states: scale(1.02) + shadow en cards
- No animaciones pesadas — esto es una tool de debug

**Icons:** Lucide React — consistente, limpio, 1.5px stroke

## 3. Layout & Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Agent Lens          [Proyecto ▼]    [Settings ⚙️]  │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│   TIMELINE       │   CONTEXT INSPECTOR                      │
│   ──────────     │   ────────────────                      │
│   ● 14:32:01    │   📄 MEMORY.md            [raw] [tree]  │
│   ● 14:28:45    │   ─────────────────────────              │
│   ● 14:15:22    │   # Memory                               │
│   ● 13:55:10    │   Long-term memory...                   │
│   ● ...         │                                          │
│                  │   📄 SOUL.md                [raw] [tree] │
│   ──────────    │   ─────────────────────────              │
│   FILTERS       │   # SOUL.md...                           │
│   [Search]      │                                          │
│   [Date range]  │   📄 AGENTS.md              [raw] [tree] │
│   [Agent ▼]     │                                          │
│                  │   ─────────────────────────              │
│                  │   SKILLS ACTIVAS                        │
│                  │   ────────────────                      │
│                  │   🔧 coding-agent    ✅                 │
│                  │   🔧 github        ✅                   │
│                  │   🔧 frontend     ❌ (no applicable)    │
│                  │                                          │
├──────────────────┴──────────────────────────────────────────┤
│  REQUEST                                          14:32:01 │
│  ─────────────────────────────────────────────────────────  │
│  prompt: "Fix the UTC timezone bug in..."                  │
│                                                          │
│  RESPONSE                                         14:32:03 │
│  ─────────────────────────────────────────────────────────  │
│  stdout: "Created fix/utc-date-timezone..."               │
│  exit: 0                                                 │
└─────────────────────────────────────────────────────────────┘
```

**Responsive:** Sidebar colapsable en pantallas pequeñas. Mobile no es priority — es una tool de desktop.

## 4. Features & Interactions

### 4.1 Timeline de Ejecuciones
- Lista vertical de ejecuciones, newest first
- Cada item muestra: timestamp, agent name, truncated prompt (60 chars)
- Click → abre esa ejecución en el Context Inspector
- Hover → preview del prompt completo en tooltip
- Badge de estado: success (green), error (red), in-progress (amber pulse)

### 4.2 Context Inspector
- Tabs: Files | Skills | Request | Response
- **Files tab:** Lista de archivos leídos con toggle raw/tree view
  - Raw: contenido renderizado con markdown syntax highlighting
  - Tree: estructura del archivo en formato colapsable
- **Skills tab:** Lista de skills disponibles + cuáles estaban activas en esta ejecución
- **Request tab:** Prompt completo recibido
- **Response tab:** stdout, stderr, exit code

### 4.3 Filtros
- Search: busca en prompts, archivos, decisiones
- Date range picker
- Agent selector (si hay múltiples agentes)
- Status filter: all | success | error

### 4.4 Proyecto
- Selector de proyecto (carpeta del vault)
- Al cambiar proyecto → recarga timeline desde SQLite

### 4.5 Settings
- Carpeta del vault (path picker)
- Puerto del gateway (para conectar a OpenClaw si está corriendo)
- Clear database

## 5. Component Inventory

### TimelineItem
- Default: `bg-surface`, border-left accent
- Hover: `bg-surface-elevated`, border-left brighter
- Active/selected: `bg-accent/10`, border-left accent primary
- Badge de estado como dot colored

### FileCard
- Header con icon (📄) + filename + size
- Toggle raw/tree buttons
- Content area con syntax highlighting (markdown para .md, plain para el resto)
- Collapsed: solo header visible
- Expanded: contenido scrolleable (max-height 400px, overflow-y: auto)

### SkillBadge
- Icon + name + status indicator
- ✅ (green dot) = applicable y fue usada
- ❌ (muted) = applicable pero no fue usada
- N/A (grey) = no applicable para esta tarea

### PromptBlock / ResponseBlock
- Monospace font
- Background: `#0C0C10`
- Border: `#2A2A35`
- Copy button (top-right corner)
- Scrollable, max-height 200px

### SearchInput
- Icon search (lucide)
- Clear button cuando hay texto
- Focus: border accent primary

### ProjectSelector
- Dropdown con lista de proyectos detectados
- Option para abrir folder picker

### StatusBadge
- Success: green `#00D4AA`
- Error: red `#FF5F5F`
- In-progress: amber `#FFB020` con pulse animation

## 6. Technical Approach

### Stack
- **Tauri 2.x** — binary standalone, acceso directo a filesystem
- **React 18** + **TypeScript** — frontend
- **Tailwind CSS** — styling (no frameworks CSS-in-JS)
- **SQLite** (via `tauri-plugin-sql`) — execution log storage
- **Zustand** — state management (ligero, suficiente para esto)
- **Lucide React** — icons
- **Prism.js** o **highlight.js** — syntax highlighting

### Data Model

```typescript
interface Execution {
  id: string;              // UUID
  project: string;         // nombre del vault/proyecto
  agent: string;           // agent id (Percival, Forge, etc.)
  timestamp: string;       // ISO 8601
  status: 'success' | 'error' | 'running';
  prompt: string;
  context_files: string[]; // paths relativos de archivos leídos
  skills_used: string[];   // skills que estaban activas
  stdout: string;
  stderr: string;
  exit_code: number;
}

interface ContextFile {
  execution_id: string;
  path: string;
  content: string;         // contenido en el momento de la ejecución
  size_bytes: number;
}
```

### Storage
- SQLite en `{app_data_dir}/agent-lens.db`
- Tablas: `executions`, `context_files`
- Auto-cleanup: retención de 30 días por defecto

### Tauri Commands
- `get_executions(project, filters)` → lista paginada
- `get_execution(id)` → detalle con archivos
- `get_context_file(execution_id, path)` → contenido de un archivo
- `save_execution(execution)` → guarda nueva ejecución
- `get_projects()` → detecta vaults en carpetas configuradas
- `open_folder_picker()` → dialog para seleccionar carpeta

### OpenClaw Integration (opcional)
- Si el gateway está corriendo, puede leer sesiones de OpenClaw directamente
- Alternativamente, un export desde Percival: `agent-lens export` command

## 7. Non-Goals (Out of Scope for v1)

- Edición de archivos (solo lectura)
- Live streaming de ejecución activa
- Multi-agent orchestration
- Cloud sync
- Mobile

## 8. Success Metrics

- Primera ejecución en < 5 min desde install
- Timeline carga en < 500ms para 1000+ ejecuciones
- Interfaz usable sin documentation
