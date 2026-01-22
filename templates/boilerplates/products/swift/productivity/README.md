# Swift Productivity App Boilerplate

> Native iOS productivity application with iCloud sync, widgets, and Shortcuts integration

## Overview

The Swift Productivity boilerplate provides a production-ready native iOS productivity application foundation. Built for apps like task managers, note-taking apps, habit trackers, and personal organization tools that benefit from deep Apple ecosystem integration.

## Why Swift for Productivity Apps?

- **iCloud Sync**: Seamless CloudKit/SwiftData sync across devices
- **Widgets**: Rich widget support for quick actions and glances
- **Shortcuts**: Siri and Shortcuts app integration via App Intents
- **Focus Modes**: Integration with Focus mode filtering
- **Apple Watch**: Native watchOS companion for quick capture

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   📝 Tasks      │  │   ⌚ Watch      │  │   🔲 Widget     │
│                 │  │                 │  │                 │
│  Today          │  │  Today's Tasks  │  │  ┌───────────┐  │
│  ───────────    │  │  ───────────    │  │  │ ☐ Task 1  │  │
│  ☐ Buy milk    │  │  ☐ Buy milk    │  │  │ ☐ Task 2  │  │
│  ☐ Call mom    │  │  ☐ Call mom    │  │  │ ☐ Task 3  │  │
│  ☑ Exercise    │  │  [ + Add ]      │  │  └───────────┘  │
│                 │  │                 │  │                 │
│  [ + Add Task ] │  │                 │  │  [ + Add ]      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Project Structure

```
SwiftProductivity/
├── SwiftProductivity/
│   ├── App/
│   │   ├── SwiftProductivityApp.swift
│   │   └── AppState.swift
│   ├── Features/
│   │   ├── Tasks/
│   │   │   ├── TaskListView.swift
│   │   │   ├── TaskDetailView.swift
│   │   │   ├── TaskEditorView.swift
│   │   │   └── TaskViewModel.swift
│   │   ├── Projects/
│   │   │   ├── ProjectListView.swift
│   │   │   └── ProjectViewModel.swift
│   │   ├── Calendar/
│   │   │   ├── CalendarView.swift
│   │   │   └── CalendarViewModel.swift
│   │   ├── Search/
│   │   │   └── SearchView.swift
│   │   └── Settings/
│   │       └── SettingsView.swift
│   ├── Core/
│   │   ├── Models/
│   │   │   ├── Task.swift
│   │   │   ├── Project.swift
│   │   │   ├── Tag.swift
│   │   │   └── Reminder.swift
│   │   ├── Services/
│   │   │   ├── TaskService.swift
│   │   │   ├── NotificationService.swift
│   │   │   └── SyncService.swift
│   │   ├── Intents/
│   │   │   ├── AddTaskIntent.swift
│   │   │   ├── CompleteTaskIntent.swift
│   │   │   └── AppShortcuts.swift
│   │   └── Utilities/
│   │       └── DateHelpers.swift
│   ├── UI/
│   │   ├── Components/
│   │   │   ├── TaskRow.swift
│   │   │   ├── ProjectCard.swift
│   │   │   ├── TagPill.swift
│   │   │   └── PriorityIndicator.swift
│   │   └── Styles/
│   │       └── ProductivityTheme.swift
│   └── Resources/
│       └── Assets.xcassets
├── SwiftProductivityWidget/
│   ├── TaskListWidget.swift
│   ├── QuickAddWidget.swift
│   └── UpcomingWidget.swift
├── SwiftProductivityWatch/
│   ├── SwiftProductivityWatchApp.swift
│   ├── TaskListView.swift
│   ├── QuickAddView.swift
│   └── Complications/
├── SwiftProductivityIntents/
│   └── IntentHandler.swift
├── SwiftProductivityTests/
└── SwiftProductivity.xcodeproj
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| UI Framework | SwiftUI (iOS 17+) |
| Data | SwiftData + CloudKit |
| Sync | CloudKit (automatic via SwiftData) |
| Widgets | WidgetKit |
| Shortcuts | App Intents |
| Notifications | UserNotifications |
| Watch | watchOS 10+ |

## Key Features

### ✅ Task Management
- Create, edit, delete tasks
- Due dates and reminders
- Priority levels
- Tags and projects
- Subtasks support

### 🔄 iCloud Sync
- Automatic sync via SwiftData
- Cross-device (iPhone, iPad, Mac)
- Conflict resolution
- Offline support

### 📱 Widgets
- Task list widget
- Quick add widget
- Upcoming tasks widget
- Lock screen widgets

### 🗣️ Siri & Shortcuts
- "Add task" voice command
- "Show today's tasks"
- Custom shortcuts
- Shortcuts app integration

### ⌚ Apple Watch
- Task list glance
- Quick add from wrist
- Complications
- Haptic reminders

## SwiftData with CloudKit

```swift
// Core/Models/Task.swift
import SwiftData

@Model
class Task {
    @Attribute(.unique) var id: UUID
    var title: String
    var notes: String?
    var isCompleted: Bool
    var dueDate: Date?
    var priority: Priority
    var createdAt: Date
    var completedAt: Date?
    
    @Relationship(deleteRule: .nullify, inverse: \Project.tasks)
    var project: Project?
    
    @Relationship(deleteRule: .cascade)
    var subtasks: [Subtask]
    
    @Relationship
    var tags: [Tag]
}

// Automatic CloudKit sync via container configuration
@main
struct SwiftProductivityApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [Task.self, Project.self, Tag.self], 
                       isAutosaveEnabled: true,
                       isCloudKitSyncEnabled: true)
    }
}
```

## App Intents (Shortcuts)

```swift
// Core/Intents/AddTaskIntent.swift
import AppIntents

