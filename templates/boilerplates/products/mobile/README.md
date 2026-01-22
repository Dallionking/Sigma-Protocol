# Mobile Product Boilerplates

> Production-ready mobile app shells built on top of expo-mobile

## Overview

These product boilerplates extend the [expo-mobile](../../expo-mobile) foundation with domain-specific features, screens, and business logic. Each boilerplate is designed to give you a 60-80% head start on building a specific type of mobile application.

## Base Features (Inherited from expo-mobile)

All mobile product boilerplates include:
- ✅ Expo Router with file-based navigation
- ✅ Supabase authentication (email, social, magic link)
- ✅ RevenueCat subscription/IAP integration
- ✅ Onboarding flow foundation
- ✅ Settings & profile management
- ✅ Dark mode support
- ✅ Push notification setup

## Available Products

| Product | Type | Complexity | Best For |
|---------|------|------------|----------|
| [Fitness](./fitness/) | Health & Fitness | Medium | Workout trackers, coaching apps |
| [Social](./social/) | Social Network | High | Community apps, dating, networking |
| [Fintech](./fintech/) | Finance | High | Trading, banking, budgeting apps |
| [Delivery](./delivery/) | On-Demand | High | Food delivery, logistics, gig economy |

## Quick Start

```bash
# Initialize with a mobile product boilerplate
sigma scaffold my-app --boilerplate=mobile-fitness

# Or copy manually
cp -r templates/boilerplates/products/mobile/fitness ./my-fitness-app
cd my-fitness-app
npm install
npx expo start
```

## Product Architecture

Each mobile product boilerplate follows this structure:

```
mobile-[product]/
├── README.md           # Product overview and setup
├── FEATURES.md         # Detailed feature breakdown
├── app/                # Expo Router screens
│   ├── (tabs)/         # Main tab navigation
│   └── (modals)/       # Modal screens
├── components/         # Product-specific components
├── hooks/              # Custom hooks for product logic
├── lib/                # Third-party integrations
├── modules/            # Feature modules
└── assets/             # Product-specific assets
```

## Cross-Platform Considerations

All boilerplates are built to work on:
- 📱 iOS (iPhone & iPad)
- 🤖 Android (phones & tablets)
- 🌐 Web (via Expo for Web)

Platform-specific code is minimized but available where needed using Expo's platform detection.

## Integration with Sigma Protocol

These boilerplates work seamlessly with:
- **Step 0**: Generate domain-specific PRDs
- **Step 1-3**: Wireframe mobile-specific flows
- **Step 4-5**: Implement with mobile-first approach
- **Step 6-8**: Mobile testing strategies
- **Step 9-13**: App store deployment guides

## See Also

- [expo-mobile Base](../../expo-mobile/) - Foundation boilerplate
- [Web Products](../) - Web application boilerplates
- [Swift Products](../swift/) - Native iOS boilerplates


