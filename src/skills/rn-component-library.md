---
name: rn-component-library
description: "React Native component library patterns with React Native Reusables (shadcn/ui for RN), Bklit UI charts, design token integration, and Storybook 9 component development workflow."
version: "1.0.0"
source: "sigma-mobile"
triggers:
  - shadcn-mobile
  - react-native-reusables
  - bklit
  - chart
  - data-viz
  - mobile-components
---

# RN Component Library Skill

Build production component libraries for React Native using React Native Reusables (shadcn/ui port for RN), Bklit UI for data visualization, design token integration, and Storybook 9. Copy-paste ownership model — you own every component.

## When to Invoke

Invoke this skill when:

- Setting up a shared component library for a React Native project
- Installing or customizing React Native Reusables components
- Adding charts or data visualization to a mobile app
- Connecting Sigma Protocol design tokens (Step 6) to the component theme
- Setting up Storybook for on-device component development

---

## 1. React Native Reusables Setup

Components are copied into your project (shadcn/ui model), not installed as a dependency.

```bash
npx @react-native-reusables/cli@latest init
npx @react-native-reusables/cli@latest add button input dialog sheet select tabs avatar card
```

```
components/
  ui/button.tsx, input.tsx, dialog.tsx, sheet.tsx, select.tsx, tabs.tsx ...
  lib/utils.ts (cn() helper, cva variants), icons.ts (Lucide re-exports)
```

Ensure `tailwind.config.js` includes component paths and uses `nativewind/preset` with HSL CSS variable colors (`hsl(var(--primary))`, etc.).

---

## 2. Core Components

### Bad Pattern

```typescript
// INCONSISTENT: Raw primitives with ad-hoc styling
<TouchableOpacity style={{ backgroundColor: '#3b82f6', padding: 14, borderRadius: 8 }}>
  <Text style={{ color: 'white', textAlign: 'center' }}>Log In</Text>
</TouchableOpacity>
```

### Good Pattern

```typescript
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

function LoginForm() {
  return (
    <View className="gap-4 p-6">
      <View className="gap-2">
        <Label nativeID="email">Email</Label>
        <Input placeholder="you@example.com" keyboardType="email-address" aria-labelledby="email" />
      </View>
      <Button onPress={handleLogin}><Text>Log In</Text></Button>
      <Button variant="outline" onPress={handleSignUp}><Text>Create Account</Text></Button>
    </View>
  );
}
```

### Extending Variants

```typescript
const buttonVariants = cva('flex-row items-center justify-center rounded-lg', {
  variants: {
    variant: {
      default: 'bg-primary', secondary: 'bg-secondary', destructive: 'bg-destructive',
      outline: 'border border-input bg-background', ghost: '', link: '',
      premium: 'bg-gradient-to-r from-amber-500 to-orange-500', // Custom
    },
    size: { default: 'h-12 px-5', sm: 'h-9 px-3', lg: 'h-14 px-8', icon: 'h-10 w-10' },
  },
  defaultVariants: { variant: 'default', size: 'default' },
});
```

### Dialog and Sheet

```typescript
// Confirmation dialog
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader><DialogTitle>Delete Item</DialogTitle></DialogHeader>
    <Text className="text-muted-foreground">This action cannot be undone.</Text>
    <DialogFooter>
      <Button variant="outline" onPress={() => onOpenChange(false)}><Text>Cancel</Text></Button>
      <Button variant="destructive" onPress={onConfirm}><Text>Delete</Text></Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Bottom sheet
<Sheet open={open} onOpenChange={onOpenChange}>
  <SheetContent side="bottom">
    <SheetHeader><SheetTitle>Actions</SheetTitle></SheetHeader>
    <Button variant="ghost" className="justify-start"><Text>Edit</Text></Button>
    <Button variant="ghost" className="justify-start"><Text>Share</Text></Button>
  </SheetContent>
</Sheet>
```

---

## 3. Bklit UI Charts

Typed chart library built on react-native-skia. Replaces unmaintained react-native-chart-kit.

### Bad Pattern

```typescript
// OUTDATED: react-native-chart-kit — unmaintained, limited types
import { LineChart } from 'react-native-chart-kit';
<LineChart data={{ datasets: [{ data }] }} width={300} height={200} chartConfig={{...}} />
```

