# Marketplace Boilerplate

A two-sided marketplace platform connecting buyers and sellers. Built on Next.js with listings, messaging, reviews, and payment escrow.

## 🎯 Overview

Build platforms like Etsy, Fiverr, or Airbnb. Supports physical products, digital goods, or services.

## ✨ Features

### For Buyers
- Browse and search listings
- Filters (price, category, location, rating)
- Wishlist/favorites
- Secure checkout
- Order tracking
- Messaging with sellers
- Leave reviews

### For Sellers
- Create and manage listings
- Inventory management
- Order management
- Messaging with buyers
- Earnings dashboard
- Payout requests
- Analytics

### Platform
- User verification
- Payment processing (Stripe Connect)
- Dispute resolution
- Admin moderation
- Category management
- Commission configuration

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe Connect
- **Search**: Algolia or Supabase Full-text
- **Storage**: Supabase Storage
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  isSeller      Boolean   @default(false)
  stripeAccountId String?
  listings      Listing[]
  orders        Order[]   @relation("buyer")
  sales         Order[]   @relation("seller")
  reviews       Review[]
  messages      Message[]
}

model Listing {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String
  price       Decimal
  images      String[]
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  seller      User     @relation(fields: [sellerId], references: [id])
  sellerId    String
  status      ListingStatus @default(ACTIVE)
  quantity    Int      @default(1)
  location    String?
  tags        String[]
  orders      Order[]
  reviews     Review[]
  views       Int      @default(0)
  createdAt   DateTime @default(now())
}

model Order {
  id            String      @id @default(cuid())
  buyer         User        @relation("buyer", fields: [buyerId], references: [id])
  buyerId       String
  seller        User        @relation("seller", fields: [sellerId], references: [id])
  sellerId      String
  listing       Listing     @relation(fields: [listingId], references: [id])
  listingId     String
  quantity      Int         @default(1)
  total         Decimal
  platformFee   Decimal
  sellerPayout  Decimal
  status        OrderStatus @default(PENDING)
  stripePaymentId String?
  shippingAddress Json?
  createdAt     DateTime    @default(now())
  completedAt   DateTime?
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5
  comment   String?
  buyer     User     @relation(fields: [buyerId], references: [id])
  buyerId   String
  listing   Listing  @relation(fields: [listingId], references: [id])
  listingId String
  orderId   String   @unique
  createdAt DateTime @default(now())
}

model Message {
  id          String   @id @default(cuid())
  content     String
  sender      User     @relation(fields: [senderId], references: [id])
  senderId    String
  conversationId String
  listingId   String?
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  icon      String?
  listings  Listing[]
}

enum ListingStatus {
  DRAFT
  ACTIVE
  SOLD
  PAUSED
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  DELIVERED
  COMPLETED
  CANCELLED
  DISPUTED
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/marketplace ./my-marketplace
cd my-marketplace
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## 💳 Stripe Connect Integration

```typescript
// Create connected account for seller
async function createSellerAccount(user: User) {
  const account = await stripe.accounts.create({
    type: 'express',
    email: user.email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
  
  return account;
}

// Create payment with platform fee
async function createOrderPayment(order: Order) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: 'usd',
    application_fee_amount: Math.round(order.platformFee * 100),
    transfer_data: {
      destination: order.seller.stripeAccountId,
    },
  });
  
  return paymentIntent;
}
```

## 📈 Extending

- **Auctions**: Add bidding functionality
- **Subscriptions**: Seller premium tiers
- **Shipping**: Integration with carriers
- **Mobile**: Use with marketplace-mobile companion


