---
name: swift-concurrency
description: "Swift Concurrency patterns covering structured concurrency, actors, Sendable, AsyncSequence, continuation bridging, cancellation, MainActor isolation, and Swift 6 strict concurrency migration."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - swift
  - async
  - concurrency
  - actor
  - sendable
---

# Swift Concurrency Skill

This skill guides correct usage of **Swift's structured concurrency model** including async/await, actors, Sendable, and AsyncSequence. It enforces compile-time data-race safety patterns required for Swift 6 strict concurrency.

## When to Invoke

Invoke this skill when:
- Writing asynchronous Swift code (network calls, file I/O, database queries)
- Designing actor-isolated state management
- Bridging legacy callback/delegate APIs to async/await
- Migrating to Swift 6 strict concurrency mode
- Debugging data races or Sendable conformance errors
- Testing asynchronous code paths

---

## Structured Concurrency

Structured concurrency ties the lifetime of child tasks to their parent scope. Tasks cannot outlive the scope that created them, preventing resource leaks and orphaned work.

### Bad Pattern

```swift
// LEGACY: GCD with manual queue management
func fetchDashboard(completion: @escaping (Dashboard) -> Void) {
    DispatchQueue.global().async {
        let profile = self.fetchProfileSync()
        let stats = self.fetchStatsSync()
        let notifications = self.fetchNotificationsSync()

        DispatchQueue.main.async {
            // No structured cancellation
            // No error propagation
            // Easy to forget calling completion
            completion(Dashboard(profile: profile, stats: stats, notifications: notifications))
        }
    }
}
```

### Good Pattern

```swift
// MODERN: Structured concurrency with async let
func fetchDashboard() async throws -> Dashboard {
    // All three fetches run concurrently
    async let profile = api.fetchProfile()
    async let stats = api.fetchStats()
    async let notifications = api.fetchNotifications()

    // Awaits all results -- if any throws, others are cancelled
    return try await Dashboard(
        profile: profile,
        stats: stats,
        notifications: notifications
    )
}

// TaskGroup for dynamic concurrency (unknown number of tasks)
func fetchAllPages(ids: [String]) async throws -> [Page] {
    try await withThrowingTaskGroup(of: Page.self) { group in
        for id in ids {
            group.addTask {
                try await api.fetchPage(id: id)
            }
        }

        var pages: [Page] = []
        for try await page in group {
            pages.append(page)
        }
        return pages
    }
}

// Limit concurrency to avoid overwhelming the server
func fetchAllPagesThrottled(ids: [String]) async throws -> [Page] {
    try await withThrowingTaskGroup(of: Page.self) { group in
        let maxConcurrent = 5
        var iterator = ids.makeIterator()

        // Seed initial batch
        for _ in 0..<min(maxConcurrent, ids.count) {
            if let id = iterator.next() {
                group.addTask { try await api.fetchPage(id: id) }
            }
        }

        var pages: [Page] = []
        for try await page in group {
            pages.append(page)
            // Add next task as each completes
            if let id = iterator.next() {
                group.addTask { try await api.fetchPage(id: id) }
            }
        }
        return pages
    }
}
```

### Key Rules

- Use `async let` when you know the exact number of concurrent tasks
- Use `TaskGroup` when the number of tasks is dynamic
- Structured tasks automatically cancel children when the parent is cancelled
- Never use `Task { }` (unstructured) when structured concurrency is possible

---

## Actors

Actors provide compile-time data-race safety by isolating their mutable state. Only one task can execute on an actor at a time.

### Bad Pattern

```swift
// UNSAFE: Class with manual synchronization
class AccountManager {
    private var balance: Double = 0
    private let queue = DispatchQueue(label: "account.sync")

    func deposit(_ amount: Double) {
        queue.sync {
            balance += amount // Easy to forget the queue wrapper
        }
    }

    func getBalance() -> Double {
        queue.sync { balance } // Must remember to synchronize every access
    }

    func transfer(to other: AccountManager, amount: Double) {
        queue.sync {
            // DEADLOCK RISK: nested queue.sync on other.queue
            balance -= amount
            other.deposit(amount)
        }
    }
}
```

### Good Pattern

```swift
// SAFE: Actor with compiler-enforced isolation
actor AccountManager {
    private var balance: Double = 0

    func deposit(_ amount: Double) {
        balance += amount // No locks needed -- actor-isolated
    }

    func getBalance() -> Double {
        balance
    }

    func transfer(to other: AccountManager, amount: Double) async {
        guard balance >= amount else { return }
        balance -= amount
        await other.deposit(amount) // Cross-actor call is async
    }
}

// Usage: cross-actor calls require await
let account = AccountManager()
await account.deposit(100.0)
let balance = await account.getBalance()
```

### @MainActor for UI State

