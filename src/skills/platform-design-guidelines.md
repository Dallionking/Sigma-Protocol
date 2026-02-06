---
name: platform-design-guidelines
description: "Apple HIG and Material Design 3 platform-native design guidelines with SF Pro typography, Dynamic Type, touch targets, SF Symbols, safe areas, dynamic color, tonal palettes, and cross-platform adaptation patterns."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - hig
  - apple-hig
  - material-design
  - platform-native
  - ios-design
  - android-design
---

# Platform Design Guidelines Skill

Comprehensive reference for building platform-native mobile interfaces following Apple Human Interface Guidelines (HIG) and Material Design 3 (MD3). This skill ensures designs feel native on each platform while maintaining shared design tokens for cross-platform consistency.

## When to Invoke

Invoke this skill when:

- Designing mobile UI for iOS or Android
- Choosing platform-native navigation patterns, typography, or spacing
- Implementing Dynamic Type (iOS) or scalable SP typography (Android)
- Working with SF Symbols, Material Icons, or platform-specific iconography
- Creating design tokens that map to both HIG and MD3
- Adapting a cross-platform design to feel native on each platform
- Running accessibility audits for mobile (VoiceOver, TalkBack)

---

## Platform Selection Decision Tree

```
Is the app iOS-only?
  YES --> Follow Apple HIG exclusively
  NO  --> Is the app Android-only?
            YES --> Follow Material Design 3 exclusively
            NO  --> Cross-platform:
                    1. Define shared design tokens (Step 6)
                    2. Map tokens to HIG values on iOS
                    3. Map tokens to MD3 values on Android
                    4. Use platform-adaptive components
                    5. Test on both platforms separately
```

**Key principle:** Cross-platform does not mean identical. Users expect apps to behave like other apps on their platform. A tab bar at the bottom on iOS and a bottom navigation bar on Android may look similar but have different interaction patterns, animations, and spacing rules.

---

## Apple HIG Essentials

### SF Pro Font System

iOS uses SF Pro as the system font. It includes optical sizing, variable weight, and width axes for precise typographic control.

```swift
// Bad: Hardcoded font name and size
Text("Welcome")
    .font(.custom("Helvetica", size: 28))

// Good: System-defined text styles with automatic Dynamic Type
Text("Welcome")
    .font(.largeTitle)     // Adapts to user's text size preference

Text("Section Header")
    .font(.title2)
    .fontWeight(.semibold)

Text("Body content goes here")
    .font(.body)

Text("Fine print disclaimer")
    .font(.caption)
```

### Dynamic Type

Dynamic Type lets users choose their preferred text size. All text must scale.

```swift
// Bad: Fixed font sizes that ignore user preferences
Text("Price: $29.99")
    .font(.system(size: 16))

// Good: Using UIFontMetrics for custom fonts that scale with Dynamic Type
struct ScaledFont: ViewModifier {
    let name: String
    let size: CGFloat
    let textStyle: Font.TextStyle

    func body(content: Content) -> some View {
        content.font(
            .custom(name, size: size, relativeTo: textStyle)
        )
    }
}

extension View {
    func scaledFont(name: String, size: CGFloat, relativeTo textStyle: Font.TextStyle = .body) -> some View {
        modifier(ScaledFont(name: name, size: size, textStyle: textStyle))
    }
}

// Usage
Text("Price: $29.99")
    .scaledFont(name: "NewYork-Regular", size: 16, relativeTo: .body)
```

### UIKit Dynamic Type with UIFontMetrics

```swift
// Bad: Fixed size in UIKit
label.font = UIFont.systemFont(ofSize: 17)

// Good: Scaled custom font in UIKit
let baseFont = UIFont(name: "NewYork-Regular", size: 17)!
label.font = UIFontMetrics(forTextStyle: .body).scaledFont(for: baseFont)
label.adjustsFontForContentSizeCategory = true
```

### iOS Text Style Mapping

| Text Style | Default Size | Usage |
|------------|-------------|-------|
| `.largeTitle` | 34pt | Screen titles |
| `.title` | 28pt | Section titles |
| `.title2` | 22pt | Subsection titles |
| `.title3` | 20pt | Tertiary titles |
| `.headline` | 17pt bold | List row labels |
| `.body` | 17pt | Primary content |
| `.callout` | 16pt | Secondary content |
| `.subheadline` | 15pt | Tertiary content |
| `.footnote` | 13pt | Timestamps, metadata |
| `.caption` | 12pt | Labels, fine print |
| `.caption2` | 11pt | Smallest text |

