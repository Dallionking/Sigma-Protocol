# Technical Specification -- TaskFlow

**Project:** TaskFlow
**Version:** 1.0.0
**Created:** 2026-02-01
**Step:** 8 - Technical Specification

---

## 1. Technology Stack

### Frontend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 15.1.0 | App Router, RSC |
| React | React | 19.0.0 | UI components |
| Styling | Tailwind CSS | 4.0 | Utility-first CSS |
| Components | shadcn/ui | latest | Base components |
| Icons | Lucide React | latest | Icon system |
| DnD | @dnd-kit | 6.x | Drag-and-drop |
| Forms | React Hook Form | 7.x | Form management |
| Validation | Zod | 3.x | Schema validation |

### Backend

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Database + Functions | Convex | 1.17.0 | Real-time sync + serverless |
| Auth | Clerk | 5.x | Authentication |
| Email | Resend | 3.x | Transactional email |
| File Storage | Convex Storage | - | Attachment uploads |

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Hosting | Vercel | Edge deployment |
| CI/CD | GitHub Actions | Test + deploy pipeline |
| Monitoring | Axiom | Logs and metrics |
| Error Tracking | Sentry | Runtime error capture |

---

## 2. Project Structure

```
taskflow/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx                # Root layout (providers)
│   ├── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── sign-up/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx            # App shell (sidebar, header)
│   │   ├── dashboard/page.tsx    # Dashboard home
│   │   ├── boards/
│   │   │   ├── page.tsx          # Board list
│   │   │   └── [boardId]/
│   │   │       ├── page.tsx      # Kanban view
│   │   │       └── settings/page.tsx
│   │   ├── team/page.tsx         # Team management
│   │   └── settings/page.tsx     # Workspace settings
│   └── api/
│       └── webhooks/
│           ├── clerk/route.ts    # Auth webhooks
│           └── github/route.ts   # GitHub integration
│
├── components/
│   ├── ui/                       # shadcn primitives
│   ├── board/                    # Board-specific components
│   │   ├── board-view.tsx
│   │   ├── column.tsx
│   │   ├── task-card.tsx
│   │   └── task-detail.tsx
│   ├── dashboard/                # Dashboard widgets
│   ├── team/                     # Team components
│   └── layout/                   # Shell, sidebar, header
│
├── convex/
│   ├── schema.ts                 # Database schema
│   ├── auth.config.ts            # Clerk integration
│   ├── boards.ts                 # Board queries + mutations
│   ├── columns.ts                # Column operations
│   ├── tasks.ts                  # Task CRUD
│   ├── comments.ts               # Comment threads
│   ├── members.ts                # Workspace membership
│   ├── notifications.ts          # Notification logic
│   └── crons.ts                  # Scheduled jobs
│
├── lib/
│   ├── utils.ts                  # Shared utilities
│   └── validators.ts             # Zod schemas
│
├── hooks/
│   ├── use-board.ts              # Board data hook
│   ├── use-tasks.ts              # Task queries
│   └── use-realtime.ts           # Convex subscription helpers
│
└── public/
    └── images/                   # Static assets
```

---

## 3. Database Schema (Convex)

### Tables

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  workspaces: defineTable({
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  boards: defineTable({
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("private"), v.literal("public")),
    createdBy: v.string(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  columns: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    position: v.number(),
    color: v.optional(v.string()),
    taskLimit: v.optional(v.number()),
  }).index("by_board", ["boardId"]),

  tasks: defineTable({
    columnId: v.id("columns"),
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    assigneeId: v.optional(v.string()),
    priority: v.union(
      v.literal("urgent"), v.literal("high"),
      v.literal("medium"), v.literal("low")
    ),
    dueDate: v.optional(v.number()),
    labels: v.array(v.string()),
    position: v.number(),
    completedAt: v.optional(v.number()),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_column", ["columnId"])
    .index("by_board", ["boardId"])
    .index("by_assignee", ["assigneeId"])
    .searchIndex("search_title", { searchField: "title" }),

  comments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.string(),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  attachments: defineTable({
    taskId: v.id("tasks"),
    fileName: v.string(),
    storageId: v.id("_storage"),
    fileSize: v.number(),
    uploadedBy: v.string(),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),

  notifications: defineTable({
    userId: v.string(),
    type: v.string(),
    title: v.string(),
    body: v.string(),
    taskId: v.optional(v.id("tasks")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),
});
```

---

## 4. API Endpoints

### Board Operations

| Operation | Function | Auth | Description |
|-----------|----------|------|-------------|
| List boards | `query boards:list` | Required | All boards in workspace |
| Get board | `query boards:get` | Required | Single board with columns |
| Create board | `mutation boards:create` | Admin+ | New board |
| Update board | `mutation boards:update` | Admin+ | Edit name/description |
| Delete board | `mutation boards:delete` | Admin+ | Soft delete |

### Task Operations

| Operation | Function | Auth | Description |
|-----------|----------|------|-------------|
| List by board | `query tasks:listByBoard` | Required | All tasks grouped by column |
| Get task | `query tasks:get` | Required | Single task with comments |
| Create task | `mutation tasks:create` | Member+ | New task in column |
| Update task | `mutation tasks:update` | Member+ | Edit any field |
| Move task | `mutation tasks:move` | Member+ | Change column/position |
| Delete task | `mutation tasks:delete` | Member+ | Soft delete |
| Search tasks | `query tasks:search` | Required | Full-text search |

### Comment Operations

| Operation | Function | Auth | Description |
|-----------|----------|------|-------------|
| List comments | `query comments:list` | Required | Comments for a task |
| Add comment | `mutation comments:create` | Member+ | New comment |
| Delete comment | `mutation comments:delete` | Author/Admin | Remove comment |

---

## 5. Authentication

### Flow

```
1. User clicks "Sign In"
2. Clerk hosted UI handles auth (email/password or Google OAuth)
3. Clerk issues JWT
4. Frontend stores JWT, sends with Convex requests
5. Convex auth middleware validates JWT
6. User identity available in all queries/mutations
```

### Middleware

```typescript
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
```

---

## 6. Real-Time Architecture

### Convex Subscriptions

All data flows use Convex reactive queries. When data changes on the server, all connected clients receive updates automatically via WebSocket.

```typescript
// Example: Board view subscribes to tasks
function BoardView({ boardId }: { boardId: Id<"boards"> }) {
  const tasks = useQuery(api.tasks.listByBoard, { boardId });
  // `tasks` automatically updates when any task in this board changes
}
```

### Optimistic Updates

Drag-and-drop operations use Convex optimistic updates for instant visual feedback:

```typescript
const moveTask = useMutation(api.tasks.move).withOptimisticUpdate(
  (localStore, { taskId, targetColumnId, position }) => {
    // Instantly move card in local state
    // Server confirms or rolls back
  }
);
```

<!-- Truncated for brevity -- actual output is typically 600-1200 lines -->
