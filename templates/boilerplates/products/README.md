# Product-Based Boilerplates

Pre-built product shells ready for customization. Unlike framework boilerplates that provide a generic foundation, these are complete product archetypes with domain-specific features, database schemas, and UI components.

## 🎯 Quick Start

```bash
# Create new project from product boilerplate
sigma @new-project --template products/courses-lms --name my-course-platform

# Or clone directly
cp -r templates/boilerplates/products/courses-lms ./my-project
cd my-project
npm install
npm run dev
```

## 📦 Available Products

### Web (Next.js)

| Product | Base | Description | Key Features |
|---------|------|-------------|--------------|
| [courses-lms](./courses-lms/) | nextjs-saas | Online course platform | Video hosting, progress tracking, certificates |
| [marketplace](./marketplace/) | nextjs-saas | Two-sided marketplace | Listings, messaging, reviews, escrow |
| [crm-admin](./crm-admin/) | nextjs-portable | CRM & admin dashboard | Contacts, deals, pipeline, reporting |
| [social-community](./social-community/) | nextjs-ai | Social network | Profiles, posts, comments, DMs |
| [ai-tools](./ai-tools/) | nextjs-ai | AI tools suite | Multi-tool, credits, API access |
| [ecommerce](./ecommerce/) | nextjs-saas | E-commerce store | Products, cart, checkout, inventory |
| [booking-scheduling](./booking-scheduling/) | nextjs-saas | Appointment booking | Calendar, availability, reminders |

### Mobile (Expo)

| Product | Description | Key Features |
|---------|-------------|--------------|
| [courses-lms-mobile](./courses-lms-mobile/) | Course app companion | Video player, offline, progress sync |
| [marketplace-mobile](./marketplace-mobile/) | Marketplace app | Browse, message, camera upload |
| [social-mobile](./social-mobile/) | Social app | Feed, stories, chat, camera |
| [booking-mobile](./booking-mobile/) | Booking app | Calendar, appointments, push |

### Swift (iOS Native)

| Product | Description | Key Features |
|---------|-------------|--------------|
| [swift-trading](../swift/swift-trading/) | Trading app | Charts, portfolio, watchlist |
| [swift-fitness](../swift/swift-fitness/) | Fitness app | HealthKit, workouts, native UI |
| [swift-social](../swift/swift-social/) | Social app | Feed, camera, SwiftUI |

## 🏗️ Structure

Each product boilerplate contains:

```
product-name/
├── README.md           # Product overview and setup
├── FEATURES.md         # Detailed feature breakdown
├── package.json        # Dependencies with product-specific libs
├── docs/
│   └── prds/          # PRD templates for this product type
├── src/
│   ├── app/           # Next.js app router pages
│   │   ├── (product)/ # Product-specific routes
│   │   └── ...
│   ├── components/
│   │   ├── product/   # Product-specific components
│   │   └── ui/        # Shared UI components
│   └── lib/
│       └── product/   # Product-specific logic
├── prisma/
│   └── schema.prisma  # Product database schema
└── scripts/
    └── setup.js       # Automated setup script
```

## 🔧 Extending Products

Products are designed to be extended:

1. **Add Features**: Use the module system to add capabilities
2. **Customize UI**: Modify components in `src/components/product/`
3. **Extend Schema**: Add fields to `prisma/schema.prisma`
4. **Add Integrations**: Connect third-party services

## 🆚 Products vs Framework Boilerplates

| Aspect | Framework Boilerplate | Product Boilerplate |
|--------|----------------------|---------------------|
| Purpose | Generic foundation | Specific product type |
| Schema | Basic auth/user | Domain-specific models |
| Components | Generic UI | Product-specific UI |
| Routes | Auth flows only | Full product routes |
| Time to MVP | Days to weeks | Hours to days |

## 📋 Choosing a Product

### By Business Model

| Model | Recommended Product |
|-------|---------------------|
| B2C Subscription | courses-lms, ai-tools |
| Marketplace | marketplace |
| B2B SaaS | crm-admin |
| E-commerce | ecommerce |
| Service Business | booking-scheduling |
| Community | social-community |

### By Complexity

- **Simplest**: booking-scheduling, ecommerce
- **Medium**: courses-lms, crm-admin
- **Complex**: marketplace, social-community, ai-tools

---

## 🤝 Contributing

To add a new product boilerplate:

1. Create folder in appropriate section (products/, swift/, etc.)
2. Include README.md with overview
3. Include FEATURES.md with detailed breakdown
4. Add product-specific schema
5. Add product-specific components
6. Add PRD template in docs/prds/
7. Update this README

---

*These products are part of the Sigma Protocol boilerplate system.*