### Touch Targets

The minimum touch target on iOS is **44x44 points**.

```swift
// Bad: Small tap area
Button("X") {
    dismiss()
}
.frame(width: 24, height: 24)

// Good: Visual element can be small, hit area is 44pt
Button(action: dismiss) {
    Image(systemName: "xmark")
        .font(.system(size: 16))
        .frame(width: 44, height: 44) // Hit area meets minimum
        .contentShape(Rectangle())    // Entire frame is tappable
}
```

### SF Symbols 6

SF Symbols provides 6,000+ symbols that scale with Dynamic Type and support variable color, animations, and rendering modes.

```swift
// Basic usage
Image(systemName: "heart.fill")
    .symbolRenderingMode(.palette)
    .foregroundStyle(.red, .pink)

// Variable color (0.0 to 1.0)
Image(systemName: "wifi")
    .symbolVariableValue(signalStrength) // 0.0 = no signal, 1.0 = full

// Animated symbols
Image(systemName: "checkmark.circle")
    .symbolEffect(.bounce, value: isComplete)

Image(systemName: "arrow.down.circle")
    .symbolEffect(.pulse, isActive: isDownloading)

// Symbol size matching text
Label("Favorites", systemImage: "heart.fill")
    .font(.body) // Symbol scales to match text size
```

### Safe Area Handling

```swift
// Bad: Ignoring safe areas (content hidden behind notch/home indicator)
VStack {
    Text("Header")
}
.edgesIgnoringSafeArea(.all) // Content goes under status bar

// Good: Respecting safe areas with intentional edge-to-edge elements
VStack {
    Text("Header")
        .padding()
}
.background(
    Color.blue
        .ignoresSafeArea() // Background extends, content stays safe
)
```

### Dark Mode

```swift
// Bad: Hardcoded colors
Text("Title")
    .foregroundColor(Color(red: 0, green: 0, blue: 0)) // Invisible in dark mode

// Good: Semantic colors that adapt
Text("Title")
    .foregroundStyle(.primary)    // Black in light, white in dark

Text("Subtitle")
    .foregroundStyle(.secondary)  // Gray that adapts

// Good: Asset catalog adaptive colors
// Define "BrandPrimary" in Assets.xcassets with light + dark variants
Text("Brand")
    .foregroundColor(Color("BrandPrimary"))
```

---

## Material Design 3

### Dynamic Color (Material You)

Material You generates tonal palettes from a user-selected seed color (wallpaper-derived on Android 12+).

```kotlin
// Bad: Hardcoded brand colors ignoring dynamic theming
Surface(color = Color(0xFF6200EE)) {
    Text("Hello", color = Color.White)
}

// Good: Dynamic color with Material 3
@Composable
fun MyApp() {
    val dynamicColor = dynamicDarkColorScheme(LocalContext.current)
    // Falls back to static theme on pre-Android 12

    MaterialTheme(colorScheme = dynamicColor) {
        Surface(color = MaterialTheme.colorScheme.surface) {
            Text(
                "Hello",
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
```

### Tonal Palettes

MD3 generates a tonal palette with 13 tones (0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100) from the seed color. Key color roles:

| Role | Light Theme Tone | Dark Theme Tone | Usage |
|------|-----------------|-----------------|-------|
| `primary` | 40 | 80 | Primary actions, FAB |
| `onPrimary` | 100 | 20 | Text/icons on primary |
| `primaryContainer` | 90 | 30 | Card backgrounds |
| `onPrimaryContainer` | 10 | 90 | Text on containers |
| `surface` | 99 | 10 | Page background |
| `onSurface` | 10 | 90 | Body text |
| `surfaceVariant` | 90 | 30 | Subtle distinction |
| `outline` | 50 | 60 | Borders, dividers |

### Elevation and Tonal Surface

MD3 replaces drop shadows with tonal elevation. Higher elevation surfaces use lighter tones.

```kotlin
// Bad: Using drop shadows for elevation (MD2 pattern)
Card(elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)) {
    // Shadow-based elevation
}

// Good: Tonal elevation (MD3)
Surface(
    tonalElevation = 3.dp, // Surface color shifts lighter, no shadow
    shape = MaterialTheme.shapes.medium
) {
    Text("Content")
}
```

### Shape System