### Good Pattern

```typescript
import { LineChart, BarChart, RingChart, type ChartDataPoint } from '@bklit/charts';

interface RevenuePoint extends ChartDataPoint { date: string; revenue: number; }

<LineChart<RevenuePoint>
  data={data} xKey="date" yKeys={['revenue']} height={220}
  lineColors={[colors.primary]} curveType="natural" showGrid showTooltip
  formatY={(v) => `$${(v / 1000).toFixed(0)}k`} />

<BarChart<CategoryData>
  data={data} xKey="category" yKeys={['current', 'previous']}
  barColors={[colors.primary, colors.muted]} groupMode="grouped" />

<RingChart<AllocationData>
  data={data} valueKey="percentage" labelKey="asset"
  innerRadius={0.6} showLabels showPercentages />
```

| Chart | Use Case |
|-------|----------|
| `LineChart` | Time series, trends |
| `AreaChart` | Volume, cumulative data |
| `BarChart` | Comparisons, categories |
| `RingChart` / `PieChart` | Proportions, allocations |
| `RadarChart` | Multi-axis comparisons |
| `SankeyChart` | Flow visualization |
| `ChoroplethMap` | Geographic data |

---

## 4. Design Token Integration

Map Sigma Protocol tokens from Step 6 (DESIGN-SYSTEM.md) to NativeWind CSS variables.

```typescript
// lib/theme.ts
import { vars } from 'nativewind';

const sigmaTokens = {
  light: {
    '--background': '0 0% 100%', '--foreground': '224 71.4% 4.1%',
    '--primary': '220.9 39.3% 11%', '--primary-foreground': '210 20% 98%',
    '--destructive': '0 84.2% 60.2%', '--border': '220 13% 91%',
    // ... remaining tokens from DESIGN-SYSTEM.md
  },
  dark: {
    '--background': '224 71.4% 4.1%', '--foreground': '210 20% 98%',
    '--primary': '210 20% 98%', '--primary-foreground': '220.9 39.3% 11%',
    '--destructive': '0 62.8% 30.6%', '--border': '215 27.9% 16.9%',
  },
};

export const themeVars = { light: vars(sigmaTokens.light), dark: vars(sigmaTokens.dark) };

// Apply in root layout
export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return <View style={themeVars[colorScheme ?? 'light']} className="flex-1"><Slot /></View>;
}
```

```typescript
// lib/tokens.ts — Spacing and typography scales from Step 6
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 } as const;
export const typography = {
  h1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
  h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;
```

---

## 5. Storybook 9

On-device component development with `@storybook/react-native` v9 and CSF3 format.

```bash
npx storybook@latest init --type react_native
```

```typescript
// components/ui/button.stories.tsx — CSF3 format
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
};
export default meta;

export const Default: StoryObj<typeof Button> = {
  render: (args) => <Button {...args}><Text>Button</Text></Button>,
};

export const AllVariants: StoryObj<typeof Button> = {
  render: () => (
    <View className="gap-3">
      <Button variant="default"><Text>Default</Text></Button>
      <Button variant="destructive"><Text>Destructive</Text></Button>
      <Button variant="outline"><Text>Outline</Text></Button>
    </View>
  ),
};
```

```typescript
// app/storybook.tsx — Dev-only entry point
import Constants from 'expo-constants';
const SHOW_STORYBOOK = Constants.expoConfig?.extra?.storybook === true;

export default function RootLayout() {
  if (SHOW_STORYBOOK) return <StorybookUI />;
  return <Stack><Stack.Screen name="(tabs)" /></Stack>;
}
```

---

## Integration with Sigma Protocol

- **Step 5 (Wireframes):** Use RN Reusables components to match wireframe specs.
- **Step 6 (Design System):** Map tokens to NativeWind theme variables (section 4).
- **Step 7 (Interface States):** Use Storybook stories for loading, error, empty, success states.
- **/implement-prd:** Use RN Reusables for standard components, Bklit for charts.

---

_Own your components. RN Reusables gives you the source — customize variants, add project-specific props, and theme to match your design system._
