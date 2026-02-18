# Flow Tree -- TaskFlow

**Project:** TaskFlow
**Created:** 2026-02-01
**Version:** 1.0.0
**Total Screens:** 32

---

## Executive Summary

This document provides a **Mobbin-style Flow Tree** enumerating every screen in TaskFlow before any wireframes are built.

### Screen Count by Category

| Category | Screens | Sub-flows |
|----------|---------|-----------|
| Auth & Onboarding | 5 | 2 |
| Dashboard | 3 | 1 |
| Boards | 6 | 2 |
| Task Detail | 4 | 1 |
| Team Management | 4 | 1 |
| Settings | 6 | 3 |
| Modals & Overlays | 4 | - |
| **TOTAL** | **32** | **10** |

---

## Visual Flow Tree

```
                                    +-------------------+
                                    |    APP ENTRY      |
                                    +--------+----------+
                                             |
                         +-------------------+-------------------+
                         |                                       |
                         v                                       v
                +----------------+                      +----------------+
                |   AUTH FLOW    |                      | ONBOARDING FLOW|
                |  (3 screens)   |                      |  (2 screens)   |
                +--------+-------+                      +--------+-------+
                         |                                       |
                         +-------------------+-------------------+
                                             |
                                             v
                    +----------------------------------------------+
                    |                MAIN APP SHELL                  |
                    |  +------------------------------------------+ |
                    |  |  [Logo]  Dashboard | Boards | Team | ... | |
                    |  +------------------------------------------+ |
                    +----------------------+-----------------------+
                                           |
         +-----------------+---------------+--------------+----------------+
         |                 |                              |                |
         v                 v                              v                v
+----------------+ +----------------+            +----------------+ +----------------+
|   DASHBOARD    | |    BOARDS      |            |     TEAM       | |   SETTINGS     |
|  (3 screens)   | |  (6 screens)   |            |  (4 screens)   | |  (6 screens)   |
+----------------+ +-------+--------+            +----------------+ +----------------+
                           |
                           v
                   +----------------+
                   |  TASK DETAIL   |
                   |  (4 screens)   |
                   +----------------+
```

---

## 1. Auth Flow (3 screens)

### 1.1 Sign In

| Attribute | Value |
|-----------|-------|
| **ID** | `auth-sign-in` |
| **Priority** | P0 |
| **Complexity** | Simple |
| **Entry** | App cold start (unauthenticated) |
| **Exit** | -> Dashboard or Onboarding |

**Content:**
- Email + password form
- "Sign in with Google" button
- "Forgot password?" link
- "Create account" link

### 1.2 Sign Up

| Attribute | Value |
|-----------|-------|
| **ID** | `auth-sign-up` |
| **Priority** | P0 |
| **Complexity** | Simple |
| **Entry** | "Create account" link |
| **Exit** | -> Onboarding |

**Content:**
- Name, email, password fields
- "Sign up with Google" button
- Terms acceptance checkbox

### 1.3 Forgot Password

| Attribute | Value |
|-----------|-------|
| **ID** | `auth-forgot-password` |
| **Priority** | P1 |
| **Complexity** | Simple |
| **Entry** | "Forgot password?" link |
| **Exit** | -> Sign In (after reset) |

---

## 2. Onboarding Flow (2 screens)

### 2.1 Create Workspace

| Attribute | Value |
|-----------|-------|
| **ID** | `onboard-create-workspace` |
| **Priority** | P0 |
| **Complexity** | Simple |
| **Entry** | First sign-up |
| **Exit** | -> Board Template Picker |

**Content:**
- Workspace name input
- URL slug preview
- [Create Workspace] CTA

### 2.2 Board Template Picker

| Attribute | Value |
|-----------|-------|
| **ID** | `onboard-template-picker` |
| **Priority** | P0 |
| **Complexity** | Medium |
| **Entry** | After workspace creation |
| **Exit** | -> Board View (first board) |

**Content:**
- Template cards: "Software Sprint", "Marketing Campaign", "Blank Board"
- Preview thumbnails
- [Start with this template] button
- "Skip and create blank" link

---

## 3. Dashboard (3 screens)

### 3.1 Dashboard Home

| Attribute | Value |
|-----------|-------|
| **ID** | `dashboard-home` |
| **Priority** | P0 |
| **Complexity** | Medium |
| **Entry** | App shell default |
| **Exit** | -> Board View, Task Detail |

**Content:**
- "My Tasks" section (assigned to current user, sorted by due date)
- Recent activity feed
- Quick stats: open tasks, completed this week, overdue count

### 3.2 My Tasks View

| Attribute | Value |
|-----------|-------|
| **ID** | `dashboard-my-tasks` |
| **Priority** | P0 |
| **Complexity** | Medium |
| **Entry** | Dashboard "My Tasks" section |
| **Exit** | -> Task Detail |

### 3.3 Activity Feed (Full)

| Attribute | Value |
|-----------|-------|
| **ID** | `dashboard-activity` |
| **Priority** | P1 |
| **Complexity** | Simple |
| **Entry** | "View all activity" link |
| **Exit** | -> Task Detail, Board View |

---

## 4. Boards (6 screens)

### 4.1 Board List

| Attribute | Value |
|-----------|-------|
| **ID** | `boards-list` |
| **Priority** | P0 |
| **Complexity** | Simple |
| **Entry** | Sidebar "Boards" |
| **Exit** | -> Board View |

### 4.2 Board View (Kanban)

| Attribute | Value |
|-----------|-------|
| **ID** | `boards-kanban` |
| **Priority** | P0 |
| **Complexity** | High |
| **Entry** | Board list click, direct URL |
| **Exit** | -> Task Detail, Board Settings |

**Content:**
- Column headers with task count
- Draggable task cards
- "Add task" button per column
- "Add column" button
- Filter/sort toolbar

<!-- Truncated for brevity -- actual output is typically 300-600 lines -->
