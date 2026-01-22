# Delivery App Boilerplate

> Complete mobile on-demand delivery shell for food delivery, logistics, and gig economy platforms

## Overview

The Delivery boilerplate provides everything you need to build a comprehensive on-demand delivery mobile application. From real-time order tracking to driver dispatch, this shell handles the complex logistics patterns so you can focus on your unique marketplace.

**Extends**: [expo-mobile](../../../expo-mobile)

## Screenshots

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   🏪 Browse     │  │   🛒 Cart       │  │   📍 Tracking   │
│                 │  │                 │  │                 │
│  ┌───────────┐  │  │  Mario's Pizza  │  │   ┌─────────┐   │
│  │ 🍕 Pizza  │  │  │                 │  │   │   Map   │   │
│  │ Hut       │  │  │  Pepperoni  $18 │  │   │  📍→🚗   │   │
│  │ ⭐ 4.8    │  │  │  Garlic Br   $6 │  │   └─────────┘   │
│  └───────────┘  │  │  ───────────    │  │                 │
│  ┌───────────┐  │  │  Subtotal  $24  │  │  🚗 John is     │
│  │ 🍔 Burger │  │  │  Delivery   $3  │  │  5 min away     │
│  │ King      │  │  │  Total     $27  │  │                 │
│  └───────────┘  │  │                 │  │  [ CONTACT ]    │
│                 │  │  [ CHECKOUT ]   │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Quick Start

```bash
# Initialize new delivery app
sigma scaffold my-delivery-app --boilerplate=mobile-delivery

# Install dependencies
cd my-delivery-app
npm install

# Start development
npx expo start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo SDK 52+ / React Native |
| Navigation | Expo Router v3 |
| State | Zustand + React Query |
| Backend | Supabase + Edge Functions |
| Maps | react-native-maps / Mapbox |
| Location | expo-location |
| Payments | Stripe |
| Real-time | Supabase Realtime |

## Project Structure

```
mobile-delivery/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Home/Browse
│   │   ├── search/             # Search & filters
│   │   ├── orders/             # Order history
│   │   └── account/            # Profile & settings
│   ├── (modals)/
│   │   ├── cart.tsx            # Shopping cart
│   │   ├── checkout.tsx        # Checkout flow
│   │   └── filters.tsx         # Filter options
│   ├── store/
│   │   └── [id].tsx            # Store/restaurant page
│   ├── item/
│   │   └── [id].tsx            # Item customization
│   └── order/
│       └── [id].tsx            # Order tracking
├── components/
│   ├── browse/
│   │   ├── StoreCard.tsx
│   │   ├── CategoryList.tsx
│   │   └── FeaturedBanner.tsx
│   ├── store/
│   │   ├── MenuSection.tsx
│   │   ├── MenuItem.tsx
│   │   └── StoreHeader.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── PromoInput.tsx
│   ├── tracking/
│   │   ├── OrderMap.tsx
│   │   ├── DriverInfo.tsx
│   │   └── StatusTimeline.tsx
│   └── ui/
├── hooks/
│   ├── use-cart.ts             # Cart state management
│   ├── use-location.ts         # User location
│   ├── use-tracking.ts         # Order tracking
│   └── use-stores.ts           # Store discovery
├── lib/
│   ├── maps/                   # Map utilities
│   ├── location/               # Geocoding, distance
│   └── payments/               # Stripe integration
└── modules/
    ├── browse/                 # Store discovery
    ├── cart/                   # Shopping cart
    ├── checkout/               # Order placement
    └── tracking/               # Live tracking
```

## Key Features

### 🏪 Store Discovery
- Location-based store listing
- Category filtering
- Search functionality
- Store ratings & reviews
- Estimated delivery time

### 🛒 Shopping Cart
- Multi-store cart handling
- Item customization
- Quantity management
- Promo code application
- Cart persistence

### 💳 Checkout
- Address selection/input
- Delivery instructions
- Payment method selection
- Order summary
- Tip selection

### 📍 Order Tracking
- Real-time driver location
- Order status timeline
- Driver contact (call/message)
- Delivery photo proof
- Rating & feedback

## Database Schema

```sql
-- Core tables included
users
addresses
stores
store_hours
menu_items
item_options
orders
order_items
drivers
driver_locations
ratings
promos
```

## Real-Time Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Customer App                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Browse    │  │    Cart     │  │  Tracking   │     │
│  │  Component  │  │  Component  │  │  Component  │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                 ┌────────┴────────┐                     │
│                 │   Realtime      │                     │
│                 │   Subscriptions │                     │
│                 └────────┬────────┘                     │
└─────────────────────────│──────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
     ┌────────┴────────┐    ┌────────┴────────┐
     │    Supabase     │    │   Driver App    │
     │    Realtime     │    │   (Location)    │
     └─────────────────┘    └─────────────────┘
```

## Configuration

```typescript
// config/delivery.ts
export const deliveryConfig = {
  discovery: {
    defaultRadius: 10, // km
    maxRadius: 50,
    sortDefault: 'distance'
  },
  cart: {
    allowMultiStore: false, // One store per order
    minOrderAmount: 15.00,
    maxItems: 50
  },
  delivery: {
    freeDeliveryThreshold: 35.00,
    defaultDeliveryFee: 3.99,
    tipOptions: [0, 15, 18, 20, 25], // percentages
    defaultTip: 18
  },
  tracking: {
    updateInterval: 5000, // ms
    showDriverPhoto: true,
    allowChat: true,
    allowCall: true
  }
}
```

## Premium Features (RevenueCat)

The boilerplate includes subscription gates for:
- Free delivery on all orders
- Priority dispatch
- Exclusive restaurant access
- No service fees
- Special promotions

## Multi-App Architecture

This boilerplate can extend to a 3-app ecosystem:

```
┌───────────────────────────────────────────────────────┐
│                    Shared Backend                      │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  Customer   │  │   Driver    │  │   Merchant  │   │
│  │    App      │  │    App      │  │    App      │   │
│  │  (This BP)  │  │ (Extension) │  │ (Extension) │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                        │
└───────────────────────────────────────────────────────┘
```

## Location Services

```typescript
// hooks/use-location.ts
export const useLocation = () => {
  // Request permissions
  // Watch current position
  // Calculate distances
  // Geocode addresses
  // Reverse geocode coordinates
}
```

## Customization Guide

### Add New Store Categories
```typescript
// config/categories.ts
export const categories = [
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'grocery', name: 'Grocery', icon: '🛒' },
  { id: 'pharmacy', name: 'Pharmacy', icon: '💊' },
  // Add more...
]
```

### Customize Delivery Zones
```typescript
// lib/delivery/zones.ts
export const deliveryZones = {
  checkDeliveryAvailable: async (storeId, address) => {
    // Your zone logic
  },
  calculateDeliveryFee: async (distance, zone) => {
    // Dynamic pricing
  }
}
```

## See Also

- [FEATURES.md](./FEATURES.md) - Complete feature breakdown
- [expo-mobile](../../../expo-mobile) - Base boilerplate


