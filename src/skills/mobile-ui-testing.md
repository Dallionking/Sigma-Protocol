---
name: mobile-ui-testing
description: "Mobile UI testing skill covering Maestro YAML flows, Detox gray-box testing, ViewInspector for SwiftUI, Prefire auto-snapshots, swift-snapshot-testing, Storybook 9 for React Native, and ios-simulator-mcp integration."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - maestro
  - detox
  - e2e
  - ui-test
  - mobile-test
  - snapshot-test
---

# Mobile UI Testing Skill

Comprehensive coverage of mobile UI testing strategies across React Native and SwiftUI. This skill guides framework selection, test authoring, snapshot management, and CI integration for reliable, fast mobile test suites.

## When to Invoke

Invoke this skill when:

- Setting up E2E or UI tests for a mobile application
- Choosing between Maestro, Detox, XCTest, or Appium
- Writing Maestro YAML flows or Detox test specs
- Implementing snapshot testing for SwiftUI or React Native
- Configuring Storybook for React Native component testing
- Integrating ios-simulator-mcp for visual verification in Claude Code

---

## Testing Framework Decision Matrix

| Criteria | Maestro | Detox | XCTest / XCUITest | Appium |
|----------|---------|-------|--------------------|--------|
| **Setup complexity** | Low (single binary) | Medium (RN-specific config) | Low (built into Xcode) | High (server + drivers) |
| **Speed** | Fast (no compilation) | Fast (gray-box sync) | Fast (native) | Slow (black-box) |
| **CI support** | Excellent (Maestro Cloud) | Good (custom runners) | Excellent (Xcode Cloud, GH Actions) | Good (Sauce Labs, BrowserStack) |
| **Platform coverage** | iOS + Android | iOS + Android (RN only) | iOS only | iOS + Android + Web |
| **Learning curve** | Low (YAML) | Medium (JS/TS) | Medium (Swift/ObjC) | High (WebDriver protocol) |
| **Best for** | Cross-platform E2E | RN gray-box testing | SwiftUI unit + UI tests | Legacy/multi-framework |

**Recommendation:**
- **Cross-platform E2E flows:** Maestro
- **React Native gray-box:** Detox
- **SwiftUI view testing:** XCTest + ViewInspector + Prefire
- **Avoid Appium** unless testing across RN + native + web in one suite

---

## Maestro Flows

Maestro uses YAML-based flow definitions that run against real devices or simulators without compilation overhead. Flows describe user journeys declaratively.

### Bad Pattern

```bash
# Manual QA script checked into a wiki somewhere
1. Open the app
2. Tap the "Sign In" button
3. Type "test@example.com" into the email field
4. Type "password123" into the password field
5. Tap "Submit"
6. Verify the home screen appears
7. Scroll down and verify "Welcome" text is visible
```

### Good Pattern

```yaml
# flows/auth/login-happy-path.yaml
appId: com.example.myapp
---
- launchApp:
    clearState: true

- tapOn: "Sign In"

- tapOn:
    id: "email-input"
- inputText: "test@example.com"

- tapOn:
    id: "password-input"
- inputText: "password123"

- tapOn: "Submit"

- assertVisible:
    id: "home-screen"
    timeout: 5000

- scrollUntilVisible:
    element:
      text: "Welcome"
    direction: DOWN
    timeout: 3000
```

### Conditional Flows and Reuse

```yaml
# flows/shared/dismiss-onboarding.yaml
appId: com.example.myapp
---
- runFlow:
    when:
      visible: "Skip Onboarding"
    commands:
      - tapOn: "Skip Onboarding"

# flows/auth/login-with-onboarding.yaml
appId: com.example.myapp
---
- launchApp:
    clearState: true
- runFlow: flows/shared/dismiss-onboarding.yaml
- tapOn: "Sign In"
- tapOn:
    id: "email-input"
- inputText: "test@example.com"
- tapOn:
    id: "password-input"
- inputText: "password123"
- tapOn: "Submit"
- assertVisible:
    id: "home-screen"
```

### Repeat and Data-Driven Tests

```yaml
# flows/feed/scroll-feed.yaml
appId: com.example.myapp
---
- launchApp
- tapOn: "Feed"
- repeat:
    times: 5
    commands:
      - scroll:
          direction: DOWN
      - assertVisible:
          id: "feed-item"
```

### CI Integration

```yaml
# .github/workflows/maestro.yml
jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: mobile-dev-inc/action-maestro-cloud@v1
        with:
          api-key: ${{ secrets.MAESTRO_CLOUD_KEY }}
          app-file: build/MyApp.app
          flows: flows/
```

---

## Detox Gray-Box Testing

Detox synchronizes with the React Native bridge, waiting for async operations to complete before assertions. This eliminates flaky sleep-based waits.

### Bad Pattern

```typescript
// SLOW: Appium black-box test with arbitrary waits
describe('Login', () => {
  it('should log in', async () => {
    await driver.findElement('email').sendKeys('test@example.com');
    await driver.findElement('password').sendKeys('password123');
    await driver.findElement('submit').click();
    await sleep(5000); // Arbitrary wait -- flaky in CI
    const homeScreen = await driver.findElement('home-screen');
    expect(homeScreen.isDisplayed()).toBe(true);
  });
});
```

