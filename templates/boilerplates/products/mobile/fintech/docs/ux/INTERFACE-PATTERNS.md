# Interface Patterns — Trading Platform

**Date:** 2025-12-11  
**Step:** 3 — UX Design & Interface Planning  
**Framework:** iOS Human Interface Guidelines + Cyberpunk Fintech Style

---

## Core UI Patterns

### 1. Data Display Patterns

#### Balance Display (Hero Pattern)

```
┌─────────────────────────────────────┐
│                                     │
│            $12,847.31               │
│         (48px, mono, glow)          │
│                                     │
│            +$42.17                  │
│          (24px, green)              │
│            today                    │
│         (13px, muted)               │
│                                     │
└─────────────────────────────────────┘

Specifications:
- Balance: SF Mono, 48px, Bold, #6366F1
- Text shadow: 0 0 40px rgba(99,102,241,0.5)
- Daily change: SF Mono, 24px, Semibold
- Positive: #6366F1, Negative: #FF4136
- Label: SF Pro Text, 13px, Medium, #A0A0A0
- Animation: Subtle pulse (2s infinite), number morph on update
```

#### Card Pattern (Information Container)

```
┌─────────────────────────────────────┐
│  Card Title               [Action] │
│  ─────────────────────────────────  │
│                                     │
│  Primary Content                    │
│  Secondary content or description   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Nested element if needed   │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘

Specifications:
- Background: #0A0A0A
- Border: 1px solid #1A1A1A
- Border radius: 16px
- Padding: 20px
- Title: 17px, Semibold, #FFFFFF
- Content: 15px, Regular, #A0A0A0
- Active state: Border glows #6366F133
```

#### List Item Pattern

```
┌─────────────────────────────────────┐
│  [Icon]  Title              Amount  │
│          Subtitle           [Arrow] │
└─────────────────────────────────────┘

Specifications:
- Height: 64px minimum
- Padding: 16px horizontal
- Icon: 24x24, #6366F1
- Title: 17px, Medium, #FFFFFF
- Subtitle: 13px, Regular, #A0A0A0
- Amount: 17px, Mono, #6366F1
- Chevron: 12px, #666666
- Separator: 1px #1A1A1A (inset 56px left)
- Press state: Background #141414
```

#### Income Event Item

```
┌─────────────────────────────────────┐
│  [⚡]  AI Cycle Complete    +$12.31 │
│        2 hours ago              [>] │
└─────────────────────────────────────┘

Animation on appear:
- Slide in from right (translateX: 20 → 0)
- Fade in (opacity: 0 → 1)
- Stagger: 50ms between items
```

### 2. Form Patterns

#### Text Input

```
┌─────────────────────────────────────┐
│  Label                              │
│  ┌─────────────────────────────┐   │
│  │  Placeholder text           │   │
│  └─────────────────────────────┘   │
│  Helper text or error              │
└─────────────────────────────────────┘

States:
- Default: Border #1A1A1A
- Focused: Border #6366F1, Glow effect
- Error: Border #FF4136, Shake animation
- Disabled: Opacity 0.5

Specifications:
- Background: #0A0A0A
- Border: 1px solid #1A1A1A
- Border radius: 8px
- Padding: 14px 16px
- Font: 17px, Regular
- Label: 13px, Medium, #A0A0A0, margin-bottom 8px
```

#### Amount Input (Special)

```
┌─────────────────────────────────────┐
│                                     │
│              $ 500                  │
│         (large, centered)           │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────────┐   │
│  │ 50 │ │100 │ │500 │ │ Custom │   │
│  └────┘ └────┘ └────┘ └────────┘   │
│                                     │
└─────────────────────────────────────┘

Specifications:
- Amount display: SF Mono, 48px, Bold, #FFFFFF
- Quick amounts: Pill buttons, 44px height
- Selected: #6366F1 background, #000000 text
- Unselected: #1A1A1A border, #FFFFFF text
```

#### Toggle/Switch

```
OFF:  ┌────[○    ]────┐
ON:   ┌────[    ●]────┐  (with glow)

Specifications:
- Track: 51x31px
- Thumb: 27x27px
- OFF track: #333333
- ON track: #6366F1
- ON glow: 0 0 10px rgba(99,102,241,0.5)
- Animation: Spring physics (damping: 15, stiffness: 300)
```

