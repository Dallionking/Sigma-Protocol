# Feature PRD: F01 -- Task Boards

**Feature:** Task Boards (Epic E1)
**Version:** 1.0.0
**Priority:** P0
**Sprint:** 1-2
**Total Estimate:** 18 points

---

## Overview

Task Boards are the core feature of TaskFlow. They provide a visual Kanban interface where teams organize work into columns representing workflow stages. This PRD covers board creation, column management, task cards, drag-and-drop interaction, and the task detail view.

---

## User Stories

### US-1: Create a Board
**As a** team lead,
**I want to** create a new board,
**So that** I can organize a project's tasks visually.

**Acceptance Criteria:**
- [ ] "New Board" button on board list page
- [ ] Form: name (required, max 50 chars), description (optional, max 500 chars)
- [ ] Creates board with default columns: "To Do", "In Progress", "Done"
- [ ] Redirects to new board after creation
- [ ] Board appears in sidebar navigation

### US-2: Manage Columns
**As a** team lead,
**I want to** add, rename, reorder, and remove columns,
**So that** the board matches my team's workflow.

**Acceptance Criteria:**
- [ ] "Add Column" button after the last column
- [ ] Inline rename by clicking column title
- [ ] Drag column headers to reorder
- [ ] Delete column only if empty, or prompt to move tasks first
- [ ] Maximum 10 columns per board
- [ ] Optional WIP limit shown as badge: "3 / 5"

### US-3: Create and Edit Tasks
**As a** team member,
**I want to** create tasks with details,
**So that** work items are tracked with context.

**Acceptance Criteria:**
- [ ] "+" button at bottom of each column
- [ ] Quick-create: type title and press Enter
- [ ] Full-create: opens task detail with all fields
- [ ] Fields: title, description (Markdown), assignee, priority, due date, labels
- [ ] Priority visual: colored dot (urgent=red, high=orange, medium=amber, low=gray)
- [ ] Due date: date picker, shows relative time on card ("Due tomorrow")

### US-4: Drag Tasks Between Columns
**As a** team member,
**I want to** drag tasks to update their status,
**So that** I can manage workflow without opening a form.

**Acceptance Criteria:**
- [ ] Click-and-drag task card
- [ ] Visual feedback: card elevates, drop zone highlights with dashed border
- [ ] Smooth animation on drop (200ms ease-out)
- [ ] Optimistic update: card moves instantly, server confirms
- [ ] If server rejects (e.g., WIP limit), card snaps back with toast error
- [ ] Reorder within same column by dragging between cards
- [ ] Touch support for tablet users

### US-5: View Task Details
**As a** team member,
**I want to** see the full detail of a task,
**So that** I can read context, leave comments, and download attachments.

**Acceptance Criteria:**
- [ ] Click task card to open detail panel (slide-in from right)
- [ ] All fields visible and editable inline
- [ ] Comment thread with Markdown support
- [ ] Attachment list with upload button
- [ ] Activity log: "Sarah moved this to In Progress -- 2 hours ago"
- [ ] URL updates to `/boards/[boardId]/tasks/[taskId]` (deep-linkable)
- [ ] Press Escape or click outside to close

---

## Technical Requirements

### Frontend Components

| Component | File | Description |
|-----------|------|-------------|
| `BoardView` | `components/board/board-view.tsx` | Main kanban layout |
| `Column` | `components/board/column.tsx` | Single column with task list |
| `TaskCard` | `components/board/task-card.tsx` | Draggable card |
| `TaskDetail` | `components/board/task-detail.tsx` | Detail side panel |
| `CreateTaskForm` | `components/board/create-task-form.tsx` | Quick and full create |

### Backend Functions

| Function | Type | Description |
|----------|------|-------------|
| `boards:get` | Query | Board with columns and metadata |
| `tasks:listByBoard` | Query | All tasks grouped by column |
| `tasks:create` | Mutation | Create task in column |
| `tasks:update` | Mutation | Update any task field |
| `tasks:move` | Mutation | Change column and/or position |
| `columns:create` | Mutation | Add column to board |
| `columns:reorder` | Mutation | Update column positions |

### Data Flow

```
User drags card
  -> @dnd-kit onDragEnd fires
  -> Optimistic update (local state)
  -> tasks:move mutation sent to Convex
  -> Convex validates (WIP limit, permissions)
  -> If success: reactive query updates all clients
  -> If error: optimistic update rolls back, toast shown
```

---

## UI States

| State | Behavior |
|-------|----------|
| Loading board | Column skeletons with card placeholders |
| Empty board | Illustration + "Add your first column" CTA |
| Empty column | "No tasks" + drag hint |
| Dragging | Card elevated, source grayed, target highlighted |
| WIP limit reached | Column header turns amber, "+" button disabled |
| Error on move | Card snaps back, error toast |

---

## Edge Cases

| Case | Handling |
|------|----------|
| Two users drag same task simultaneously | Last write wins; losing client sees card snap to server state |
| Delete column with tasks | Prompt: "Move X tasks to [column picker] before deleting" |
| Board with 0 columns | Show "Add a column to get started" |
| Task title empty | Prevent creation, show inline error |
| Very long task title | Truncate on card with ellipsis, full title in detail view |

<!-- Truncated for brevity -- actual output is typically 300-500 lines -->
