# Interface States -- TaskFlow

**Project:** TaskFlow
**Version:** 1.0.0
**Created:** 2026-02-01
**Step:** 7 - Interface States

---

## Overview

Every component in TaskFlow must handle all possible states. This document specifies the visual and behavioral design for each state.

---

## 1. Global States

### Connection Status

| State | Visual | Behavior |
|-------|--------|----------|
| **Connected** | No indicator (default) | Real-time updates active |
| **Connecting** | Yellow dot in header | Attempting connection |
| **Reconnecting** | Yellow banner: "Reconnecting..." | Auto-retry, show cached data |
| **Disconnected** | Red banner: "Offline -- changes will sync when reconnected" | Queue mutations locally |

### Authentication Status

| State | Visual | Behavior |
|-------|--------|----------|
| **Authenticated** | Normal app | Full functionality |
| **Session Expiring** | Toast: "Session expires in 5 min" | Auto-refresh token |
| **Session Expired** | Modal: "Please sign in again" | Redirect to auth |

---

## 2. Data Loading States

### Skeleton Screens

```
+---------------------------------------+
| ==================                    |  <- Shimmer animation
| =========  =========  =========      |
|                                       |
| +-----------------------------------+ |
| | ====================              | |
| | =========  =========              | |
| +-----------------------------------+ |
+---------------------------------------+
```

**Shimmer Animation:**
```css
.skeleton {
  background: linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Loading Indicators

| Context | Indicator |
|---------|-----------|
| Page load | Skeleton screen |
| Board load | Column skeletons with card placeholders |
| Task action | Spinner replaces button text |
| Background sync | Small spinner in header |
| Drag-and-drop | Optimistic update (instant visual) |

---

## 3. Empty States

### No Boards

```
+---------------------------------------+
|                                       |
|         [Board icon]                  |
|                                       |
|    No boards yet                      |
|                                       |
|    Create your first board to         |
|    start organizing tasks.            |
|                                       |
|    [Create Board]                     |
|                                       |
+---------------------------------------+
```

### No Tasks in Column

```
+-------------------+
|                   |
|  No tasks here    |
|                   |
|  Drag tasks in    |
|  or click [+]     |
|                   |
+-------------------+
```

### No Search Results

```
+---------------------------------------+
|                                       |
|    No results for "search term"       |
|                                       |
|    Try adjusting your search or       |
|    check your filters.                |
|                                       |
+---------------------------------------+
```

---

## 4. Error States

### API Error

```
+---------------------------------------+
|  [!] Something went wrong             |
|                                       |
|  We could not load your boards.       |
|  Please try again.                    |
|                                       |
|  [Retry]          [Contact Support]   |
+---------------------------------------+
```

### Validation Errors

| Field State | Visual |
|-------------|--------|
| Default | Gray border |
| Focused | Brand-colored border + ring |
| Error | Red border + error message below |
| Success | Green border (brief flash) |

### Permission Denied

```
+---------------------------------------+
|                                       |
|  You don't have access to this board  |
|                                       |
|  Ask the workspace admin for          |
|  permission.                          |
|                                       |
|  [Go to Dashboard]                    |
|                                       |
+---------------------------------------+
```

---

## 5. Task Card States

| State | Visual Change |
|-------|--------------|
| **Default** | Card with subtle shadow |
| **Hover** | Elevated shadow, slight scale |
| **Dragging** | Larger shadow, slight rotation, opacity on source |
| **Drop Target** | Blue dashed border on target column |
| **Completed** | Title strikethrough, muted colors, check icon |
| **Overdue** | Red left border accent |
| **Due Soon** | Amber left border accent |

<!-- Truncated for brevity -- actual output is typically 300-500 lines -->