#### Segmented Control

```
┌──────────────────────────────────┐
│  [ Safe ] [ Balanced ] [ Aggro ] │
└──────────────────────────────────┘

Specifications:
- Height: 44px
- Background: #0A0A0A
- Border: 1px solid #1A1A1A
- Selected segment: #6366F1 background
- Selected text: #000000
- Unselected text: #FFFFFF
- Border radius: 8px
- Animation: Slide indicator (200ms spring)
```

### 3. Navigation Patterns

#### Tab Bar (Bottom Navigation)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [🏠]      [📈]      [➕]      [🤖]      [👤]  │
│  Home     Income            AI      Account     │
│                                                 │
└─────────────────────────────────────────────────┘

Specifications:
- Height: 84px (34px safe area on iPhone X+)
- Background: #0A0A0A
- Border top: 1px solid #1A1A1A
- Icon size: 28x28
- Label: 10px, Medium
- Active: #6366F1 with glow
- Inactive: #666666
- Center button: 56px floating, elevated
```

#### Navigation Bar (Header)

```
┌─────────────────────────────────────┐
│  [<]  Screen Title           [...]  │
└─────────────────────────────────────┘

Specifications:
- Height: 44px (+ safe area)
- Background: #000000 or blur effect
- Title: 17px, Semibold, centered
- Back button: Chevron, #6366F1
- Action button: Icon or text, #6366F1
```

#### Modal Sheet

```
┌─────────────────────────────────────┐
│  ════════════════════════════════   │ ← Drag indicator
│                                     │
│  Modal Title              [X]       │
│  ─────────────────────────────────  │
│                                     │
│  Content area                       │
│                                     │
│  [ Primary Action ]                 │
│                                     │
└─────────────────────────────────────┘

Specifications:
- Background: #0A0A0A
- Corner radius: 16px (top only)
- Drag indicator: 36x5px, #333333, centered
- Dismiss: Swipe down or X button
- Animation: Slide up with spring (300ms)
- Backdrop: #000000 at 70% opacity
```

### 4. Feedback Patterns

#### Toast Notification

```
┌─────────────────────────────────────┐
│  [✓]  Deposit initiated             │
└─────────────────────────────────────┘

Specifications:
- Position: Top, below safe area
- Background: #141414
- Border: 1px solid #1A1A1A
- Border radius: 12px
- Padding: 12px 16px
- Icon: 20x20
- Text: 15px, Medium
- Duration: 3 seconds
- Animation: Slide down + fade (300ms)
```

#### Success Animation

```
       ╭─────╮
       │  ✓  │  ← Checkmark draws in
       ╰─────╯
    
    Deposit Complete!
       $500.00

Specifications:
- Checkmark: SVG path animation (0.5s)
- Circle: Scale from 0 → 1 (spring)
- Text: Fade in after checkmark (0.3s)
- Confetti: Subtle particle burst (optional)
- Haptic: Success pattern
```

#### Error State

```
┌─────────────────────────────────────┐
│                                     │
│       [!]  Something went wrong     │
│                                     │
│       We couldn't complete your     │
│       request. Please try again.    │
│                                     │
│       [ TRY AGAIN ]                 │
│                                     │
└─────────────────────────────────────┘

Specifications:
- Icon: Warning triangle, #FF4136
- Title: 20px, Semibold, #FFFFFF
- Body: 15px, Regular, #A0A0A0
- Animation: Subtle shake (translateX: -5, 5, -3, 3, 0)
- Haptic: Error pattern
```

#### Loading Indicators

**Skeleton Screen (Preferred):**
```
┌─────────────────────────────────────┐
│  ████████████████                   │ ← Shimmer animation
│  ████████                           │
│  ████████████████████               │
└─────────────────────────────────────┘

Specifications:
- Background: #141414
- Shimmer: Linear gradient, left to right
- Duration: 1.5s infinite
- Border radius: Match content shape
```

**Progress Ring (For known duration):**
```
        ╭───────╮
        │  45%  │  ← Circular progress
        ╰───────╯

