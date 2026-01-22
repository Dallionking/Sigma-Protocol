# Sigma Protocol Demo Projects

Ready-to-build demo projects for testing the Sigma Protocol workflow (Steps 0-13). Pick a demo, run through the steps, and build a complete application.

## ⭐ Featured Showcase

### SigmaTrade - Marketing Demo

A **fully documented** fintech/trading app demonstrating the complete Sigma Protocol workflow. Use this as a reference for how the 14-step workflow produces production-ready applications.

| Metric | Value |
|--------|-------|
| Complexity | Full (Steps 0-13) |
| Build Time | ~4 hours with Sigma |
| Documentation | Complete step-by-step |
| Lines of Code | ~8,000 |

**Features:** Portfolio dashboard, trading interface, real-time quotes, watchlists, order history

**[View SigmaTrade Showcase →](./showcase/sigma-trade/)**

---

## 🎯 Quick Start

1. Choose a demo based on your available time and interest
2. Navigate to the demo folder
3. Read the `README.md` for an overview
4. Use the `prd.txt` with Step 11 (`@implement-prd`) to build
5. Reference `user-stories.md` and `tech-notes.md` as needed

## 📊 Demo Complexity Matrix

| Demo | Complexity | Time | Features | Best For |
|------|------------|------|----------|----------|
| [Link-in-Bio](#link-in-bio) | 🟢 Quick | 2-4 hrs | Auth, CRUD, Themes | First-time users |
| [QR Menu](#qr-menu) | 🟢 Quick | 2-4 hrs | Auth, CRUD, QR | Restaurant tech |
| [Waitlist Landing](#waitlist-landing) | 🟢 Quick | 3-4 hrs | Email, Referrals | Startup launches |
| [Habit Tracker](#habit-tracker) | 🟡 Medium | 1 day | Auth, CRUD, Charts | Personal productivity |
| [Invoice Generator](#invoice-generator) | 🟡 Medium | 1-2 days | PDF, Email, CRUD | B2B SaaS |
| [Job Board](#job-board) | 🟡 Medium | 1-2 days | Search, Roles, Forms | Marketplace |
| [Event RSVP](#event-rsvp) | 🟡 Medium | 1-2 days | Tickets, QR, Email | Event management |
| [Fitness Coaching](#fitness-coaching) | 🔴 Full | 1 week+ | Multi-role, Programs | Multi-tenant SaaS |
| [Newsletter Platform](#newsletter-platform) | 🔴 Full | 1 week+ | Subscriptions, Editor | Content platforms |
| [Property Management](#property-management) | 🔴 Full | 1 week+ | Calendar, iCal, Multi-property | Vertical SaaS |

## 📁 Folder Structure

```
demos/
├── showcase/                # Marketing demo (fully built)
│   └── sigma-trade/        # Trading app with all 14 steps documented
├── quick/                   # 2-4 hour builds
│   ├── link-in-bio/        # Linktree clone
│   ├── qr-menu/            # Restaurant digital menu
│   └── waitlist-landing/   # Pre-launch waitlist
├── medium/                  # 1-2 day builds
│   ├── habit-tracker/      # Daily habit tracking
│   ├── invoice-generator/  # Freelancer invoicing
│   ├── job-board/          # Niche job listings
│   └── event-rsvp/         # Event ticketing
└── full/                    # 1 week+ builds
    ├── fitness-coaching/   # Personal trainer platform
    ├── newsletter-platform/# Substack-style publishing
    └── property-management/# Airbnb host dashboard
```

Each demo folder contains:
- `README.md` - Overview, target audience, features
- `prd.txt` - Complete PRD for Step 11
- `user-stories.md` - User stories for development
- `tech-notes.md` - Technical recommendations and code snippets

---

## 🟢 Quick Demos (2-4 hours)

### Link-in-Bio
**Linktree Clone** | Content creators

Create a personalized landing page with links, themes, and click analytics.

**Key Features:**
- User profiles with custom URLs
- Drag-and-drop link management
- Theme customization
- Click analytics

**Tech Stack:** Next.js, Supabase, TailwindCSS

📂 [`quick/link-in-bio/`](./quick/link-in-bio/)

---

### QR Menu
**Digital Restaurant Menu** | Restaurants & Cafes

Contactless menu system with QR codes for restaurants.

**Key Features:**
- Menu categories and items
- Photo uploads
- Dietary tags (V, VG, GF)
- QR code generation

**Tech Stack:** Next.js, Supabase, TailwindCSS

📂 [`quick/qr-menu/`](./quick/qr-menu/)

---

### Waitlist Landing
**Viral Pre-launch Page** | Startups

Build anticipation with referral-powered waitlist signups.

**Key Features:**
- Email capture
- Referral tracking
- Reward tiers
- Admin analytics

**Tech Stack:** Next.js, Supabase, Resend

📂 [`quick/waitlist-landing/`](./quick/waitlist-landing/)

---

## 🟡 Medium Demos (1-2 days)

### Habit Tracker
**Daily Routine Builder** | Personal Productivity

Track habits, maintain streaks, and visualize progress.

**Key Features:**
- Habit management
- Streak calculation
- Calendar heatmap
- Progress charts

**Tech Stack:** Next.js, Supabase, Recharts

📂 [`medium/habit-tracker/`](./medium/habit-tracker/)

---

### Invoice Generator
**Freelancer Billing Tool** | Freelancers & Agencies

Create professional invoices with PDF generation.

**Key Features:**
- Client management
- Line item invoices
- PDF generation
- Payment tracking

**Tech Stack:** Next.js, Supabase, @react-pdf/renderer, Resend

📂 [`medium/invoice-generator/`](./medium/invoice-generator/)

---

### Job Board
**Niche Job Listings** | Recruiters & Job Seekers

Specialized job board with employer and applicant features.

**Key Features:**
- Job posting
- Search and filters
- Application flow
- Employer dashboard

**Tech Stack:** Next.js, Supabase, Full-text search

📂 [`medium/job-board/`](./medium/job-board/)

---

### Event RSVP
**Event Ticketing Platform** | Event Organizers

Manage events, sell tickets, and check in attendees.

**Key Features:**
- Event creation
- Ticket types
- QR code tickets
- Check-in system

**Tech Stack:** Next.js, Supabase, Stripe, html5-qrcode

📂 [`medium/event-rsvp/`](./medium/event-rsvp/)

---

## 🔴 Full Demos (1 week+)

### Fitness Coaching
**Personal Trainer Platform** | Fitness Professionals

Manage clients, create workout programs, track progress.

**Key Features:**
- Exercise library
- Workout builder
- Program assignment
- Progress tracking
- Client portal

**Tech Stack:** Next.js, Supabase, React Query

📂 [`full/fitness-coaching/`](./full/fitness-coaching/)

---

### Newsletter Platform
**Substack-Style Publishing** | Writers & Creators

Publish newsletters with paid subscriptions.

**Key Features:**
- Rich text editor
- Email delivery
- Paid subscriptions
- Subscriber analytics

**Tech Stack:** Next.js, Supabase, Stripe Connect, Tiptap, Resend

📂 [`full/newsletter-platform/`](./full/newsletter-platform/)

---

### Property Management
**Short-Term Rental Dashboard** | Airbnb Hosts

Manage multiple properties, bookings, and finances.

**Key Features:**
- Multi-property calendar
- Booking management
- iCal sync
- Financial tracking
- Guest messaging

**Tech Stack:** Next.js, Supabase, FullCalendar, node-ical

📂 [`full/property-management/`](./full/property-management/)

---

## 🚀 How to Use These Demos

### Option 1: Full Sigma Workflow

Run through the complete Steps 0-13:

```bash
# Start from the project root
cd your-project

# Initialize and use the PRD
sigma @implement-prd templates/demos/quick/link-in-bio/prd.txt
```

### Option 2: Direct PRD Implementation

Skip to Step 11 with an existing boilerplate:

```bash
# Create new project from boilerplate
sigma @new-project --template nextjs-saas --name my-link-in-bio

# Then implement the demo PRD
sigma @implement-prd ../templates/demos/quick/link-in-bio/prd.txt
```

### Option 3: Manual Reference

Use the PRD and docs as reference while building manually:

1. Read the PRD thoroughly
2. Follow the database schema
3. Implement user stories in priority order
4. Reference tech notes for code patterns

---

## 📋 Choosing the Right Demo

### By Learning Goal

| Goal | Recommended Demo |
|------|------------------|
| Learn auth basics | Link-in-Bio |
| Practice CRUD operations | QR Menu |
| Email integration | Waitlist Landing |
| Complex state management | Habit Tracker |
| PDF generation | Invoice Generator |
| Search implementation | Job Board |
| Payment processing | Event RSVP |
| Multi-tenant architecture | Fitness Coaching |
| Content editor | Newsletter Platform |
| Calendar systems | Property Management |

### By Industry Interest

| Industry | Demo |
|----------|------|
| Content/Social | Link-in-Bio, Newsletter Platform |
| Food Service | QR Menu |
| Startup/Tech | Waitlist Landing, Job Board |
| Personal Productivity | Habit Tracker |
| Professional Services | Invoice Generator |
| Events | Event RSVP |
| Health/Fitness | Fitness Coaching |
| Real Estate | Property Management |

### By Technical Complexity

- **Beginner**: Link-in-Bio, QR Menu
- **Intermediate**: Habit Tracker, Invoice Generator
- **Advanced**: Newsletter Platform, Property Management

---

## 🤝 Contributing

Want to add a demo idea? Follow this structure:

1. Create folder: `demos/[complexity]/[demo-name]/`
2. Add files:
   - `README.md` - Overview and features
   - `prd.txt` - Complete PRD (see existing for format)
   - `user-stories.md` - User stories by epic
   - `tech-notes.md` - Technical recommendations
3. Update this README with the new demo
4. Submit a PR

---

## 📝 License

These demo PRDs are provided as part of the Sigma Protocol for educational and development purposes.