```kotlin
// MD3 shape scale
val shapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),   // Chips, small elements
    small = RoundedCornerShape(8.dp),        // Buttons, text fields
    medium = RoundedCornerShape(12.dp),      // Cards, dialogs
    large = RoundedCornerShape(16.dp),       // Navigation drawers
    extraLarge = RoundedCornerShape(28.dp),  // Bottom sheets, FAB
)
```

### MD3 Typography Scale

| Style | Size/Line Height | Weight | Usage |
|-------|-----------------|--------|-------|
| `displayLarge` | 57/64 | Regular | Hero text |
| `displayMedium` | 45/52 | Regular | Large display |
| `displaySmall` | 36/44 | Regular | Display text |
| `headlineLarge` | 32/40 | Regular | Screen title |
| `headlineMedium` | 28/36 | Regular | Section title |
| `headlineSmall` | 24/32 | Regular | Subsection |
| `titleLarge` | 22/28 | Regular | Top app bar |
| `titleMedium` | 16/24 | Medium | Card title |
| `titleSmall` | 14/20 | Medium | Tab label |
| `bodyLarge` | 16/24 | Regular | Primary content |
| `bodyMedium` | 14/20 | Regular | Secondary content |
| `bodySmall` | 12/16 | Regular | Captions |
| `labelLarge` | 14/20 | Medium | Buttons |
| `labelMedium` | 12/16 | Medium | Navigation |
| `labelSmall` | 11/16 | Medium | Smallest labels |

---

## Typography: Cross-Platform Patterns

### Bad Pattern

```swift
// iOS: Hardcoded sizes that break at larger text sizes
Text("Title").font(.system(size: 24))
Text("Body").font(.system(size: 14))
```

```kotlin
// Android: Hardcoded dp instead of sp (ignores user font scaling)
Text(text = "Title", fontSize = 24.dp.value.sp)
```

### Good Pattern

```swift
// iOS: Dynamic Type
Text("Title").font(.title)
Text("Body").font(.body)
```

```kotlin
// Android: SP-based (scales with user preference)
Text(text = "Title", style = MaterialTheme.typography.headlineMedium)
Text(text = "Body", style = MaterialTheme.typography.bodyLarge)
```

### Cross-Platform Text Style Mapping

| Semantic Role | iOS Text Style | MD3 Style | Design Token |
|---------------|---------------|-----------|--------------|
| Screen title | `.largeTitle` (34pt) | `headlineLarge` (32sp) | `--text-screen-title` |
| Section title | `.title2` (22pt) | `titleLarge` (22sp) | `--text-section-title` |
| Card title | `.headline` (17pt bold) | `titleMedium` (16sp medium) | `--text-card-title` |
| Body text | `.body` (17pt) | `bodyLarge` (16sp) | `--text-body` |
| Secondary text | `.subheadline` (15pt) | `bodyMedium` (14sp) | `--text-secondary` |
| Caption | `.caption` (12pt) | `bodySmall` (12sp) | `--text-caption` |
| Button label | `.body` (17pt semibold) | `labelLarge` (14sp medium) | `--text-button` |

---

## Touch Targets

### Bad Pattern

```swift
// iOS: 30pt button -- too small
Button("Save") { }
    .frame(width: 60, height: 30) // Below 44pt minimum
```

```kotlin
// Android: 36dp button -- too small
Button(onClick = { }, modifier = Modifier.height(36.dp)) {
    Text("Save")
}
```

### Good Pattern

```swift
// iOS: 44pt minimum touch target
Button("Save") { }
    .frame(minWidth: 44, minHeight: 44)

// For icon-only buttons, expand the hit area
Button(action: { }) {
    Image(systemName: "trash")
        .frame(width: 44, height: 44)
        .contentShape(Rectangle())
}
```

```kotlin
// Android: 48dp minimum touch target
Button(
    onClick = { },
    modifier = Modifier.defaultMinSize(minWidth = 48.dp, minHeight = 48.dp)
) {
    Text("Save")
}

// IconButton already has 48dp touch target by default
IconButton(onClick = { }) {
    Icon(Icons.Default.Delete, contentDescription = "Delete")
}
```

### Hit Area Expansion Techniques

| Platform | Minimum | Recommended | Technique |
|----------|---------|-------------|-----------|
| iOS | 44x44pt | 48x48pt | `.contentShape(Rectangle())` + `.frame()` |
| Android | 48x48dp | 48x48dp | `Modifier.defaultMinSize()` or `IconButton` wrapper |
| Web (mobile) | 44x44px | 48x48px | `min-width` + `min-height` + `padding` |

