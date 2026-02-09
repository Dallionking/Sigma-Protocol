# Icon Migration Guide

**Status:** COMPLETE  
**Date:** December 15, 2025

---

## Overview

All emoji icons have been replaced with Lucide React Native vector icons via a centralized `Icon` component.

---

## Icon Component Location

```
components/primitives/Icon.tsx
```

---

## Usage

```tsx
import { Icon } from '@/components/primitives';

// Basic usage
<Icon name="home" />

// With size and color
<Icon name="bell" size={28} color="primary" />

// Focused state (for tab bar, etc.)
<Icon name="account" focused={isFocused} />

// Available colors
// 'primary' | 'muted' | 'white' | 'error' | 'warning' | 'success' | string
```

---

## Complete Emoji to Lucide Mapping

### Navigation / Tab Bar

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `home` | Home |
| `income` | DollarSign |
| `ai` | Bot |
| `account` | User |

### Account Menu

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `user`, `profile` | User |
| `lock`, `security` | Lock |
| `bell`, `notifications` | Bell |
| `message`, `support` | MessageCircle |
| `gift`, `referral` | Gift |
| `star`, `bonuses` | Star |
| `info`, `about` | Info |
| `link` | Link |
| `document`, `legal` | FileText |

### Risk Levels

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `shield` | Shield |
| `scale`, `balanced` | Scale |
| `rocket`, `aggressive` | Rocket |

### Charts / Analytics

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `chart`, `barChart` | BarChart3 |
| `trendUp` | TrendingUp |
| `trendDown` | TrendingDown |
| `activity` | Activity |
| `gauge` | Gauge |

### Finance / Money

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `dollar` | DollarSign |
| `wallet` | Wallet |
| `creditCard` | CreditCard |
| `coins` | Coins |
| `banknote` | Banknote |

### Time

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `clock` | Clock |
| `timer` | Timer |
| `hourglass` | Hourglass |
| `calendar` | Calendar |

### Feedback / Status

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `warning`, `alert` | AlertTriangle |
| `lightbulb`, `tip` | Lightbulb |
| `sparkles` | Sparkles |
| `party`, `celebration` | PartyPopper |
| `zap`, `bolt` | Zap |
| `target` | Target |

### Actions

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `check` | Check |
| `checkCircle` | CheckCircle |
| `plus` | Plus |
| `close` | X |
| `search` | Search |
| `refresh`, `sync` | RefreshCw |
| `back` | ChevronLeft |
| `forward` | ChevronRight |

### Documents / Legal

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `document` | FileText |
| `shieldCheck` | ShieldCheck |
| `shieldAlert` | ShieldAlert |

### Communication

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `mail`, `email` | Mail |
| `message` | MessageCircle |
| `phone` | Phone |
| `globe` | Globe |

### Awards / Social

| Emoji | Icon Name | Lucide Component |
|-------|-----------|-----------------|
| `trophy` | Trophy |
| `award` | Award |
| `crown` | Crown |
| `gem` | Gem |
| `heart`, `favorite` | Heart |

---

## Files Updated

### Tab Bar
- `app/(tabs)/_layout.tsx`

### Account Screens
- `app/(tabs)/account/index.tsx`
- `app/(tabs)/account/bonuses/index.tsx`
- `app/(tabs)/account/referral/index.tsx`
- `app/(tabs)/account/legal/index.tsx`
- `app/(tabs)/account/support/index.tsx`

### System States
- `app/(system)/access-denied.tsx`
- `app/(system)/no-broker.tsx`

### Risk Flow
- `app/(risk)/select.tsx`

### Main Screens
- `app/(tabs)/home/index.tsx`
- `app/(tabs)/ai/index.tsx`
- `app/(tabs)/income/index.tsx`
- `app/(tabs)/withdraw/index.tsx`

---

## ListRow Component Update

The `ListRow` component now accepts either:
1. `IconName` string (renders Icon component)
2. `React.ReactNode` (renders custom component)

```tsx
// Using IconName
<ListRow icon="user" title="Profile" />

// Using custom component
<ListRow icon={<CustomIcon />} title="Custom" />
```

