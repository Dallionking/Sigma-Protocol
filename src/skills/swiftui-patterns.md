---
name: swiftui-patterns
description: "SwiftUI development patterns for iOS 17+ with @Observable MVVM, NavigationStack, SwiftData, #Preview workflows, performance optimization, Apple HIG compliance, Liquid Glass (iOS 26+), and Xcode MCP integration."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - swiftui
  - swift
  - ios-native
  - xcode
---

# SwiftUI Patterns Skill

This skill guides creation of **modern, production-grade SwiftUI applications** targeting iOS 17+ with current best practices. It enforces the latest APIs, deprecates legacy patterns, and ensures Apple Human Interface Guidelines compliance.

## When to Invoke

Invoke this skill when:
- Building native iOS/iPadOS/macOS applications with SwiftUI
- Designing view architecture or navigation flows
- Working with SwiftData persistence
- Writing or reviewing Swift UI code
- Optimizing SwiftUI view performance
- Setting up Xcode projects via MCP tooling

---

## MVVM with @Observable (iOS 17+)

The `@Observable` macro replaces `ObservableObject` and eliminates the need for `@Published` property wrappers. Views automatically track which properties they read and only re-render when those specific properties change.

### Bad Pattern

```swift
// DEPRECATED: ObservableObject with @Published (iOS 13-16 era)
class ProfileViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var email: String = ""
    @Published var isLoading: Bool = false

    func load() {
        isLoading = true
        Task {
            let profile = try await api.fetchProfile()
            await MainActor.run {
                self.name = profile.name
                self.email = profile.email
                self.isLoading = false
            }
        }
    }
}

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()

    var body: some View {
        // Re-renders when ANY @Published property changes,
        // even if this view only reads `name`
        Text(viewModel.name)
            .onAppear { viewModel.load() }
    }
}
```

### Good Pattern

```swift
// MODERN: @Observable macro (iOS 17+)
@Observable
class ProfileViewModel {
    var name: String = ""
    var email: String = ""
    var isLoading: Bool = false

    func load() async throws {
        isLoading = true
        let profile = try await api.fetchProfile()
        name = profile.name
        email = profile.email
        isLoading = false
    }
}

struct ProfileView: View {
    // Use @State for owned view models
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        // Only re-renders when `name` or `isLoading` change
        // because those are the only properties read here
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else {
                Text(viewModel.name)
            }
        }
        .task { try? await viewModel.load() }
    }
}

// Use @Bindable for two-way bindings to @Observable properties
struct ProfileEditView: View {
    @Bindable var viewModel: ProfileViewModel

    var body: some View {
        Form {
            TextField("Name", text: $viewModel.name)
            TextField("Email", text: $viewModel.email)
        }
    }
}
```

### Key Rules

- Use `@State` to own an `@Observable` object in a view
- Use `@Bindable` when you need `$` binding syntax on an `@Observable` object passed from a parent
- Use `@Environment` to inject shared `@Observable` objects via the environment
- Never use `@StateObject`, `@ObservedObject`, or `@Published` in new iOS 17+ code

---

## Navigation with NavigationStack

`NavigationStack` replaces the deprecated `NavigationView` and supports typed, programmatic, deep-linkable navigation via `NavigationPath`.

### Bad Pattern

```swift
// DEPRECATED: NavigationView (iOS 13-15)
struct AppView: View {
    var body: some View {
        NavigationView {
            List(items) { item in
                NavigationLink(destination: DetailView(item: item)) {
                    Text(item.title)
                }
            }
            .navigationTitle("Items")
        }
        .navigationViewStyle(.stack) // Required workaround for iPad
    }
}
```

### Good Pattern

```swift
// MODERN: NavigationStack with typed destinations (iOS 16+)
@Observable
class Router {
    var path = NavigationPath()

    func navigate(to destination: AppDestination) {
        path.append(destination)
    }

    func popToRoot() {
        path.removeLast(path.count)
    }
}

enum AppDestination: Hashable {
    case itemDetail(Item)
    case settings
    case profile(userId: String)
}

struct AppView: View {
    @State private var router = Router()

    var body: some View {
        NavigationStack(path: $router.path) {
            ItemListView()
                .navigationDestination(for: AppDestination.self) { destination in
                    switch destination {
                    case .itemDetail(let item):
                        ItemDetailView(item: item)
                    case .settings:
                        SettingsView()
                    case .profile(let userId):
                        ProfileView(userId: userId)
                    }
                }
        }
        .environment(router)
    }
}

// Deep link handling
struct AppView_DeepLink: View {
    @State private var router = Router()

    func handleDeepLink(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let host = components.host else { return }

        switch host {
        case "item":
            if let id = components.queryItems?.first(where: { $0.name == "id" })?.value {
                router.navigate(to: .itemDetail(Item(id: id)))
            }
        case "settings":
            router.navigate(to: .settings)
        default:
            break
        }
    }
}
```