---

## Platform Adaptation Rules

### Navigation Patterns

| Pattern | iOS (HIG) | Android (MD3) |
|---------|-----------|---------------|
| **Primary navigation** | Tab bar (bottom, 5 max) | Bottom navigation bar (3-5 items) |
| **Secondary navigation** | Tab bar + More tab | Navigation drawer |
| **Back navigation** | Swipe from left edge + back button | System back gesture / button |
| **Modal presentation** | Sheet (`.sheet`, slides up) | Bottom sheet or full-screen dialog |
| **Search** | Pull-down search bar in navigation | Top app bar search icon |
| **Settings** | Grouped list (inset grouped style) | Single-column list |

### Back Behavior

```swift
// iOS: System back gesture is automatic with NavigationStack
NavigationStack {
    List(items) { item in
        NavigationLink(item.title) {
            DetailView(item: item)
            // Swipe-from-left-edge back gesture is free
        }
    }
}
```

```kotlin
// Android: Handle predictive back gesture (Android 14+)
@Composable
fun DetailScreen(onBack: () -> Unit) {
    BackHandler(onBack = onBack)
    // System handles predictive back animation
}
```

### Status Bar Treatment

```swift
// iOS: Adapt status bar to content
.toolbarBackground(.visible, for: .navigationBar)
.toolbarColorScheme(.dark, for: .navigationBar) // Light text for dark backgrounds
```

```kotlin
// Android: Edge-to-edge with status bar color
enableEdgeToEdge()
// Handle system bars insets
Scaffold(
    modifier = Modifier.windowInsetsPadding(WindowInsets.systemBars)
) { /* content */ }
```

### Keyboard Handling

```swift
// iOS: Automatic keyboard avoidance in SwiftUI
ScrollView {
    TextField("Email", text: $email)
    TextField("Password", text: $password)
}
// SwiftUI automatically scrolls to focused field
```

```kotlin
// Android: Window insets for keyboard
Scaffold(
    modifier = Modifier.imePadding() // Adjusts for keyboard
) {
    TextField(value = email, onValueChange = { email = it })
}
```

---

## Design Token Mapping

Map platform-specific values to shared design tokens for Step 6 (Design System) integration.

```json
{
  "spacing": {
    "xs": { "ios": 4, "android": 4, "unit": { "ios": "pt", "android": "dp" } },
    "sm": { "ios": 8, "android": 8 },
    "md": { "ios": 16, "android": 16 },
    "lg": { "ios": 24, "android": 24 },
    "xl": { "ios": 32, "android": 32 }
  },
  "radius": {
    "sm": { "ios": 8, "android": 8 },
    "md": { "ios": 12, "android": 12 },
    "lg": { "ios": 16, "android": 16 },
    "full": { "ios": 9999, "android": 9999 }
  },
  "touchTarget": {
    "minimum": { "ios": 44, "android": 48 }
  },
  "typography": {
    "screenTitle": {
      "ios": { "style": "largeTitle", "size": 34, "weight": "bold" },
      "android": { "style": "headlineLarge", "size": 32, "weight": 400 }
    },
    "body": {
      "ios": { "style": "body", "size": 17, "weight": "regular" },
      "android": { "style": "bodyLarge", "size": 16, "weight": 400 }
    }
  }
}
```

### Using Tokens in React Native

```typescript
import { Platform } from 'react-native';

export const tokens = {
  touchTarget: Platform.select({ ios: 44, android: 48, default: 44 }),
  fontSize: {
    body: Platform.select({ ios: 17, android: 16, default: 16 }),
    title: Platform.select({ ios: 34, android: 32, default: 32 }),
  },
  navigation: {
    tabBarPosition: 'bottom', // Same on both platforms
    backGesture: Platform.select({
      ios: 'swipe-from-edge',
      android: 'system-back',
      default: 'system-back',
    }),
  },
};
```

---

## Accessibility

### VoiceOver (iOS) and TalkBack (Android)

Both platforms require semantic markup for screen reader users.

```swift
// iOS: VoiceOver
Image("profile-photo")
    .accessibilityLabel("Profile photo of Alice Johnson")
    .accessibilityAddTraits(.isImage)

Button(action: deleteItem) {
    Image(systemName: "trash")
}
.accessibilityLabel("Delete item")
.accessibilityHint("Removes this item from your list")
```