Specifications:
- Size: 64px diameter
- Track: #1A1A1A
- Progress: #6366F1
- Stroke width: 4px
- Animation: Smooth fill (timing function)
```

---

## Interaction Patterns

### Touch Targets

| Element | Minimum Size | Recommended |
|---------|--------------|-------------|
| Buttons | 44x44px | 48x48px |
| List items | 44px height | 64px height |
| Icons (tappable) | 44x44px | 48x48px |
| Toggle switches | 51x31px | Standard |
| Segmented control | 44px height | Standard |

### Gestures

| Gesture | Action | Context |
|---------|--------|---------|
| Tap | Primary action | Buttons, list items, tabs |
| Long press | Secondary menu | List items, cards |
| Swipe left | Delete/archive | List items (future) |
| Swipe right | Quick action | List items (future) |
| Swipe from left edge | Go back | Stack navigation |
| Swipe down | Dismiss | Modals, refresh |
| Pull down | Refresh | Scrollable content |
| Pinch | Zoom (if applicable) | Charts (future) |

### Haptic Feedback

| Action | Haptic Type | When |
|--------|-------------|------|
| Button press | Light impact | On press down |
| Tab switch | Light impact | On selection |
| Toggle switch | Light impact | On state change |
| Successful action | Success | Deposit complete, AI activated |
| Error | Error | Validation failure, network error |
| Pull to refresh | Selection changed | At pull threshold |

### Animation Timing

| Interaction | Duration | Easing |
|-------------|----------|--------|
| Button press | 100ms | Spring (damping: 15) |
| Page transition | 350ms | Ease-out |
| Modal present | 300ms | Spring (damping: 25) |
| Modal dismiss | 250ms | Ease-in |
| Tab switch | 200ms | Ease-out |
| Toast appear | 300ms | Spring |
| Toast dismiss | 200ms | Ease-in |
| Skeleton shimmer | 1500ms | Linear (infinite) |
| Pulse (AI status) | 2000ms | Ease-in-out (infinite) |

---

## State Specifications by Screen

### Home Screen

| Element | Default | Loading | Error | Empty |
|---------|---------|---------|-------|-------|
| Balance | Green, glowing | Skeleton | "$---.--" muted | "$0.00" |
| Daily change | +$X.XX animated | Skeleton | Hidden | Hidden |
| AI Status card | Pulsing bars | Skeleton | "Reconnecting..." | "WAITING" |
| Activity feed | 3 items | 3 skeletons | Error card | Empty state |

### Income Screen

| Element | Default | Loading | Error | Empty |
|---------|---------|---------|-------|-------|
| Total earned | Green, large | Skeleton | Hidden | "$0.00" |
| Chart | Line + gradient | Skeleton shape | Retry button | Flat line |
| Time filter | Interactive | Disabled | Disabled | Disabled |
| Event list | Populated | Skeletons | Error state | Empty illustration |

### AI Status Screen

| Element | Default | Loading | Error | Inactive |
|---------|---------|---------|-------|----------|
| Status | "ACTIVE" green | "INITIALIZING" | "RECONNECTING" | "IDLE" |
| Bars | Pulsing green | Sequential light-up | Muted, static | Gray, static |
| Stats | 6 values | Skeletons | "—" placeholders | "Waiting for activation" |

---

## Component Library Reference

### Buttons

| Type | Use Case | Visual |
|------|----------|--------|
| Primary | Main CTA | Green fill, black text |
| Secondary | Alternative action | Green border, green text |
| Tertiary | Low emphasis | Text only, green |
| Destructive | Delete, cancel | Red fill/border |
| Disabled | Not available | Gray, 50% opacity |

### Icons

| Category | Examples | Style |
|----------|----------|-------|
| Navigation | Home, Chart, AI, Account | Line, 28px, 2px stroke |
| Actions | Plus, Check, X, Refresh | Line, 24px |
| Status | Warning, Error, Success | Filled, contextual color |
| Indicators | Chevron, Arrow | Line, 12-16px |

### Color Usage

| Purpose | Color | When to Use |
|---------|-------|-------------|
| Primary action | #6366F1 | CTAs, active states, positive values |
| Success | #6366F1 | Confirmations, positive changes |
| Error | #FF4136 | Errors, negative values, destructive |
| Warning | #FFDC00 | Cautions, pending states |
| Info | #00BFFF | Neutral information |
| Neutral | #A0A0A0 | Secondary text, disabled |

---

**Status:** ✅ Interface Patterns Complete  
**Ready for:** Phase E (Accessibility Requirements)



