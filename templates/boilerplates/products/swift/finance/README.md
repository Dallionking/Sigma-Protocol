# Swift Finance App Boilerplate

> Native iOS finance application with maximum security and Apple ecosystem integration

## Overview

The Swift Finance boilerplate provides a production-ready native iOS finance application foundation. Built specifically for scenarios requiring the highest security standards, biometric authentication, and seamless Apple Pay integration.

## Why Swift for Finance Apps?

- **Security**: Native Keychain, Secure Enclave, and biometric APIs
- **Apple Pay**: First-class Apple Pay and Wallet integration  
- **Performance**: Native rendering for real-time market data
- **Trust**: iOS native apps perceived as more secure by users
- **Widgets**: Stock/portfolio widgets with background refresh

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   💰 Portfolio  │  │   📈 Trade      │  │   🔒 Security   │
│                 │  │                 │  │                 │
│  $24,567.89     │  │     AAPL        │  │   ┌─────────┐   │
│  +$1,234 (5.3%) │  │   $178.50       │  │   │  Face   │   │
│                 │  │   +2.34%        │  │   │   ID    │   │
│  ┌───────────┐  │  │                 │  │   └─────────┘   │
│  │ ▂▃▅▆▇▆▅▃ │  │  │  [ BUY ]       │  │                 │
│  └───────────┘  │  │  [ SELL ]      │  │  Authenticate   │
│                 │  │                 │  │  to continue    │
│  [VIEW DETAILS] │  │  [TRADE NOW]   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Project Structure

```
SwiftFinance/
├── SwiftFinance/
│   ├── App/
│   │   ├── SwiftFinanceApp.swift
│   │   └── AppState.swift
│   ├── Features/
│   │   ├── Portfolio/
│   │   │   ├── PortfolioView.swift
│   │   │   ├── HoldingsView.swift
│   │   │   └── PortfolioViewModel.swift
│   │   ├── Trading/
│   │   │   ├── TradeView.swift
│   │   │   ├── OrderEntryView.swift
│   │   │   └── TradeViewModel.swift
│   │   ├── Markets/
│   │   │   ├── MarketsView.swift
│   │   │   ├── AssetDetailView.swift
│   │   │   ├── ChartView.swift
│   │   │   └── MarketsViewModel.swift
│   │   ├── Account/
│   │   │   ├── AccountView.swift
│   │   │   └── FundingView.swift
│   │   └── Auth/
│   │       ├── BiometricAuthView.swift
│   │       └── PINEntryView.swift
│   ├── Core/
│   │   ├── Models/
│   │   │   ├── Portfolio.swift
│   │   │   ├── Holding.swift
│   │   │   ├── Order.swift
│   │   │   └── Quote.swift
│   │   ├── Services/
│   │   │   ├── AuthService.swift
│   │   │   ├── BiometricService.swift
│   │   │   ├── MarketDataService.swift
│   │   │   ├── TradingService.swift
│   │   │   └── KeychainService.swift
│   │   ├── Security/
│   │   │   ├── SecureStore.swift
│   │   │   ├── CertificatePinning.swift
│   │   │   └── JailbreakDetection.swift
│   │   └── Networking/
│   │       ├── APIClient.swift
│   │       └── WebSocketClient.swift
│   ├── UI/
│   │   ├── Components/
│   │   │   ├── PortfolioCard.swift
│   │   │   ├── HoldingRow.swift
│   │   │   ├── QuoteDisplay.swift
│   │   │   └── CandlestickChart.swift
│   │   ├── Styles/
│   │   │   └── FinanceTheme.swift
│   │   └── Modifiers/
│   │       └── SecureFieldModifier.swift
│   └── Resources/
│       └── Assets.xcassets
├── SwiftFinanceWidget/
│   ├── StockWidget.swift
│   ├── PortfolioWidget.swift
│   └── WatchlistWidget.swift
├── SwiftFinanceWatch/
│   ├── SwiftFinanceWatchApp.swift
│   ├── PortfolioGlance.swift
│   └── Complications/
├── SwiftFinanceTests/
└── SwiftFinance.xcodeproj
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| UI Framework | SwiftUI (iOS 17+) |
| Concurrency | Swift Concurrency (async/await) |
| Data | SwiftData + Keychain |
| Charts | Swift Charts |
| Backend | Supabase Swift SDK |
| Payments | StoreKit 2 |
| Security | LocalAuthentication + CryptoKit |
| Real-time | URLSession WebSocket |

## Key Features

### 💰 Portfolio Management
- Real-time portfolio valuation
- Holdings breakdown
- Performance tracking
- Gain/loss visualization
- Asset allocation

### 📈 Trading
- Market/limit orders
- Order management
- Trade confirmation flow
- Order history

### 📊 Market Data
- Real-time quotes
- Candlestick charts (Swift Charts)
- Watchlists
- Price alerts

### 🔒 Security
- Face ID / Touch ID
- PIN fallback
- Secure Enclave storage
- Certificate pinning
- Jailbreak detection

## Security Implementation

### Biometric Authentication

```swift
// Core/Services/BiometricService.swift
import LocalAuthentication

actor BiometricService {
    private let context = LAContext()
    
    func authenticate(reason: String) async throws -> Bool {
        var error: NSError?
        
        guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &error) else {
            throw BiometricError.notAvailable
        }
        
        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }
    
    var biometryType: LABiometryType {
        context.biometryType
    }
}
```

### Secure Storage

```swift
// Core/Security/SecureStore.swift
import Security