```swift
// CORRECT: UI-bound state on MainActor
@MainActor
@Observable
class HomeViewModel {
    var items: [Item] = []
    var isLoading = false
    var errorMessage: String?

    func loadItems() async {
        isLoading = true
        defer { isLoading = false }

        do {
            // Network call runs off MainActor automatically
            items = try await api.fetchItems()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// Views are implicitly @MainActor, so no await needed for @MainActor properties
struct HomeView: View {
    @State private var viewModel = HomeViewModel()

    var body: some View {
        List(viewModel.items) { item in
            Text(item.title)
        }
        .task { await viewModel.loadItems() }
    }
}
```

### Global Actors

```swift
// Custom global actor for database operations
@globalActor
actor DatabaseActor {
    static let shared = DatabaseActor()
}

@DatabaseActor
class DatabaseService {
    private var connection: DatabaseConnection?

    func query(_ sql: String) async throws -> [Row] {
        guard let connection else { throw DatabaseError.notConnected }
        return try await connection.execute(sql)
    }
}

// All methods on this class run on DatabaseActor
// Cross-actor calls from MainActor require await
```

---

## Sendable

`Sendable` marks types that are safe to pass across concurrency boundaries (between actors or tasks). Swift 6 enforces this at compile time.

### Bad Pattern

```swift
// UNSAFE: Non-Sendable reference type passed across isolation
class UserPreferences {
    var theme: String = "light"
    var fontSize: Int = 14
}

func updateUI(preferences: UserPreferences) async {
    // Compiler error in strict concurrency:
    // "Sending 'preferences' risks data races"
    await MainActor.run {
        applyTheme(preferences.theme)
    }
}
```

### Good Pattern

```swift
// SAFE: Struct is implicitly Sendable (all stored properties are Sendable)
struct UserPreferences: Sendable {
    let theme: String
    let fontSize: Int
}

// SAFE: Immutable class can be Sendable
final class AppConfig: Sendable {
    let apiBaseURL: String
    let maxRetries: Int

    init(apiBaseURL: String, maxRetries: Int) {
        self.apiBaseURL = apiBaseURL
        self.maxRetries = maxRetries
    }
}

// SAFE: Actor-isolated types are Sendable by definition
actor SessionManager {
    private var currentToken: String?

    func setToken(_ token: String) {
        currentToken = token
    }

    func getToken() -> String? {
        currentToken
    }
}

// @Sendable closures for cross-isolation use
func performInBackground(_ work: @Sendable () async throws -> Void) async rethrows {
    try await work()
}

// When you must use a non-Sendable type across boundaries
// (use sparingly, with justification)
final class LegacyNetworkClient: @unchecked Sendable {
    private let lock = NSLock()
    private var _session: URLSession

    var session: URLSession {
        lock.lock()
        defer { lock.unlock() }
        return _session
    }
}
```

### Sendable Rules

- `struct` with all-Sendable properties is implicitly Sendable
- `enum` with all-Sendable associated values is implicitly Sendable
- `final class` with only `let` Sendable properties can conform to Sendable
- `actor` types are always Sendable
- Use `@unchecked Sendable` only for types with manual synchronization (document why)
- Mark closures `@Sendable` when they cross isolation boundaries

---

## AsyncSequence

`AsyncSequence` provides an async iteration protocol. Use `AsyncStream` to bridge imperative event sources into the async/await world.

### Bad Pattern

```swift
// LEGACY: Delegate-based event handling
class LocationTracker: NSObject, CLLocationManagerDelegate {
    var onLocationUpdate: ((CLLocation) -> Void)?

    private let manager = CLLocationManager()

    override init() {
        super.init()
        manager.delegate = self
    }

    func startTracking() {
        manager.startUpdatingLocation()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        locations.forEach { onLocationUpdate?($0) }
    }
}

// Awkward callback-based usage
let tracker = LocationTracker()
tracker.onLocationUpdate = { location in
    DispatchQueue.main.async {
        self.updateMap(location)
    }
}
tracker.startTracking()
```

### Good Pattern

```swift
// MODERN: AsyncStream wrapping delegate
class LocationTracker: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: AsyncStream<CLLocation>.Continuation?

    var locations: AsyncStream<CLLocation> {
        AsyncStream { continuation in
            self.continuation = continuation
            continuation.onTermination = { _ in
                self.manager.stopUpdatingLocation()
            }
            manager.delegate = self
            manager.startUpdatingLocation()
        }
    }

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        for location in locations {
            continuation?.yield(location)
        }
    }
}

// Clean async iteration
func trackLocation() async {
    let tracker = LocationTracker()
    for await location in tracker.locations {
        updateMap(location)
        // Automatically stops when task is cancelled
    }
}

// AsyncStream.makeStream for simpler producer/consumer
func notifications() -> AsyncStream<AppNotification> {
    let (stream, continuation) = AsyncStream<AppNotification>.makeStream()

    NotificationCenter.default.addObserver(
        forName: .newNotification,
        object: nil,
        queue: nil
    ) { notification in
        if let appNotification = notification.object as? AppNotification {
            continuation.yield(appNotification)
        }
    }

    continuation.onTermination = { _ in
        NotificationCenter.default.removeObserver(self)
    }

    return stream
}

// Transforming async sequences
func urgentNotifications() async {
    for await notification in notifications().filter({ $0.priority == .urgent }) {
        await showAlert(notification)
    }
}
```

