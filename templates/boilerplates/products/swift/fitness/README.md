# Swift Fitness App Boilerplate

> Native iOS fitness application with deep HealthKit integration and Apple Watch companion

## Overview

The Swift Fitness boilerplate provides a production-ready native iOS fitness application foundation. Built specifically for scenarios requiring deep Apple ecosystem integration including HealthKit, Apple Watch, and Fitness widgets.

## Why Swift for Fitness Apps?

- **HealthKit Access**: Native HealthKit APIs with full data type support
- **Apple Watch**: Native watchOS companion for workout tracking
- **Background Processing**: Reliable background workouts
- **Widgets**: Live Activity and Lock Screen widgets
- **Performance**: Native chart rendering for smooth analytics

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   📱 iPhone     │  │   ⌚ Watch      │  │   🔲 Widget     │
│                 │  │                 │  │                 │
│  Today          │  │  ┌─────────┐   │  │  ┌───────────┐  │
│  ───────────    │  │  │  12:34  │   │  │  │ 🔥 450    │  │
│  🔥 450 cal     │  │  │  ♥ 142  │   │  │  │ calories  │  │
│  🚶 8,234 steps │  │  │  🔥 234 │   │  │  │ burned    │  │
│                 │  │  └─────────┘   │  │  └───────────┘  │
│  [Start Workout]│  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Project Structure

```
SwiftFitness/
├── SwiftFitness/
│   ├── App/
│   │   ├── SwiftFitnessApp.swift
│   │   └── AppState.swift
│   ├── Features/
│   │   ├── Dashboard/
│   │   │   ├── DashboardView.swift
│   │   │   └── DashboardViewModel.swift
│   │   ├── Workouts/
│   │   │   ├── WorkoutListView.swift
│   │   │   ├── WorkoutDetailView.swift
│   │   │   ├── ActiveWorkoutView.swift
│   │   │   └── WorkoutViewModel.swift
│   │   ├── Progress/
│   │   │   ├── ProgressView.swift
│   │   │   ├── ChartsView.swift
│   │   │   └── ProgressViewModel.swift
│   │   ├── Profile/
│   │   │   └── ProfileView.swift
│   │   └── Auth/
│   │       ├── AuthView.swift
│   │       └── AuthViewModel.swift
│   ├── Core/
│   │   ├── Models/
│   │   │   ├── Workout.swift
│   │   │   ├── Exercise.swift
│   │   │   └── UserProfile.swift
│   │   ├── Services/
│   │   │   ├── HealthKitService.swift
│   │   │   ├── WorkoutService.swift
│   │   │   └── SyncService.swift
│   │   ├── Repositories/
│   │   │   ├── WorkoutRepository.swift
│   │   │   └── ExerciseRepository.swift
│   │   └── Utilities/
│   │       ├── DateFormatter+Extensions.swift
│   │       └── HealthKitHelpers.swift
│   ├── UI/
│   │   ├── Components/
│   │   │   ├── WorkoutCard.swift
│   │   │   ├── ProgressRing.swift
│   │   │   ├── MetricCard.swift
│   │   │   └── ExerciseRow.swift
│   │   ├── Styles/
│   │   │   └── AppTheme.swift
│   │   └── Modifiers/
│   │       └── CardModifier.swift
│   └── Resources/
│       └── Assets.xcassets
├── SwiftFitnessWidget/
│   ├── SwiftFitnessWidget.swift
│   ├── SmallWidget.swift
│   ├── MediumWidget.swift
│   └── LiveActivityView.swift
├── SwiftFitnessWatch/
│   ├── SwiftFitnessWatchApp.swift
│   ├── ContentView.swift
│   ├── WorkoutView.swift
│   └── Complications/
├── SwiftFitnessTests/
└── SwiftFitness.xcodeproj
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| UI Framework | SwiftUI (iOS 17+) |
| Data Persistence | SwiftData |
| Health Data | HealthKit |
| Backend | Supabase Swift SDK |
| Payments | StoreKit 2 + RevenueCat |
| Charts | Swift Charts |
| Watch | watchOS 10+ |
| Widgets | WidgetKit + Live Activities |

## Key Features

### 🏋️ Workout Management
- Pre-built workout templates
- Custom workout creation
- Active workout tracking
- Rest timer with haptic feedback
- Apple Watch workout mirroring

### 📊 HealthKit Integration
- Read/write workout data
- Activity rings sync
- Heart rate monitoring
- Sleep data correlation
- Nutrition data (optional)

### ⌚ Apple Watch App
- Standalone workout tracking
- Real-time heart rate
- Complications
- Watch-to-phone sync

### 📱 Widgets & Live Activities
- Lock screen widgets
- Home screen widgets
- Live Activity during workouts
- Dynamic Island support

## HealthKit Configuration

### Required Entitlements

```xml
<!-- SwiftFitness.entitlements -->
<key>com.apple.developer.healthkit</key>
<true/>
<key>com.apple.developer.healthkit.access</key>
<array>
    <string>health-records</string>