struct SecureStore {
    static func save(_ data: Data, for key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        ]
        
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.saveFailed(status)
        }
    }
    
    static func retrieve(for key: String) throws -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess else {
            if status == errSecItemNotFound { return nil }
            throw KeychainError.retrieveFailed(status)
        }
        
        return result as? Data
    }
}
```

### Certificate Pinning

```swift
// Core/Security/CertificatePinning.swift
class PinnedURLSessionDelegate: NSObject, URLSessionDelegate {
    private let pinnedCertificates: [SecCertificate]
    
    init(certificates: [SecCertificate]) {
        self.pinnedCertificates = certificates
    }
    
    func urlSession(
        _ session: URLSession,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        guard challenge.protectionSpace.authenticationMethod == NSURLAuthenticationMethodServerTrust,
              let serverTrust = challenge.protectionSpace.serverTrust,
              let serverCertificate = SecTrustGetCertificateAtIndex(serverTrust, 0) else {
            completionHandler(.cancelAuthenticationChallenge, nil)
            return
        }
        
        let serverCertData = SecCertificateCopyData(serverCertificate) as Data
        
        for pinnedCert in pinnedCertificates {
            let pinnedData = SecCertificateCopyData(pinnedCert) as Data
            if serverCertData == pinnedData {
                completionHandler(.useCredential, URLCredential(trust: serverTrust))
                return
            }
        }
        
        completionHandler(.cancelAuthenticationChallenge, nil)
    }
}
```

### Jailbreak Detection

```swift
// Core/Security/JailbreakDetection.swift
struct JailbreakDetection {
    static var isJailbroken: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        // Check for common jailbreak files
        let suspiciousPaths = [
            "/Applications/Cydia.app",
            "/Library/MobileSubstrate/MobileSubstrate.dylib",
            "/bin/bash",
            "/usr/sbin/sshd",
            "/etc/apt",
            "/private/var/lib/apt/"
        ]
        
        for path in suspiciousPaths {
            if FileManager.default.fileExists(atPath: path) {
                return true
            }
        }
        
        // Check if we can write outside sandbox
        let testPath = "/private/jailbreak_test.txt"
        do {
            try "test".write(toFile: testPath, atomically: true, encoding: .utf8)
            try FileManager.default.removeItem(atPath: testPath)
            return true
        } catch {
            return false
        }
        #endif
    }
}
```

## Real-Time Market Data

```swift
// Core/Services/MarketDataService.swift
actor MarketDataService {
    private var webSocket: URLSessionWebSocketTask?
    private let subscriptions = CurrentValueSubject<Set<String>, Never>([])
    
    func connect() async throws {
        let url = URL(string: "wss://api.example.com/market-data")!
        webSocket = URLSession.shared.webSocketTask(with: url)
        webSocket?.resume()
        
        await receiveMessages()
    }
    
    func subscribe(to symbol: String) async {
        let message = ["action": "subscribe", "symbol": symbol]
        let data = try? JSONEncoder().encode(message)
        try? await webSocket?.send(.data(data ?? Data()))
    }
    
    private func receiveMessages() async {
        guard let webSocket else { return }
        
        do {
            let message = try await webSocket.receive()
            switch message {
            case .data(let data):
                if let quote = try? JSONDecoder().decode(Quote.self, from: data) {
                    // Publish quote update
                }
            case .string(let string):
                // Handle string message
                break
            @unknown default:
                break
            }
            await receiveMessages()
        } catch {
            // Handle disconnection
        }
    }
}
```

## Swift Charts Integration

```swift
// UI/Components/CandlestickChart.swift
import Charts

struct CandlestickChart: View {
    let candles: [Candle]
    
    var body: some View {
        Chart(candles) { candle in
            // Wick
            RectangleMark(
                x: .value("Date", candle.date),
                yStart: .value("Low", candle.low),
                yEnd: .value("High", candle.high),
                width: 2
            )
            .foregroundStyle(candle.isGreen ? .green : .red)
            
            // Body
            RectangleMark(
                x: .value("Date", candle.date),
                yStart: .value("Open", candle.open),
                yEnd: .value("Close", candle.close),
                width: 8
            )
            .foregroundStyle(candle.isGreen ? .green : .red)
        }
        .chartXAxis(.hidden)
        .chartYAxis {
            AxisMarks(position: .trailing)
        }
    }
}
```

## Configuration

```swift
// Core/Config/AppConfig.swift
enum AppConfig {
    static let supabaseURL = ProcessInfo.processInfo.environment["SUPABASE_URL"] ?? ""
    static let supabaseKey = ProcessInfo.processInfo.environment["SUPABASE_ANON_KEY"] ?? ""
    
    enum Security {
        static let requireBiometrics = true
        static let sessionTimeout: TimeInterval = 900 // 15 minutes
        static let certificatePinning = true
        static let jailbreakDetection = true
    }
    
    enum Trading {
        static let minOrderAmount: Decimal = 1.00
        static let requireBiometricForTrade = true
    }
}
```

## App Protection Flow

```swift
// App/SwiftFinanceApp.swift
@main
struct SwiftFinanceApp: App {
    @StateObject private var appState = AppState()
    @Environment(\.scenePhase) var scenePhase
    
    var body: some Scene {
        WindowGroup {
            Group {
                if JailbreakDetection.isJailbroken {
                    SecurityAlertView(message: "This app cannot run on jailbroken devices.")
                } else if appState.isAuthenticated {
                    MainTabView()
                } else {
                    BiometricAuthView()
                }
            }
            .environmentObject(appState)
            .onChange(of: scenePhase) { _, newPhase in
                if newPhase == .background {
                    appState.lockApp()
                }
            }
        }
    }
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [Mobile Fintech (RN)](../../mobile/fintech/) - React Native alternative
- [Apple Security Docs](https://developer.apple.com/documentation/security)