---

## Continuation Bridging

Use `withCheckedContinuation` and `withCheckedThrowingContinuation` to bridge callback-based APIs into async/await. The "checked" variants detect misuse at runtime (resume called zero or multiple times).

### Good Pattern

```swift
// Bridge a completion-handler API
func fetchUserLegacy(id: String, completion: @escaping (Result<User, Error>) -> Void) {
    // Legacy networking code...
}

func fetchUser(id: String) async throws -> User {
    try await withCheckedThrowingContinuation { continuation in
        fetchUserLegacy(id: id) { result in
            switch result {
            case .success(let user):
                continuation.resume(returning: user)
            case .failure(let error):
                continuation.resume(throwing: error)
            }
        }
    }
}

// Bridge a delegate-based API (single result)
func requestCameraPermission() async -> Bool {
    await withCheckedContinuation { continuation in
        AVCaptureDevice.requestAccess(for: .video) { granted in
            continuation.resume(returning: granted)
        }
    }
}

// Bridge UIKit presentation
func presentAlert(title: String, message: String) async -> Bool {
    await withCheckedContinuation { continuation in
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
            continuation.resume(returning: false)
        })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            continuation.resume(returning: true)
        })

        // Present from the key window's root view controller
        rootViewController?.present(alert, animated: true)
    }
}
```

### Continuation Rules

- Always resume exactly once (checked variants crash on misuse, which is better than silent bugs)
- Use `withCheckedThrowingContinuation` when the legacy API can fail
- Use `withCheckedContinuation` when the legacy API always succeeds
- Prefer `withChecked*` over `withUnsafe*` unless you have measured a performance need

---

## Cancellation

Swift concurrency uses cooperative cancellation. Tasks are not forcefully stopped -- they must check for cancellation and exit voluntarily.

### Good Pattern

```swift
// Check cancellation in long-running work
func processLargeDataset(_ items: [DataItem]) async throws -> [Result] {
    var results: [Result] = []

    for item in items {
        // Check before expensive work
        try Task.checkCancellation()

        let result = try await process(item)
        results.append(result)
    }

    return results
}

// Cancellation handler for cleanup
func downloadFile(url: URL, to destination: URL) async throws {
    let (tempURL, _) = try await withTaskCancellationHandler {
        try await URLSession.shared.download(from: url)
    } onCancel: {
        // Clean up partial downloads
        // Note: this runs on an arbitrary thread
        try? FileManager.default.removeItem(at: destination)
    }

    try FileManager.default.moveItem(at: tempURL, to: destination)
}

// Graceful cancellation with partial results
func searchWithTimeout(query: String) async -> [SearchResult] {
    await withTaskGroup(of: [SearchResult].self) { group in
        group.addTask {
            // Returns empty on cancellation instead of throwing
            guard !Task.isCancelled else { return [] }
            return (try? await api.search(query)) ?? []
        }

        group.addTask {
            try? await Task.sleep(for: .seconds(5))
            return [] // Timeout sentinel
        }

        // Return first completed result, cancel the other
        let result = await group.next() ?? []
        group.cancelAll()
        return result
    }
}
```

### Cancellation Rules

- Use `try Task.checkCancellation()` when cancellation should throw
- Use `Task.isCancelled` when you want to handle cancellation gracefully
- Use `withTaskCancellationHandler` when you need cleanup on cancellation
- `.task` modifier on SwiftUI views automatically cancels on view disappear
- Cancellation propagates downward: cancelling a parent cancels all children

---

## Testing Async Code

Swift Testing and XCTest both support async test functions natively.

### Good Pattern