struct AddTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Add Task"
    static var description = IntentDescription("Add a new task to your list")
    
    @Parameter(title: "Task Title")
    var title: String
    
    @Parameter(title: "Due Date")
    var dueDate: Date?
    
    @Parameter(title: "Priority")
    var priority: PriorityEntity?
    
    static var parameterSummary: some ParameterSummary {
        Summary("Add \(\.$title)") {
            \.$dueDate
            \.$priority
        }
    }
    
    func perform() async throws -> some IntentResult {
        let task = Task(
            id: UUID(),
            title: title,
            dueDate: dueDate,
            priority: priority?.value ?? .medium
        )
        
        try await TaskService.shared.create(task)
        
        return .result(dialog: "Added '\(title)' to your tasks")
    }
}

// Core/Intents/AppShortcuts.swift
struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddTaskIntent(),
            phrases: [
                "Add a task in \(.applicationName)",
                "Create task in \(.applicationName)",
                "New task \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle"
        )
        
        AppShortcut(
            intent: ShowTodayIntent(),
            phrases: [
                "Show today's tasks in \(.applicationName)",
                "What do I have today in \(.applicationName)"
            ],
            shortTitle: "Today's Tasks",
            systemImageName: "calendar"
        )
    }
}
```

## Widget Implementation

```swift
// SwiftProductivityWidget/TaskListWidget.swift
import WidgetKit
import SwiftUI

struct TaskListWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "TaskListWidget",
            provider: TaskListProvider()
        ) { entry in
            TaskListWidgetView(entry: entry)
        }
        .configurationDisplayName("Tasks")
        .description("View your upcoming tasks")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge,
                          .accessoryRectangular, .accessoryCircular])
    }
}

struct TaskListProvider: TimelineProvider {
    func placeholder(in context: Context) -> TaskListEntry {
        TaskListEntry(date: Date(), tasks: Task.previews)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (TaskListEntry) -> Void) {
        let entry = TaskListEntry(date: Date(), tasks: fetchTasks())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<TaskListEntry>) -> Void) {
        let tasks = fetchTasks()
        let entry = TaskListEntry(date: Date(), tasks: tasks)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func fetchTasks() -> [Task] {
        // Fetch from shared App Group container
        // ...
    }
}

struct TaskListWidgetView: View {
    var entry: TaskListEntry
    @Environment(\.widgetFamily) var family
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallTaskListView(tasks: entry.tasks)
        case .systemMedium:
            MediumTaskListView(tasks: entry.tasks)
        case .accessoryRectangular:
            LockScreenTaskView(tasks: entry.tasks)
        default:
            LargeTaskListView(tasks: entry.tasks)
        }
    }
}
```

## Apple Watch App

```swift
// SwiftProductivityWatch/TaskListView.swift
import SwiftUI

struct WatchTaskListView: View {
    @Query(filter: #Predicate<Task> { !$0.isCompleted },
           sort: \Task.dueDate)
    var tasks: [Task]
    
    var body: some View {
        NavigationStack {
            List {
                ForEach(tasks) { task in
                    WatchTaskRow(task: task)
                }
            }
            .navigationTitle("Tasks")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: QuickAddView()) {
                        Image(systemName: "plus")
                    }
                }
            }
        }
    }
}

struct WatchTaskRow: View {
    @Bindable var task: Task
    
    var body: some View {
        Button {
            withAnimation {
                task.isCompleted.toggle()
            }
        } label: {
            HStack {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(task.isCompleted ? .green : .secondary)
                
                VStack(alignment: .leading) {
                    Text(task.title)
                        .strikethrough(task.isCompleted)
                    
                    if let dueDate = task.dueDate {
                        Text(dueDate, style: .relative)
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .buttonStyle(.plain)
    }
}
```

## Notifications

```swift
// Core/Services/NotificationService.swift
import UserNotifications

class NotificationService {
    static let shared = NotificationService()
    
    func requestAuthorization() async throws -> Bool {
        try await UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        )
    }
    
    func scheduleReminder(for task: Task) async throws {
        guard let dueDate = task.dueDate else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Task Due"
        content.body = task.title
        content.sound = .default
        content.categoryIdentifier = "TASK_DUE"
        content.userInfo = ["taskId": task.id.uuidString]
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: dueDate),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "task-\(task.id)",
            content: content,
            trigger: trigger
        )
        
        try await UNUserNotificationCenter.current().add(request)
    }
    
    func setupCategories() {
        let completeAction = UNNotificationAction(
            identifier: "COMPLETE",
            title: "Complete",
            options: []
        )
        
        let snoozeAction = UNNotificationAction(
            identifier: "SNOOZE",
            title: "Snooze 1 Hour",
            options: []
        )
        
        let category = UNNotificationCategory(
            identifier: "TASK_DUE",
            actions: [completeAction, snoozeAction],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([category])
    }
}
```

## Configuration

```swift
// Core/Config/AppConfig.swift
enum AppConfig {
    static let appGroupId = "group.com.yourcompany.productivity"
    
    enum Sync {
        static let enableiCloudSync = true
        static let syncDebounceSeconds: TimeInterval = 2.0
    }
    
    enum Notifications {
        static let defaultReminderOffset: TimeInterval = -3600 // 1 hour before
        static let enableBadgeCount = true
    }
    
    enum Watch {
        static let enableWatchApp = true
        static let maxTasksOnWatch = 20
    }
    
    enum Widgets {
        static let refreshIntervalMinutes = 15
    }
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [Apple CloudKit Docs](https://developer.apple.com/documentation/cloudkit)
- [App Intents Docs](https://developer.apple.com/documentation/appintents)