---

## Data Persistence with SwiftData

SwiftData replaces the manual Core Data stack with a declarative, macro-driven API. Use `@Model` instead of `NSManagedObject` subclasses.

### Bad Pattern

```swift
// LEGACY: Manual Core Data stack setup
class CoreDataStack {
    static let shared = CoreDataStack()
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "Model")
        container.loadPersistentStores { _, error in
            if let error = error { fatalError("Core Data error: \(error)") }
        }
        return container
    }()
    var context: NSManagedObjectContext {
        persistentContainer.viewContext
    }
}

// Manual NSManagedObject subclass
class TaskEntity: NSManagedObject {
    @NSManaged var title: String
    @NSManaged var isCompleted: Bool
    @NSManaged var createdAt: Date
}
```

### Good Pattern

```swift
// MODERN: SwiftData with @Model (iOS 17+)
@Model
class TaskItem {
    var title: String
    var isCompleted: Bool
    var createdAt: Date
    @Relationship(deleteRule: .cascade) var subtasks: [Subtask]

    init(title: String, isCompleted: Bool = false) {
        self.title = title
        self.isCompleted = isCompleted
        self.createdAt = .now
        self.subtasks = []
    }
}

@Model
class Subtask {
    var title: String
    var isCompleted: Bool
    var task: TaskItem?

    init(title: String) {
        self.title = title
        self.isCompleted = false
    }
}

// App setup with ModelContainer
@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: [TaskItem.self, Subtask.self])
    }
}

// Querying with @Query and #Predicate
struct TaskListView: View {
    @Query(
        filter: #Predicate<TaskItem> { !$0.isCompleted },
        sort: \TaskItem.createdAt,
        order: .reverse
    )
    private var pendingTasks: [TaskItem]

    @Environment(\.modelContext) private var modelContext

    var body: some View {
        List(pendingTasks) { task in
            TaskRow(task: task)
                .swipeActions {
                    Button("Complete") {
                        task.isCompleted = true
                        // SwiftData auto-saves on context changes
                    }
                }
        }
        .toolbar {
            Button("Add") {
                let task = TaskItem(title: "New Task")
                modelContext.insert(task)
            }
        }
    }
}

// CloudKit sync (add to ModelContainer configuration)
// .modelContainer(for: TaskItem.self, isAutosaveEnabled: true,
//     configurations: ModelConfiguration(cloudKitDatabase: .automatic))
```

---

## Previews with #Preview Macro

The `#Preview` macro replaces `PreviewProvider` structs. Combined with Prefire for snapshot generation and ViewInspector for unit tests.

### Bad Pattern

```swift
// DEPRECATED: PreviewProvider protocol (iOS 13-16)
struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            ProfileView(name: "Alice")
                .previewDisplayName("Default")
            ProfileView(name: "Alice")
                .preferredColorScheme(.dark)
                .previewDisplayName("Dark Mode")
        }
    }
}
```

### Good Pattern

```swift
// MODERN: #Preview macro (iOS 17+)
#Preview("Default") {
    ProfileView(name: "Alice")
}

#Preview("Dark Mode", traits: .fixedLayout(width: 390, height: 200)) {
    ProfileView(name: "Alice")
        .preferredColorScheme(.dark)
}

#Preview("With SwiftData") {
    let config = ModelConfiguration(isStoredInMemoryOnly: true)
    let container = try! ModelContainer(
        for: TaskItem.self,
        configurations: config
    )
    let task = TaskItem(title: "Sample Task")
    container.mainContext.insert(task)

    return TaskRow(task: task)
        .modelContainer(container)
}

// Landscape and device variations
#Preview("iPad Landscape", traits: .landscapeLeft) {
    ContentView()
}

// Snapshot testing with Prefire (auto-generates from #Preview)
// 1. Add Prefire package
// 2. Prefire scans all #Preview declarations
// 3. Generates XCTest snapshot tests automatically
// Run: swift test --filter PrefireTests

// Unit testing views with ViewInspector
import ViewInspector

struct ProfileView: View, Inspectable {
    let name: String
    var body: some View {
        Text("Hello, \(name)")
    }
}

func testProfileViewDisplaysName() throws {
    let view = ProfileView(name: "Alice")
    let text = try view.inspect().find(text: "Hello, Alice")
    XCTAssertNotNil(text)
}
```