</array>
```

### Data Types

```swift
// Core/Services/HealthKitService.swift
struct HealthKitService {
    let healthStore = HKHealthStore()
    
    let readTypes: Set<HKObjectType> = [
        HKObjectType.workoutType(),
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
        HKObjectType.quantityType(forIdentifier: .heartRate)!,
        HKObjectType.quantityType(forIdentifier: .stepCount)!,
        HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!,
    ]
    
    let writeTypes: Set<HKSampleType> = [
        HKObjectType.workoutType(),
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
    ]
    
    func requestAuthorization() async throws {
        try await healthStore.requestAuthorization(toShare: writeTypes, read: readTypes)
    }
}
```

## SwiftData Models

```swift
// Core/Models/Workout.swift
import SwiftData

@Model
class Workout {
    var id: UUID
    var name: String
    var startDate: Date
    var endDate: Date?
    var workoutType: WorkoutType
    var exercises: [Exercise]
    var caloriesBurned: Double?
    var heartRateSamples: [HeartRateSample]
    
    @Attribute(.cloudSync)
    var syncStatus: SyncStatus
}

@Model
class Exercise {
    var id: UUID
    var name: String
    var sets: [ExerciseSet]
    var workout: Workout?
}
```

## Active Workout Implementation

```swift
// Features/Workouts/ActiveWorkoutView.swift
struct ActiveWorkoutView: View {
    @StateObject private var viewModel: ActiveWorkoutViewModel
    @Environment(\.scenePhase) var scenePhase
    
    var body: some View {
        VStack {
            // Timer display
            Text(viewModel.elapsedTime.formatted())
                .font(.system(size: 64, weight: .bold, design: .rounded))
            
            // Current exercise
            ExerciseDisplay(exercise: viewModel.currentExercise)
            
            // Heart rate (if watch connected)
            if let heartRate = viewModel.currentHeartRate {
                HeartRateDisplay(bpm: heartRate)
            }
            
            // Controls
            HStack {
                Button("Rest", action: viewModel.startRest)
                Button("Next", action: viewModel.nextExercise)
            }
        }
        .onChange(of: scenePhase) { _, newPhase in
            if newPhase == .background {
                viewModel.handleBackgroundTransition()
            }
        }
    }
}
```

## Widget Configuration

```swift
// SwiftFitnessWidget/SwiftFitnessWidget.swift
import WidgetKit
import SwiftUI

@main
struct SwiftFitnessWidgets: WidgetBundle {
    var body: some Widget {
        ActivityWidget()
        WorkoutWidget()
        StreakWidget()
    }
}

struct ActivityWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "activity", provider: ActivityProvider()) { entry in
            ActivityWidgetView(entry: entry)
        }
        .configurationDisplayName("Today's Activity")
        .description("View your daily activity progress")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular])
    }
}
```

## Apple Watch App

```swift
// SwiftFitnessWatch/WorkoutView.swift
import SwiftUI
import HealthKit

struct WatchWorkoutView: View {
    @StateObject private var workoutManager = WatchWorkoutManager()
    
    var body: some View {
        TimelineView(.periodic(from: .now, by: 1)) { context in
            VStack {
                Text(workoutManager.elapsedTime.formatted())
                    .font(.title)
                
                HStack {
                    MetricView(value: workoutManager.heartRate, unit: "BPM", icon: "heart.fill")
                    MetricView(value: workoutManager.calories, unit: "CAL", icon: "flame.fill")
                }
                
                Button(action: workoutManager.togglePause) {
                    Image(systemName: workoutManager.isPaused ? "play.fill" : "pause.fill")
                }
            }
        }
        .onAppear {
            workoutManager.startWorkout()
        }
    }
}
```

## Configuration

```swift
// Core/Config/AppConfig.swift
enum AppConfig {
    // Supabase
    static let supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
    static let supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? ""
    
    // RevenueCat
    static let revenueCatAPIKey = "YOUR_REVENUECAT_KEY"
    
    // Feature Flags
    enum Features {
        static let enableWatchApp = true
        static let enableWidgets = true
        static let enableLiveActivities = true
        static let enableCloudSync = true
    }
    
    // Workout Settings
    enum Workout {
        static let defaultRestDuration: TimeInterval = 60
        static let heartRateSampleInterval: TimeInterval = 5
    }
}
```

## Premium Features (StoreKit 2)

```swift
// Core/Services/PurchaseService.swift
@MainActor
class PurchaseService: ObservableObject {
    @Published var isPremium = false
    @Published var products: [Product] = []
    
    func loadProducts() async {
        products = try? await Product.products(for: [
            "com.app.premium.monthly",
            "com.app.premium.yearly"
        ])
    }
    
    func purchase(_ product: Product) async throws {
        let result = try await product.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            isPremium = true
            await transaction.finish()
        case .pending, .userCancelled:
            break
        @unknown default:
            break
        }
    }
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [Mobile Fitness (RN)](../../mobile/fitness/) - React Native alternative
- [Apple HealthKit Docs](https://developer.apple.com/documentation/healthkit)