```swift
import Testing

// Swift Testing (modern)
@Test("Fetching profile returns valid user")
func fetchProfile() async throws {
    let api = MockAPI()
    api.stubProfile = User(id: "1", name: "Alice")

    let viewModel = ProfileViewModel(api: api)
    try await viewModel.load()

    #expect(viewModel.name == "Alice")
    #expect(!viewModel.isLoading)
}

@Test("Concurrent fetches complete without data races")
func concurrentAccess() async {
    let account = AccountManager()

    await withTaskGroup(of: Void.self) { group in
        for i in 0..<100 {
            group.addTask {
                await account.deposit(Double(i))
            }
        }
    }

    let balance = await account.getBalance()
    // Sum of 0..<100 = 4950
    #expect(balance == 4950.0)
}

@Test("Cancellation stops processing")
func cancellation() async throws {
    let task = Task {
        try await processLargeDataset(Array(repeating: DataItem(), count: 10000))
    }

    // Cancel immediately
    task.cancel()

    // Should throw CancellationError
    await #expect(throws: CancellationError.self) {
        try await task.value
    }
}

// XCTest (legacy but still supported)
class ProfileViewModelTests: XCTestCase {
    func testLoadProfile() async throws {
        let api = MockAPI()
        let viewModel = ProfileViewModel(api: api)
        try await viewModel.load()
        XCTAssertEqual(viewModel.name, "Alice")
    }
}
```

---

## Swift 6 Strict Concurrency Migration

Swift 6 enables strict concurrency checking by default. Migrate incrementally.

### Migration Checklist

1. **Enable warnings first** (do not jump to errors)
```swift
// Package.swift
.target(
    name: "MyTarget",
    swiftSettings: [
        .enableExperimentalFeature("StrictConcurrency=targeted") // Step 1: warnings
        // .enableExperimentalFeature("StrictConcurrency=complete") // Step 2: errors
    ]
)
```

2. **Fix Sendable conformances** -- the most common migration issue
```swift
// Before: implicit non-Sendable
class Config {
    var apiURL: String
    var timeout: Int
}

// After: make it Sendable (prefer struct if possible)
struct Config: Sendable {
    let apiURL: String
    let timeout: Int
}
```

3. **Add @MainActor to UI types**
```swift
// Before: implicitly main-thread but not annotated
class SettingsViewModel: ObservableObject {
    @Published var theme: String = "light"
}

// After: explicitly MainActor + @Observable
@MainActor
@Observable
class SettingsViewModel {
    var theme: String = "light"
}
```

4. **Bridge legacy code with @preconcurrency**
```swift
// Suppress warnings for imported modules not yet updated
@preconcurrency import LegacySDK

// Mark protocol conformances as pre-concurrency
extension MyClass: @preconcurrency LegacyDelegate {
    func legacyCallback(_ data: LegacyData) {
        // Compiler won't warn about Sendable here
    }
}
```

5. **Audit unstructured Task {} usage**
```swift
// Before: unstructured task captures non-Sendable self
class Manager {
    var data: [String] = []

    func refresh() {
        Task {
            data = try await fetchData() // Warning: capture of non-Sendable self
        }
    }
}

// After: actor-isolated or restructured
actor Manager {
    var data: [String] = []

    func refresh() async throws {
        data = try await fetchData() // Safe: actor-isolated
    }
}
```

### Migration Order

1. Enable `StrictConcurrency=targeted` -- fix obvious issues
2. Upgrade to `StrictConcurrency=complete` -- fix remaining warnings
3. Add `Sendable` conformances bottom-up (leaf types first)
4. Convert shared mutable state to actors
5. Annotate UI code with `@MainActor`
6. Use `@preconcurrency` as a last resort for third-party code
7. Switch to Swift 6 language mode when clean

---

## Concurrency Checklist

Before submitting any concurrent Swift code:

### Structure
- [ ] Using structured concurrency (`async let`, `TaskGroup`) over unstructured `Task {}`
- [ ] Child task lifetimes are bounded by parent scope
- [ ] No fire-and-forget tasks without justification

### Safety
- [ ] Shared mutable state is actor-isolated
- [ ] All types crossing isolation boundaries conform to `Sendable`
- [ ] No `@unchecked Sendable` without documented justification
- [ ] UI updates happen on `@MainActor`

### Cancellation
- [ ] Long-running operations check `Task.isCancelled`
- [ ] Cleanup handlers registered with `withTaskCancellationHandler` where needed
- [ ] SwiftUI uses `.task` (auto-cancels) instead of `.onAppear` + `Task {}`

### Testing
- [ ] Async tests use `async throws` test functions
- [ ] Concurrent access tested with `TaskGroup` stress tests
- [ ] Cancellation paths have test coverage

---

## Integration with Sigma Protocol

### Step 2 (Architecture)
Define actor boundaries and concurrency model in architecture documents.

### Step 8 (Technical Spec)
Specify which types are actors, which are Sendable, and the MainActor isolation strategy.

### /implement-prd
Apply structured concurrency patterns when implementing async features.

### /security-audit
Verify no data races exist -- Swift 6 strict mode should be the target.

---

*Concurrency bugs are the hardest to debug because they are non-deterministic. Swift's concurrency model moves these bugs from runtime crashes to compile-time errors. Embrace the compiler's strictness -- it is protecting you from impossible-to-reproduce production bugs.*
