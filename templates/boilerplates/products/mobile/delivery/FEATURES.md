# Delivery App - Feature Breakdown

## Core Features

### 🏪 Store Discovery

#### Home Feed
- [ ] Location-based store listing
- [ ] Featured/promoted stores
- [ ] Category horizontal scroll
- [ ] Nearby stores section
- [ ] Popular items section

#### Store Cards
- [ ] Store image/logo
- [ ] Store name & cuisine type
- [ ] Rating with review count
- [ ] Estimated delivery time
- [ ] Delivery fee display
- [ ] Promo badges (if applicable)

#### Filtering & Sorting
- [ ] Filter by category/cuisine
- [ ] Filter by rating
- [ ] Filter by delivery time
- [ ] Filter by price range
- [ ] Filter by dietary (vegan, halal, etc.)
- [ ] Sort by distance/rating/time

#### Search
- [ ] Search stores
- [ ] Search menu items
- [ ] Recent searches
- [ ] Search suggestions

### 🍽️ Store/Restaurant Page

#### Store Header
- [ ] Cover image
- [ ] Store info (name, rating, reviews)
- [ ] Operating hours
- [ ] Delivery estimate
- [ ] Favorite/save store

#### Menu Display
- [ ] Menu sections/categories
- [ ] Section navigation (sticky)
- [ ] Item cards with image/price
- [ ] Sold out indicators
- [ ] Popular item badges

#### Item Detail
- [ ] Item image gallery
- [ ] Description
- [ ] Price
- [ ] Customization options (size, toppings)
- [ ] Special instructions
- [ ] Add to cart with quantity

### 🛒 Shopping Cart

#### Cart View
- [ ] Cart items list
- [ ] Item customization display
- [ ] Quantity adjustment
- [ ] Remove item
- [ ] Item notes

#### Cart Summary
- [ ] Subtotal
- [ ] Delivery fee
- [ ] Service fee
- [ ] Taxes
- [ ] Discounts/promos
- [ ] Total

#### Promo Codes
- [ ] Promo code input
- [ ] Available promos list
- [ ] Auto-apply best promo
- [ ] Promo validation

#### Cart Rules
- [ ] Minimum order warning
- [ ] Clear cart confirmation
- [ ] Store hours check

### 💳 Checkout

#### Delivery Details
- [ ] Address selection
- [ ] Saved addresses list
- [ ] Add new address
- [ ] Address autocomplete
- [ ] Delivery instructions
- [ ] Contact-free delivery option

#### Scheduling
- [ ] ASAP delivery (default)
- [ ] Schedule for later
- [ ] Available time slots
- [ ] Earliest available time

#### Payment
- [ ] Saved payment methods
- [ ] Add new card (Stripe)
- [ ] Apple Pay / Google Pay
- [ ] Cash on delivery (optional)
- [ ] Split payment (optional)

#### Tip
- [ ] Tip percentage options
- [ ] Custom tip amount
- [ ] No tip option
- [ ] Tip description

#### Order Summary
- [ ] Final review
- [ ] Terms acknowledgment
- [ ] Place order button

### 📍 Order Tracking

#### Order Status
- [ ] Order confirmed
- [ ] Restaurant preparing
- [ ] Driver assigned
- [ ] Driver picking up
- [ ] Out for delivery
- [ ] Delivered

#### Map Tracking
- [ ] Real-time map view
- [ ] Driver location marker
- [ ] Route visualization
- [ ] Store/destination markers
- [ ] ETA updates

#### Driver Info
- [ ] Driver name & photo
- [ ] Vehicle info
- [ ] Rating
- [ ] Call driver button
- [ ] Message driver button

#### Delivery Completion
- [ ] Delivery confirmation
- [ ] Photo proof (optional)
- [ ] Rate driver
- [ ] Rate store
- [ ] Feedback/comments
- [ ] Report issue

### 📋 Order History

#### Orders List
- [ ] Past orders list
- [ ] Order status badges
- [ ] Order date/time
- [ ] Order total
- [ ] Quick reorder

#### Order Detail
- [ ] Order items
- [ ] Order timeline
- [ ] Receipt view
- [ ] Help/support access
- [ ] Reorder button

### 👤 Account & Settings

#### Profile
- [ ] Edit name/phone
- [ ] Profile photo
- [ ] Email management

#### Addresses
- [ ] Saved addresses
- [ ] Add/edit/delete addresses
- [ ] Default address

#### Payment Methods
- [ ] Saved cards
- [ ] Add new card
- [ ] Remove card
- [ ] Default payment

#### Preferences
- [ ] Notification settings
- [ ] Language
- [ ] Dietary preferences
- [ ] Favorites list

## Premium Features (Subscription)

### 🚚 Delivery Benefits
- [ ] Free delivery on all orders
- [ ] Priority dispatch
- [ ] No minimum order
- [ ] Exclusive delivery windows

### 💎 Exclusive Access
- [ ] Partner restaurant deals
- [ ] Early access to new restaurants
- [ ] Members-only promos
- [ ] VIP support

### 🎁 Rewards
- [ ] Cashback on orders
- [ ] Points system
- [ ] Tier benefits
- [ ] Birthday rewards

## Technical Features

### 📍 Location Services
- [ ] Location permission handling
- [ ] Background location (tracking)
- [ ] Geocoding/reverse geocoding
- [ ] Distance calculations
- [ ] Address validation

### 🗺️ Maps Integration
- [ ] Map display (Google/Apple/Mapbox)
- [ ] Custom markers
- [ ] Route drawing
- [ ] Map clustering (many stores)
- [ ] Geofencing

