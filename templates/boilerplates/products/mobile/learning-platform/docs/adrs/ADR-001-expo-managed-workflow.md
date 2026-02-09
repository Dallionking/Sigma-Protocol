# ADR-001: Use Expo Managed Workflow

## Status
**Accepted** — 2025-12-17

## Context

We need to build a cross-platform mobile app (iOS + Android) for language learning. The team size is 2-3 developers, and we want to maximize development velocity while maintaining production quality.

**Options Considered:**
1. **Expo Managed Workflow** — Full Expo SDK with EAS builds
2. **Expo Bare Workflow** — Expo with native access
3. **React Native CLI** — Pure React Native without Expo
4. **Flutter** — Cross-platform with Dart
5. **Native (Swift + Kotlin)** — Separate codebases

## Decision

**Use Expo Managed Workflow (SDK 52+)** with EAS Build and EAS Submit.

## Rationale

### Why Expo Managed Workflow:

1. **Fastest Development Velocity**
   - Hot reload, instant previews, Expo Go for testing
   - No Xcode/Android Studio required for most development
   - File-based routing with Expo Router

2. **Required Native Features Are Supported**
   - LiveKit has official Expo plugin (`@livekit/react-native-expo-plugin`)
   - RevenueCat works with Expo via `react-native-purchases`
   - All needed permissions (camera, microphone, notifications) supported
   - Background audio for lesson playback supported

3. **Simplified CI/CD**
   - EAS Build handles iOS/Android build complexity
   - EAS Submit automates store submissions
   - OTA updates for JS-only changes without store review

4. **Team Experience**
   - React/TypeScript expertise transfers directly
   - Lower learning curve than native development
   - Large community and ecosystem

5. **MCP Compatibility**
   - Expo has official MCP server (`https://mcp.expo.dev/mcp`)
   - Enables AI-assisted development and debugging

### Why Not Alternatives:

| Option | Rejection Reason |
|--------|------------------|
| Expo Bare | Adds complexity without benefit; managed covers all needs |
| React Native CLI | Requires native setup, slower iteration |
| Flutter | Team expertise is in React/TypeScript, not Dart |
| Native | 2x development effort, 2-3 dev team too small |

## Consequences

### Benefits
- ✅ Single codebase for iOS and Android
- ✅ Rapid iteration with hot reload
- ✅ OTA updates for quick fixes
- ✅ Simplified CI/CD with EAS
- ✅ Access to Expo's testing and preview tools

### Trade-offs
- ⚠️ Some native modules may require config plugins
- ⚠️ Slight app size overhead (~10MB for Expo runtime)
- ⚠️ Dependency on Expo's release cycle for SDK updates

### Risks
- ❌ If Expo SDK lags behind React Native, may need to eject (low probability)
- ❌ LiveKit Expo plugin must stay compatible (mitigated: actively maintained)

## Implementation Notes

```json
// app.json
{
  "expo": {
    "name": "Learning Platform",
    "slug": "learning-platform",
    "version": "1.0.0",
    "sdkVersion": "52.0.0",
    "platforms": ["ios", "android"],
    "plugins": [
      "@livekit/react-native-expo-plugin",
      "expo-notifications",
      "expo-av"
    ]
  }
}
```

## References
- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [LiveKit Expo Plugin](https://docs.livekit.io/home/quickstarts/react-native)