---

## Performance Optimization

SwiftUI re-evaluates view bodies frequently. Understand the rendering pipeline to avoid unnecessary work.

### Bad Pattern

```swift
// SLOW: VStack with hundreds of items (all created eagerly)
struct BadFeedView: View {
    let posts: [Post] // 500+ items

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                ForEach(posts) { post in
                    PostCard(post: post)
                }
            }
        }
    }
}

// SLOW: Expensive computation in body
struct BadStatsView: View {
    let transactions: [Transaction]

    var body: some View {
        // Recalculates on EVERY re-render
        let total = transactions.reduce(0) { $0 + $1.amount }
        let average = total / Double(transactions.count)
        Text("Avg: \(average, format: .currency(code: "USD"))")
    }
}
```

### Good Pattern

```swift
// FAST: LazyVStack only creates visible items
struct GoodFeedView: View {
    let posts: [Post]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                ForEach(posts) { post in
                    PostCard(post: post)
                        .id(post.id)
                }
            }
        }
    }
}

// FAST: Use .task for async loading, cache computed values
struct GoodStatsView: View {
    let transactions: [Transaction]

    // Cache expensive computation
    private var stats: Stats {
        Stats(transactions: transactions)
    }

    var body: some View {
        Text("Avg: \(stats.average, format: .currency(code: "USD"))")
    }
}

// Equatable views skip re-evaluation when inputs unchanged
struct PostCard: View, Equatable {
    let post: Post

    static func == (lhs: PostCard, rhs: PostCard) -> Bool {
        lhs.post.id == rhs.post.id &&
        lhs.post.updatedAt == rhs.post.updatedAt
    }

    var body: some View {
        VStack(alignment: .leading) {
            Text(post.title).font(.headline)
            Text(post.summary).font(.subheadline)
        }
    }
}

// Use .task for async work (cancels automatically on view disappear)
struct AsyncImageView: View {
    let url: URL
    @State private var image: UIImage?

    var body: some View {
        Group {
            if let image {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                ProgressView()
            }
        }
        .task(id: url) {
            image = try? await ImageLoader.shared.load(url)
        }
    }
}
```

### Performance Rules

- Use `LazyVStack` / `LazyHStack` for lists with 20+ items
- Use `.task` instead of `.onAppear` for async work (auto-cancels)
- Avoid complex expressions in `body` -- extract to computed properties
- Use `.id()` on list items to help SwiftUI diff efficiently
- Conform to `Equatable` on expensive leaf views
- Profile with Instruments > SwiftUI template to find slow views

---

## Apple HIG Compliance

Follow the Apple Human Interface Guidelines for platform-native feel.

### SF Symbols 6

```swift
// Use SF Symbols for consistent, scalable iconography
Label("Favorites", systemImage: "heart.fill")

// Symbol effects (iOS 17+)
Image(systemName: "wifi")
    .symbolEffect(.variableColor.iterative)

Image(systemName: "arrow.down.circle")
    .symbolEffect(.bounce, value: downloadCount)

// Symbol rendering modes
Image(systemName: "chart.bar.fill")
    .symbolRenderingMode(.palette)
    .foregroundStyle(.blue, .gray)
```

### Dynamic Type Support

```swift
// REQUIRED: Support Dynamic Type for accessibility
struct AccessibleCard: View {
    let title: String
    let subtitle: String

    @ScaledMetric(relativeTo: .body) private var iconSize = 24.0

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "star.fill")
                .frame(width: iconSize, height: iconSize)
            VStack(alignment: .leading) {
                Text(title)
                    .font(.headline) // Scales with Dynamic Type
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}
```

### Touch Targets and Safe Areas

```swift
// REQUIRED: Minimum 44pt touch targets
Button(action: handleTap) {
    Image(systemName: "xmark")
        .frame(minWidth: 44, minHeight: 44)
}

// Respect safe areas
struct ContentView: View {
    var body: some View {
        ScrollView {
            content
                .padding(.horizontal)
        }
        .safeAreaInset(edge: .bottom) {
            ActionBar()
                .background(.ultraThinMaterial)
        }
    }
}
```

---

## Liquid Glass (iOS 26+)

iOS 26 introduces the Liquid Glass design language. Use the `.glassEffect` modifier for adaptive, translucent surfaces that respond to content beneath them.

### Bad Pattern

```swift
// OUTDATED: Manual blur + opacity for glass effect
struct OldGlassCard: View {
    var body: some View {
        content
            .background(.ultraThinMaterial) // Pre-Liquid Glass
            .clipShape(RoundedRectangle(cornerRadius: 20))
    }
}
```