### Good Pattern

```typescript
// FAST: Detox gray-box with automatic synchronization
import { device, element, by, expect } from 'detox';

describe('Login', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should log in with valid credentials', async () => {
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-button')).tap();

    // No sleep needed -- Detox waits for RN bridge to settle
    await expect(element(by.id('home-screen'))).toBeVisible();
    await expect(element(by.text('Welcome'))).toBeVisible();
  });

  it('should show error for invalid credentials', async () => {
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('bad-password');
    await element(by.id('submit-button')).tap();

    await expect(element(by.id('error-message'))).toBeVisible();
    await expect(element(by.text('Invalid credentials'))).toBeVisible();
  });
});
```

### Detox Configuration

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: { '$0': 'jest', config: 'e2e/jest.config.js' },
    jest: { setupTimeout: 120000 },
  },
  apps: {
    'ios.release': {
      type: 'ios.app',
      binaryPath: 'ios/build/MyApp.app',
      build: 'xcodebuild -workspace ios/MyApp.xcworkspace -scheme MyApp -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.release': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release',
    },
  },
  devices: {
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 16' } },
    emulator: { type: 'android.emulator', device: { avdName: 'Pixel_7' } },
  },
  configurations: {
    'ios.release': { device: 'simulator', app: 'ios.release' },
    'android.release': { device: 'emulator', app: 'android.release' },
  },
};
```

---

## SwiftUI Testing

### ViewInspector for Unit Testing Views

ViewInspector lets you traverse SwiftUI view hierarchies and assert on structure, text content, modifiers, and state without rendering pixels.

```swift
// Bad: Only testing the ViewModel, never the View itself
func testViewModel() {
    let vm = ProfileViewModel()
    vm.loadUser()
    XCTAssertEqual(vm.userName, "Alice")
    // View layer is untested -- layout bugs slip through
}
```

```swift
// Good: ViewInspector tests the actual SwiftUI view
import ViewInspector

struct ProfileView: View, Inspectable {
    @StateObject var viewModel = ProfileViewModel()

    var body: some View {
        VStack {
            Text(viewModel.userName)
                .accessibilityIdentifier("user-name")
            Button("Edit Profile") {
                viewModel.startEditing()
            }
            .accessibilityIdentifier("edit-button")
        }
    }
}

final class ProfileViewTests: XCTestCase {
    func testDisplaysUserName() throws {
        let view = ProfileView()
        let text = try view.inspect()
            .find(viewWithAccessibilityIdentifier: "user-name")
            .text()
            .string()
        XCTAssertEqual(text, "Alice")
    }

    func testEditButtonExists() throws {
        let view = ProfileView()
        let button = try view.inspect()
            .find(viewWithAccessibilityIdentifier: "edit-button")
            .button()
        XCTAssertNoThrow(try button.tap())
    }
}
```

### Prefire Auto-Generated Snapshot Tests

Prefire scans your SwiftUI `#Preview` declarations and auto-generates snapshot tests, ensuring every preview is also a regression test.

```swift
// 1. Add #Preview to your view (you likely already have this)
#Preview("Profile - Loaded") {
    ProfileView(viewModel: .mockLoaded)
}

#Preview("Profile - Loading") {
    ProfileView(viewModel: .mockLoading)
}

#Preview("Profile - Error") {
    ProfileView(viewModel: .mockError)
}

// 2. Prefire auto-generates tests -- no manual snapshot code needed
// Run: swift package prefire-generate
// Output: Tests/PrefireTests/ProfileViewSnapshotTests.swift (auto-generated)
```

### swift-snapshot-testing for Pixel Comparison

```swift
import SnapshotTesting
import SwiftUI

final class ProfileViewSnapshotTests: XCTestCase {
    func testProfileLoaded() {
        let view = ProfileView(viewModel: .mockLoaded)
        assertSnapshot(
            of: view,
            as: .image(
                layout: .device(config: .iPhone13),
                traits: .init(userInterfaceStyle: .light)
            )
        )
    }

    func testProfileLoadedDarkMode() {
        let view = ProfileView(viewModel: .mockLoaded)
        assertSnapshot(
            of: view,
            as: .image(
                layout: .device(config: .iPhone13),
                traits: .init(userInterfaceStyle: .dark)
            )
        )
    }

    func testProfileAccessibility() {
        let view = ProfileView(viewModel: .mockLoaded)
        assertSnapshot(
            of: view,
            as: .image(
                layout: .device(config: .iPhone13),
                traits: UITraitCollection(preferredContentSizeCategory: .accessibilityExtraLarge)
            )
        )
    }
}
```

---

## Storybook 9 for React Native

Storybook 9 with `@storybook/react-native` provides on-device component stories using CSF3 format. Components render on the actual device, catching platform-specific rendering issues.

### Setup

```bash
npx storybook@latest init --type react_native
```

### Bad Pattern

```typescript
// Testing components only in Jest with jsdom -- misses native rendering bugs
import { render } from '@testing-library/react-native';

test('Button renders', () => {
  const { getByText } = render(<Button title="Click" />);
  expect(getByText('Click')).toBeTruthy();
  // Passes in jsdom, but the button might be invisible on a real device
});
```