```kotlin
// Android: TalkBack
Image(
    painter = painterResource(R.drawable.profile),
    contentDescription = "Profile photo of Alice Johnson"
)

IconButton(onClick = deleteItem) {
    Icon(
        Icons.Default.Delete,
        contentDescription = "Delete item"
    )
}
```

### React Native: Cross-Platform Accessibility

```typescript
// Bad: No accessibility information
<TouchableOpacity onPress={onDelete}>
  <Image source={trashIcon} />
</TouchableOpacity>

// Good: Accessible on both platforms
<TouchableOpacity
  onPress={onDelete}
  accessible={true}
  accessibilityLabel="Delete item"
  accessibilityHint="Removes this item from your list"
  accessibilityRole="button"
>
  <Image source={trashIcon} accessibilityElementsHidden={true} />
</TouchableOpacity>
```

### Contrast Ratios

| Level | Ratio | Applies To |
|-------|-------|------------|
| **AA (minimum)** | 4.5:1 | Normal text (< 18pt / 14pt bold) |
| **AA large text** | 3:1 | Large text (>= 18pt / 14pt bold) |
| **AAA (enhanced)** | 7:1 | Normal text (target for critical content) |
| **Non-text** | 3:1 | UI components, graphical objects |

```swift
// Verify contrast with Xcode Accessibility Inspector
// or use the contrast ratio formula:
// ratio = (L1 + 0.05) / (L2 + 0.05)
// where L1 = lighter luminance, L2 = darker luminance
```

### Semantic Elements

| Concept | iOS (SwiftUI) | Android (Compose) | React Native |
|---------|--------------|-------------------|--------------|
| Heading | `.accessibilityAddTraits(.isHeader)` | `semantics { heading() }` | `accessibilityRole="header"` |
| Button | Automatic for `Button` | Automatic for `Button` | `accessibilityRole="button"` |
| Image | `.accessibilityLabel("desc")` | `contentDescription = "desc"` | `accessibilityLabel="desc"` |
| Link | `.accessibilityAddTraits(.isLink)` | `semantics { role = Role.Link }` | `accessibilityRole="link"` |
| Adjustable | `.accessibilityAdjustableAction` | `semantics { stateDescription }` | `accessibilityRole="adjustable"` |

---

## Platform Design Checklist

Before shipping any mobile UI:

### Typography
- [ ] Text uses system text styles or Dynamic Type / SP scaling
- [ ] No hardcoded font sizes
- [ ] Layout tested at accessibility text sizes (XXXL)
- [ ] Custom fonts registered with `UIFontMetrics` (iOS) or `SP` units (Android)

### Touch Targets
- [ ] All tappable elements meet 44pt (iOS) / 48dp (Android) minimum
- [ ] Hit areas expanded for small visual elements
- [ ] Sufficient spacing between adjacent touch targets (8pt minimum)

### Navigation
- [ ] Tab bar (iOS) / Bottom navigation (Android) for primary navigation
- [ ] Back gesture works correctly on both platforms
- [ ] Modal presentation follows platform conventions

### Accessibility
- [ ] All images have accessibility labels (or are marked decorative)
- [ ] VoiceOver / TalkBack reading order is logical
- [ ] Color contrast meets AA (4.5:1) minimum
- [ ] Interactive elements have accessibility roles and hints
- [ ] Tested with VoiceOver (iOS) and TalkBack (Android)

### Platform Fidelity
- [ ] Uses platform-native patterns (not forced web patterns)
- [ ] Respects safe areas (notch, home indicator, status bar)
- [ ] Supports dark mode with adaptive colors
- [ ] Design tokens map correctly to platform values

---

## Integration with Sigma Protocol

### Step 3 (UX Design)
Reference platform navigation patterns when designing user flows.

### Step 6 (Design System)
Use the design token mapping to create platform-adaptive design tokens.

### Step 8 (Technical Spec)
Specify platform adaptation requirements in technical specifications.

### Step 12 (Context Engine)
Generate platform-specific rules based on target platforms.

### /implement-prd
Apply platform-native patterns during implementation. Verify touch targets and Dynamic Type support.

---

_Native apps must feel native. Users develop muscle memory for platform conventions -- tab bars on iOS, bottom navigation on Android, back gestures, pull-to-refresh. Violating these expectations creates friction that no amount of visual polish can overcome._
