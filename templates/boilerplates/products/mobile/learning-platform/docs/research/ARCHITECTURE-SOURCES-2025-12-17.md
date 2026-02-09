# Architecture Research Sources — Learning Platform

**Date:** 2025-12-17  
**Purpose:** Technical architecture research for mobile the subject learning app  
**Stack Profile:** Expo + React Native + Supabase + LiveKit + RevenueCat

---

## Research Summary

### Key Findings

1. **Expo + Supabase Integration** is well-documented and production-ready for 2025
   - Supabase provides official quickstart guides for Expo React Native
   - Row Level Security (RLS) handles authorization at the database level
   - Realtime subscriptions work natively with React Native

2. **LiveKit React Native SDK** is the recommended choice for video calls
   - Official `@livekit/react-native` package available
   - Expo plugin available for managed workflow compatibility
   - <500ms latency for voice/video calls
   - Supports screen sharing for worksheet review during lessons

3. **RevenueCat + Expo** is the standard for mobile subscription management
   - Official Expo documentation recommends RevenueCat
   - Handles Apple IAP and Google Play complexity
   - Web billing support for cross-platform subscriptions
   - Built-in paywall templates available

4. **Architecture Pattern:** Modular monolith recommended for mobile apps
   - Feature-based folder structure scales well
   - Clean separation of concerns (UI, business logic, data)
   - Single codebase for iOS + Android via Expo

5. **AI Integration** patterns validated
   - OpenAI API for GPT-4o chat/completion
   - ElevenLabs API for text-to-speech (pronunciation)
   - OpenAI Whisper for speech-to-text (speaking exercises)

---

## Source List

### Expo + Supabase Integration

1. **Use Supabase with Expo React Native**
   - URL: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
   - Published: 2025-12-18
   - Key Content: Official quickstart guide for Expo + Supabase integration

2. **Build a User Management App with Expo React Native**
   - URL: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
   - Published: 2025-12-12
   - Key Content: Complete tutorial with auth, database, storage, and RLS

3. **Build a Social Auth App with Expo React Native**
   - URL: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
   - Published: 2025-12-12
   - Key Content: Apple and Google social authentication with protected navigation

4. **Scalable and Modular React Native Expo Folder Structure 2025**
   - URL: https://medium.com/@md.alishanali/scalable-and-modular-react-native-expo-folder-structure-2025-606abc0bf7d6
   - Published: 2025-03-16
   - Key Content: Best practices for folder organization in large Expo projects

5. **Using Supabase - Expo Documentation**
   - URL: https://docs.expo.dev/guides/using-supabase/
   - Published: 2025-11-03
   - Key Content: Official Expo guide for Supabase BaaS integration

---

### LiveKit Video Calls

6. **React Native Quickstart - LiveKit docs**
   - URL: https://docs.livekit.io/home/quickstarts/react-native
   - Published: 2025
   - Key Content: Official LiveKit React Native SDK setup guide

7. **livekit/client-sdk-react-native - GitHub**
   - URL: https://github.com/livekit/client-sdk-react-native
   - Published: Updated 2024-2025
   - Key Content: Official React Native SDK, 2.1K+ stars

8. **@livekit/react-native-expo-plugin - npm**
   - URL: https://www.npmjs.com/package/@livekit/react-native-expo-plugin
   - Published: 2024-04-26
   - Key Content: Expo config plugin for LiveKit integration

9. **Building Video Calling Features in React Native - VideoSDK**
   - URL: https://videosdk.live/developer-hub/developer-hub/media-server/react-native-video-call-comprehensive-guide
   - Published: 2025-04-21
   - Key Content: Comparison of video SDKs including LiveKit, Agora

---

### RevenueCat In-App Purchases

10. **Expo + RevenueCat: The fastest way to make money with your app**
    - URL: https://expo.dev/blog/expo-revenuecat-in-app-purchase-tutorial
    - Published: 2025-06-24
    - Key Content: Official Expo blog tutorial for RevenueCat integration

11. **In-App Purchases with Expo React Native - RevenueCat**
    - URL: https://www.revenuecat.com/blog/engineering/expo-in-app-purchase-tutorial/
    - Published: 2022-04-18 (Updated 2024-06-06)
    - Key Content: Getting started guide for Expo + RevenueCat

12. **Expo | RevenueCat Documentation**
    - URL: https://www.revenuecat.com/docs/getting-started/installation/expo
    - Published: 2025
    - Key Content: Official installation and configuration guide

13. **Build a single Expo app with subscriptions on iOS, Android, and Web**
    - URL: https://www.revenuecat.com/blog/engineering/build-a-single-expo-app-with-subscriptions-on-ios-android-and-web-using-revenuecat/
    - Published: 2025-05-17
    - Key Content: Cross-platform subscription implementation in 30 minutes

14. **How to Add In-App Subscriptions with RevenueCat + Expo - YouTube**
    - URL: https://www.youtube.com/watch?v=R3fLKC-2Qh0
    - Published: 2025-07-17
    - Key Content: Step-by-step video tutorial by Expo team

15. **Using in-app purchases - Expo Documentation**
    - URL: https://docs.expo.dev/guides/in-app-purchases
    - Published: 2025-08-29
    - Key Content: Official Expo guide recommending RevenueCat

---

### Architecture Patterns

16. **Local-first architecture with Expo**
    - URL: https://docs.expo.dev/guides/local-first/
    - Published: 2025-07-10
    - Key Content: Emerging patterns for offline-first mobile apps

17. **The Ultimate React Native App Development Guide - Codewave**
    - URL: https://codewave.com/insights/react-native-app-development-guide-best-practices/
    - Published: 2025-10-09
    - Key Content: Best practices for React Native architecture

---

## Technology Decisions Summary

| Category | Choice | Confidence | Source Count |
|----------|--------|------------|--------------|
| Mobile Framework | Expo + React Native | High | 8 sources |
| Database/Backend | Supabase | High | 5 sources |
| Video Calls | LiveKit | High | 4 sources |
| In-App Purchases | RevenueCat | High | 6 sources |
| AI Integration | OpenAI + ElevenLabs | Validated | Step 1.5 research |

---

*Research conducted using Exa MCP on 2025-12-17*