### 💾 Data Management
- [ ] Cart persistence
- [ ] Offline order history
- [ ] Image caching
- [ ] Optimistic updates

### 🔔 Notifications
- [ ] Order status push notifications
- [ ] Driver nearby alerts
- [ ] Promo notifications
- [ ] Reorder reminders

### ⚡ Performance
- [ ] Lazy loading menus
- [ ] Image optimization
- [ ] Efficient map rendering
- [ ] List virtualization

## Module Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                      App Shell                          │
├─────────────────────────────────────────────────────────┤
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
│   │ Browse  │  │  Cart   │  │Checkout │  │Tracking │   │
│   │ Module  │  │ Module  │  │ Module  │  │ Module  │   │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘   │
│        │            │            │            │         │
│        └────────────┴──────┬─────┴────────────┘         │
│                            │                            │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│   ┌─────┴─────┐    ┌──────┴──────┐    ┌─────┴─────┐   │
│   │  Zustand  │    │ React Query │    │ Location  │   │
│   │  (Cart)   │    │  (Remote)   │    │ Service   │   │
│   └───────────┘    └─────────────┘    └───────────┘   │
│                            │                            │
│         ┌──────────────────┼──────────────────┐         │
│         │                  │                  │         │
│   ┌─────┴─────┐    ┌──────┴──────┐    ┌─────┴─────┐   │
│   │  Supabase │    │   Stripe    │    │  Maps     │   │
│   │ Realtime  │    │  Payments   │    │ Provider  │   │
│   └───────────┘    └─────────────┘    └───────────┘   │
└─────────────────────────────────────────────────────────┘
```

## API Endpoints Required

```
# Stores
GET    /api/stores                 # List stores (with filters)
GET    /api/stores/:id             # Store detail
GET    /api/stores/:id/menu        # Store menu

# Search
GET    /api/search/stores          # Search stores
GET    /api/search/items           # Search menu items

# Cart
POST   /api/cart/validate          # Validate cart before checkout

# Orders
POST   /api/orders                 # Place order
GET    /api/orders                 # Order history
GET    /api/orders/:id             # Order detail
GET    /api/orders/:id/track       # Tracking info

# Realtime
WS     /ws/orders/:id              # Order status updates
WS     /ws/drivers/:id             # Driver location updates

# User
GET    /api/user/addresses         # Saved addresses
POST   /api/user/addresses         # Add address
PUT    /api/user/addresses/:id     # Update address
DELETE /api/user/addresses/:id     # Delete address

# Payments
POST   /api/payments/intent        # Create payment intent
GET    /api/payments/methods       # Get saved methods
POST   /api/payments/methods       # Save payment method

# Promos
POST   /api/promos/validate        # Validate promo code
GET    /api/promos/available       # Get available promos
```

## Screen Flow

```
App Launch
    │
    ├── Location Permission
    │       │
    │       ├── Granted ──► Home Feed
    │       └── Denied ──► Manual Address Entry
    │
    └── Home Feed
            │
            ├── Browse Stores
            │       │
            │       └── Store Page ──► Item Detail ──► Add to Cart
            │
            ├── Search
            │       │
            │       └── Results ──► Store/Item
            │
            ├── Cart Tab
            │       │
            │       └── Cart ──► Checkout ──► Order Placed
            │
            ├── Orders Tab
            │       │
            │       ├── Active Order ──► Live Tracking
            │       └── Past Order ──► Order Detail
            │
            └── Account Tab
                    │
                    ├── Profile
                    ├── Addresses
                    ├── Payments
                    └── Settings
```

## Order State Machine

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐            │
│   │ PENDING │───►│CONFIRMED│───►│PREPARING│            │
│   └─────────┘    └─────────┘    └─────────┘            │
│        │                              │                 │
│        │                              ▼                 │
│        │              ┌─────────────────────────┐       │
│        │              │      READY_FOR_PICKUP   │       │
│        │              └─────────────────────────┘       │
│        │                              │                 │
│        │                              ▼                 │
│        │              ┌─────────────────────────┐       │
│        │              │     DRIVER_ASSIGNED     │       │
│        │              └─────────────────────────┘       │
│        │                              │                 │
│        │                              ▼                 │
│        │              ┌─────────────────────────┐       │
│        │              │      OUT_FOR_DELIVERY   │       │
│        │              └─────────────────────────┘       │
│        │                              │                 │
│        │                              ▼                 │
│        │              ┌─────────────────────────┐       │
│   ┌────┴────┐        │       DELIVERED         │       │
│   │CANCELLED│◄───────│                         │       │
│   └─────────┘        └─────────────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Real-Time Tracking Data

```typescript
// Driver location update message
interface DriverLocationUpdate {
  orderId: string
  driverId: string
  location: {
    latitude: number
    longitude: number
    heading: number
    speed: number
  }
  eta: number // seconds
  timestamp: string
}

// Order status update message
interface OrderStatusUpdate {
  orderId: string
  status: OrderStatus
  timestamp: string
  message?: string
}
```

## Required Permissions

```
iOS:
- NSLocationWhenInUseUsageDescription
- NSLocationAlwaysUsageDescription (for tracking)
- NSContactsUsageDescription (optional, address book)

Android:
- ACCESS_FINE_LOCATION
- ACCESS_COARSE_LOCATION
- ACCESS_BACKGROUND_LOCATION (for tracking)
- READ_CONTACTS (optional)
```


