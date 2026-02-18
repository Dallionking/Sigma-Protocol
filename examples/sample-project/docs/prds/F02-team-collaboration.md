# Feature PRD: F02 -- Team Collaboration

**Feature:** Team Collaboration (Epic E2)
**Version:** 1.0.0
**Priority:** P0
**Sprint:** 1-2
**Total Estimate:** 14 points

---

## Overview

Team Collaboration enables multiple people to work together in TaskFlow. This covers workspace membership, comments on tasks, real-time updates, and file attachments.

---

## User Stories

### US-1: Invite Team Members
**As a** workspace owner,
**I want to** invite people by email,
**So that** my team can collaborate on boards.

**Acceptance Criteria:**
- [ ] "Invite" button on Team page
- [ ] Enter email address, select role (admin/member)
- [ ] Invitee receives email with join link
- [ ] Pending invitations shown in member list
- [ ] Revoke invitation before acceptance
- [ ] Free plan: maximum 5 members

### US-2: Comment on Tasks
**As a** team member,
**I want to** leave comments on tasks,
**So that** I can discuss work without leaving the tool.

**Acceptance Criteria:**
- [ ] Comment input at bottom of task detail
- [ ] Markdown rendering (bold, italic, code, links)
- [ ] @mention teammates (autocomplete dropdown)
- [ ] Edit and delete own comments
- [ ] Timestamps with relative time ("2 hours ago")
- [ ] Comments appear in real time for all viewers

### US-3: See Changes in Real Time
**As a** team member,
**I want to** see my teammates' changes instantly,
**So that** I always have an accurate view of the board.

**Acceptance Criteria:**
- [ ] Task moves reflect on all connected clients within 500ms
- [ ] New tasks appear without page refresh
- [ ] Edits to task fields update live
- [ ] Avatar presence dots on board (who is viewing)
- [ ] "Sarah is typing..." indicator in comments

### US-4: Attach Files
**As a** team member,
**I want to** attach files to tasks,
**So that** relevant documents are easy to find.

**Acceptance Criteria:**
- [ ] Drag file onto task detail to upload
- [ ] File picker button as alternative
- [ ] Image files show inline preview
- [ ] Non-image files show icon + filename
- [ ] 10MB per file limit, toast error if exceeded
- [ ] Download button on each attachment

---

## Technical Requirements

| Function | Type | Description |
|----------|------|-------------|
| `members:invite` | Mutation | Send invitation email |
| `members:list` | Query | Workspace member list |
| `comments:create` | Mutation | Add comment to task |
| `comments:list` | Query | Comments for a task |
| `attachments:upload` | Action | Upload file to Convex Storage |
| `attachments:list` | Query | Attachments for a task |

---

## Edge Cases

| Case | Handling |
|------|----------|
| Invite already-registered user | Auto-add to workspace, skip email |
| Remove member with assigned tasks | Unassign their tasks, notify board admins |
| @mention non-member | Do not resolve, show as plain text |
| Upload unsupported file type | Allow all types, just no preview for unknown |

<!-- Truncated for brevity -- actual output is typically 200-400 lines -->