### Good Pattern

```swift
// MODERN: Liquid Glass (iOS 26+)
struct GlassCard: View {
    var body: some View {
        content
            .glassEffect(.regular) // Adaptive Liquid Glass surface
            .padding()
    }
}

// Glass effect on tab bars and navigation
TabView {
    HomeView().tabItem { Label("Home", systemImage: "house") }
    SearchView().tabItem { Label("Search", systemImage: "magnifyingglass") }
}
.glassEffect(.regular) // Tab bar becomes Liquid Glass

// Haptic integration for glass interactions
struct InteractiveGlassButton: View {
    var body: some View {
        Button("Confirm") { /* action */ }
            .glassEffect(.regular)
            .sensoryFeedback(.impact(weight: .medium), trigger: isTapped)
    }
}

// Adaptive backgrounds that complement glass
struct AdaptiveBackground: View {
    var body: some View {
        ZStack {
            // Rich background for glass to adapt to
            LinearGradient(
                colors: [.blue, .purple],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack {
                Text("Dashboard")
                    .font(.largeTitle.bold())
                    .glassEffect(.regular) // Text container with glass
            }
        }
    }
}
```

### Liquid Glass Rules

- Use `.glassEffect(.regular)` for standard translucent surfaces
- Provide rich backgrounds so glass has content to adapt to
- Combine with `.sensoryFeedback()` for tactile interaction
- Test on both light and dark appearances -- glass adapts automatically
- Falls back gracefully on older OS versions (check `#available(iOS 26, *)`)

---

## Xcode MCP Integration

When using Claude Code with Xcode MCP bridge tools, leverage these for build-test-preview workflows.

### Available Tools

```
xcode_build        -- Build the project or specific scheme
xcode_test         -- Run test suites
xcode_preview      -- Generate SwiftUI preview snapshots
xcode_resolve_issues -- Resolve build errors and warnings
```

### Workflow Pattern

```
1. Edit Swift files in Claude Code
2. xcode_build -- verify compilation
3. xcode_test -- run affected test suites
4. xcode_preview -- verify UI renders correctly
5. xcode_resolve_issues -- fix any warnings/errors
```

### Integration Example

```bash
# Build a specific scheme
xcrun mcpbridge xcode_build --scheme "MyApp" --configuration Debug

# Run tests for a specific target
xcrun mcpbridge xcode_test --scheme "MyAppTests" --test-plan "UnitTests"

# Generate preview snapshots
xcrun mcpbridge xcode_preview --file "Sources/Views/ProfileView.swift"

# Resolve build issues
xcrun mcpbridge xcode_resolve_issues --scheme "MyApp"
```

---

## SwiftUI Checklist

Before submitting any SwiftUI code:

### Architecture
- [ ] Using `@Observable` (not `ObservableObject`) for iOS 17+
- [ ] View models owned with `@State`, passed with `@Bindable`
- [ ] Navigation uses `NavigationStack` with typed destinations
- [ ] Deep linking handled via `NavigationPath` manipulation

### Data
- [ ] SwiftData `@Model` for persistence (not raw Core Data)
- [ ] `@Query` with `#Predicate` for filtered/sorted fetches
- [ ] `ModelContainer` configured at app level

### Previews
- [ ] `#Preview` macro (not `PreviewProvider`)
- [ ] Preview variants for dark mode, accessibility sizes, device types
- [ ] In-memory `ModelContainer` for data-dependent previews

### Performance
- [ ] `LazyVStack`/`LazyHStack` for long lists
- [ ] `.task` for async work (not `.onAppear` with `Task {}`)
- [ ] Expensive leaf views conform to `Equatable`
- [ ] No heavy computation directly in `body`

### HIG Compliance
- [ ] SF Symbols for icons (not custom assets where avoidable)
- [ ] Dynamic Type supported (no fixed font sizes)
- [ ] Minimum 44pt touch targets on interactive elements
- [ ] Safe areas respected

---

## Integration with Sigma Protocol

### Step 2 (Architecture)
Reference @Observable MVVM and NavigationStack patterns when designing iOS app architecture.

### Step 8 (Technical Spec)
Include SwiftData schema design, navigation graph, and concurrency model in technical specifications.

### /implement-prd
Apply these patterns when implementing PRD features for native iOS targets.

### /security-audit
Combine with `mobile-app-security` skill for iOS-specific secure coding.

---

*SwiftUI rewards declarative thinking. Describe what the UI should look like for a given state, and let the framework handle the transitions. Fight the urge to imperatively manage view lifecycle -- trust the system.*
