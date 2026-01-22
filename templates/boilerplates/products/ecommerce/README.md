# E-commerce Boilerplate

A complete online store with products, cart, checkout, and inventory management. Built on Next.js with Stripe payments.

## 🎯 Overview

Build stores like Shopify sites, direct-to-consumer brands, or digital product stores. Supports physical and digital goods.

## ✨ Features

### Storefront
- Product catalog
- Category browsing
- Search and filters
- Product variants
- Product reviews
- Wishlist

### Shopping
- Add to cart
- Cart management
- Guest checkout
- User checkout
- Order tracking
- Order history

### Payments
- Stripe integration
- Multiple payment methods
- Tax calculation
- Discount codes
- Shipping rates

### Inventory
- Stock management
- Low stock alerts
- Variant inventory
- SKU tracking

### Admin
- Product management
- Order management
- Customer management
- Discount codes
- Analytics dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Storage**: Supabase Storage
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model Product {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String
  price       Decimal
  comparePrice Decimal?
  images      String[]
  category    Category  @relation(fields: [categoryId], references: [id])
  categoryId  String
  variants    Variant[]
  reviews     Review[]
  inventory   Int       @default(0)
  sku         String?   @unique
  status      ProductStatus @default(DRAFT)
  tags        String[]
  createdAt   DateTime  @default(now())
}

model Variant {
  id          String   @id @default(cuid())
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  name        String   // e.g., "Blue / Large"
  sku         String?  @unique
  price       Decimal?
  inventory   Int      @default(0)
  options     Json     // { color: "Blue", size: "Large" }
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  image       String?
  parent      Category? @relation("subcategories", fields: [parentId], references: [id])
  parentId    String?
  children    Category[] @relation("subcategories")
  products    Product[]
}

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique
  customer        User?       @relation(fields: [customerId], references: [id])
  customerId      String?
  email           String
  items           OrderItem[]
  subtotal        Decimal
  shipping        Decimal
  tax             Decimal
  discount        Decimal     @default(0)
  total           Decimal
  status          OrderStatus @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  stripePaymentId String?
  shippingAddress Json
  billingAddress  Json?
  notes           String?
  createdAt       DateTime    @default(now())
  completedAt     DateTime?
}

model OrderItem {
  id          String   @id @default(cuid())
  order       Order    @relation(fields: [orderId], references: [id])
  orderId     String
  productId   String
  variantId   String?
  name        String
  sku         String?
  price       Decimal
  quantity    Int
  total       Decimal
}

model Cart {
  id          String     @id @default(cuid())
  user        User?      @relation(fields: [userId], references: [id])
  userId      String?    @unique
  sessionId   String?    @unique
  items       CartItem[]
  updatedAt   DateTime   @updatedAt
}

model CartItem {
  id          String   @id @default(cuid())
  cart        Cart     @relation(fields: [cartId], references: [id])
  cartId      String
  productId   String
  variantId   String?
  quantity    Int
}

model Review {
  id          String   @id @default(cuid())
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  rating      Int
  title       String?
  content     String?
  verified    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Discount {
  id          String   @id @default(cuid())
  code        String   @unique
  type        DiscountType
  value       Decimal
  minPurchase Decimal?
  maxUses     Int?
  usedCount   Int      @default(0)
  validFrom   DateTime
  validUntil  DateTime?
  isActive    Boolean  @default(true)
}

model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String?
  orders      Order[]
  cart        Cart?
  reviews     Review[]
  addresses   Address[]
}

model Address {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  name        String
  line1       String
  line2       String?
  city        String
  state       String
  postal      String
  country     String
  isDefault   Boolean  @default(false)
}

enum ProductStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/ecommerce ./my-store
cd my-store
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## 📈 Extending

- **Subscriptions**: Recurring orders
- **Digital Products**: Downloads, licenses
- **Multi-vendor**: Marketplace mode
- **Internationalization**: Multi-currency, translations
- **Analytics**: Enhanced tracking


