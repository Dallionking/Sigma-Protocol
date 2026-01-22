# Swift Product Boilerplates

> Native iOS application shells built with SwiftUI and modern Apple frameworks

## Overview

These Swift boilerplates provide production-ready native iOS application foundations for scenarios where native performance and deep Apple ecosystem integration are required. Each boilerplate follows Apple's Human Interface Guidelines and leverages the latest SwiftUI patterns.

## When to Choose Swift over React Native

| Choose Swift When | Choose React Native When |
|------------------|-------------------------|
| Maximum performance required | Cross-platform needed |
| Deep Apple Watch/Widget integration | Faster iteration speed |
| ARKit/RealityKit features | Web + mobile from same codebase |
| HealthKit-heavy applications | Team knows JS/TS better |
| Apple-only product strategy | Budget constraints |

## Base Features (All Swift Boilerplates)

All Swift product boilerplates include:
- ✅ SwiftUI with iOS 17+ features
- ✅ Swift Concurrency (async/await)
- ✅ SwiftData for local persistence
- ✅ Supabase Swift SDK integration
- ✅ StoreKit 2 for subscriptions/IAP
- ✅ CloudKit sync support
- ✅ Push notifications (APNs)
- ✅ Widget extensions ready
- ✅ Apple Watch companion ready
- ✅ App Intents (Siri/Shortcuts)

## Available Products

| Product | Type | Complexity | Best For |
|---------|------|------------|----------|
| [Fitness](./fitness/) | Health & Fitness | Medium | HealthKit-intensive apps |
| [Finance](./finance/) | Fintech | High | Trading, banking with security focus |
| [Productivity](./productivity/) | Utilities | Medium | Task managers, note apps |

## Project Structure

Each Swift boilerplate follows this architecture:

```
swift-[product]/
├── [ProductName]/
│   ├── App/
│   │   └── [ProductName]App.swift
│   ├── Features/
│   │   ├── Auth/
│   │   ├── Dashboard/
│   │   └── Settings/
│   ├── Core/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Utilities/
│   ├── UI/
│   │   ├── Components/
│   │   ├── Styles/
│   │   └── Modifiers/
│   ├── Resources/
│   │   └── Assets.xcassets
│   └── Preview Content/
├── [ProductName]Widget/
├── [ProductName]Watch/
├── [ProductName]Tests/
└── [ProductName].xcodeproj
```

## Architecture Pattern

All boilerplates use a modified MVVM pattern with:

```swift
// View -> ViewModel -> Repository -> Service/API

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    
    var body: some View {
        // SwiftUI view code
    }
}

@MainActor
class DashboardViewModel: ObservableObject {
    @Published var items: [Item] = []
    
    private let repository: ItemRepository
    
    func loadItems() async {
        items = await repository.fetchItems()
    }
}
```

## Dependencies

Managed via Swift Package Manager:

```swift
// Package.swift dependencies
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
    .package(url: "https://github.com/pointfreeco/swift-composable-architecture", from: "1.0.0"), // Optional
]
```

## Quick Start

```bash
# Clone the boilerplate
cp -r templates/boilerplates/products/swift/fitness ./MyFitnessApp

# Open in Xcode
cd MyFitnessApp
open *.xcodeproj

# Configure signing
# Select your team in Signing & Capabilities

# Run on simulator or device
# ⌘R in Xcode
```

## Configuration

Each boilerplate includes a configuration file:

```swift
// Core/Config/AppConfig.swift
enum AppConfig {
    static let supabaseURL = "YOUR_SUPABASE_URL"
    static let supabaseKey = "YOUR_SUPABASE_ANON_KEY"
    
    static let revenueCatAPIKey = "YOUR_REVENUECAT_KEY"
    
    enum Features {
        static let enableWidgets = true
        static let enableWatchApp = true
        static let enableCloudSync = true
    }
}
```

## Apple Framework Integration

### HealthKit (Fitness)
```swift
// Pre-configured HealthKit integration
let healthStore = HKHealthStore()

func requestAuthorization() async throws {
    let types: Set<HKSampleType> = [
        HKObjectType.workoutType(),
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
    ]
    try await healthStore.requestAuthorization(toShare: types, read: types)
}
```

### StoreKit 2 (All)
```swift
// Modern subscription handling
@MainActor
class PurchaseManager: ObservableObject {
    @Published var subscriptionStatus: Product.SubscriptionInfo.Status?
    
    func purchase(_ product: Product) async throws {
        let result = try await product.purchase()
        // Handle result
    }
}
```

### CloudKit (All)
```swift
// iCloud sync support
@Model
class UserData {
    var name: String
    @Attribute(.cloudSync) var syncedItems: [Item]
}
```

## Widget Extensions

Each boilerplate includes widget support:

```swift
// [Product]Widget/[Product]Widget.swift
struct ProductWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: "ProductWidget",
            provider: Provider()
        ) { entry in
            ProductWidgetView(entry: entry)
        }
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
```

## Apple Watch Companion

Watch app structure included:

```
[Product]Watch/
├── ContentView.swift
├── Complications/
├── Notifications/
└── [Product]WatchApp.swift
```

## Testing

Each boilerplate includes:
- Unit tests with XCTest
- UI tests with XCUITest
- Preview providers for SwiftUI
- Mock services for testing

```swift
// Example test
@Test func dashboardLoadsItems() async {
    let viewModel = DashboardViewModel(repository: MockRepository())
    await viewModel.loadItems()
    #expect(viewModel.items.count > 0)
}
```

## See Also

- [Mobile Products](../mobile/) - React Native alternatives
- [Web Products](../) - Web application boilerplates
- [Apple Developer Docs](https://developer.apple.com/documentation/)