### Good Pattern

```typescript
// components/Button.stories.tsx -- CSF3 format
import type { Meta, StoryObj } from '@storybook/react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    title: 'Get Started',
    onPress: () => console.log('pressed'),
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    title: 'Learn More',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    title: 'Submit',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 12, padding: 16 }}>
      <Button variant="primary" title="Primary" />
      <Button variant="secondary" title="Secondary" />
      <Button variant="destructive" title="Delete" />
    </View>
  ),
};
```

### Visual Regression with Storybook

```typescript
// .storybook/test-runner.ts
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

const config = {
  async postVisit(page, context) {
    const image = await page.screenshot();
    expect(image).toMatchImageSnapshot({
      customDiffConfig: { threshold: 0.1 },
      failureThreshold: 0.01,
      failureThresholdType: 'percent',
    });
  },
};

export default config;
```

---

## ios-simulator-mcp Integration

The `ios-simulator-mcp` server enables Claude Code to interact with iOS simulators directly -- capturing screenshots, inspecting the accessibility tree, and tapping elements for automated visual verification during development.

### Capabilities

| Action | Description |
|--------|-------------|
| **Screenshot** | Capture current simulator screen as PNG |
| **Accessibility tree** | Inspect VoiceOver element hierarchy |
| **Tap** | Tap coordinates or accessibility identifiers |
| **Type text** | Enter text into focused fields |
| **Launch app** | Boot simulator and launch app by bundle ID |

### Workflow: Visual Verification in Claude Code

```
1. Developer: "Check if the profile screen matches the design"
2. Claude: Launches app in simulator via ios-simulator-mcp
3. Claude: Navigates to profile screen (tap, type, scroll)
4. Claude: Captures screenshot
5. Claude: Analyzes screenshot against design spec
6. Claude: Reports mismatches (spacing, color, alignment)
```

### Accessibility Tree Inspection

```
Use ios-simulator-mcp to dump the accessibility tree and verify:
- All interactive elements have accessibility labels
- VoiceOver reading order matches visual layout
- Touch targets meet 44pt minimum
- Images have descriptive accessibility labels
```

---

## Snapshot Testing Strategy

### Pixel vs Structural Snapshots

| Approach | Tool | Pros | Cons |
|----------|------|------|------|
| **Pixel comparison** | swift-snapshot-testing, jest-image-snapshot | Catches visual regressions | Brittle across OS versions |
| **Structural** | ViewInspector, react-test-renderer | Stable, fast | Misses visual-only bugs |
| **Hybrid** | Prefire + ViewInspector | Best coverage | More setup |

**Recommendation:** Use structural tests for logic-heavy views, pixel snapshots for design-critical screens.

### Naming Conventions

```
__snapshots__/
  ProfileView/
    testProfileLoaded.light.iPhone16.png
    testProfileLoaded.dark.iPhone16.png
    testProfileLoaded.a11y-xl.iPhone16.png
    testProfileLoaded.light.iPadPro.png
```

Format: `{testName}.{theme}.{device}.png`

### CI Golden Image Management

```yaml
# .github/workflows/snapshots.yml
jobs:
  snapshot-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true  # Golden images stored in Git LFS

      - name: Run snapshot tests
        run: xcodebuild test -scheme MyApp -destination 'platform=iOS Simulator,name=iPhone 16'

      - name: Upload diff artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: snapshot-diffs
          path: '**/Failures/**'
```

```gitattributes
# .gitattributes -- Track golden images in LFS
**/__snapshots__/**/*.png filter=lfs diff=lfs merge=lfs -text
```

### Updating Snapshots

```bash
# Swift: Record new golden images
RECORD_MODE=1 xcodebuild test -scheme MyApp

# Jest: Update snapshots
npx jest --updateSnapshot

# Review diffs in PR before merging
```

---

## Mobile Testing Checklist

Before shipping any mobile feature:

- [ ] E2E happy-path flow exists (Maestro or Detox)
- [ ] Critical error states tested (network failure, auth expiry)
- [ ] Snapshot tests cover design-critical screens
- [ ] Dark mode snapshots included
- [ ] Dynamic Type / accessibility size snapshots included
- [ ] Accessibility tree verified (labels, reading order, touch targets)
- [ ] Tests run in CI on every PR
- [ ] Golden images stored in Git LFS
- [ ] Flaky tests quarantined, not deleted

---

## Integration with Sigma Protocol

### Step 5 (Wireframe Prototypes)
Generate Maestro flows alongside wireframe PRDs to validate flows early.

### Step 8 (Technical Spec)
Include testing strategy (framework selection, CI configuration) in technical specifications.

### /implement-prd
Write Detox or Maestro tests alongside feature implementation. Never mark a mobile PRD complete without E2E coverage.

### Step 13 (Skillpack Generator)
Include this skill in projects with mobile UI components.

---

_Tests that run on real devices catch bugs that unit tests miss. Invest in E2E flows early -- the cost of a flaky test suite is far lower than the cost of shipping a broken screen._
