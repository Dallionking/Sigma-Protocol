# CRM Admin Boilerplate

A customer relationship management and admin dashboard. Built on Next.js with contacts, deals pipeline, and reporting.

## 🎯 Overview

Build CRM tools like HubSpot, Pipedrive, or Salesforce. Perfect for sales teams, agencies, and B2B businesses.

## ✨ Features

### Contacts
- Contact database
- Custom fields
- Import/export
- Activity timeline
- Notes and tasks
- Tags and segments

### Deals Pipeline
- Kanban board view
- Deal stages
- Drag-and-drop
- Deal values
- Win probability
- Expected close date

### Companies
- Company profiles
- Linked contacts
- Deal associations
- Activity history

### Tasks & Activities
- Task management
- Activity logging
- Calendar view
- Reminders
- Email integration

### Reporting
- Sales pipeline report
- Revenue forecasting
- Activity metrics
- Custom dashboards

### Team
- User management
- Role permissions
- Team assignments
- Activity feeds

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (Prisma)
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS + shadcn/ui
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit

## 📊 Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  role        UserRole  @default(MEMBER)
  contacts    Contact[]
  deals       Deal[]
  activities  Activity[]
  tasks       Task[]
}

model Contact {
  id          String    @id @default(cuid())
  email       String
  firstName   String
  lastName    String?
  phone       String?
  title       String?
  company     Company?  @relation(fields: [companyId], references: [id])
  companyId   String?
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     String
  source      String?
  tags        String[]
  customFields Json?
  deals       Deal[]
  activities  Activity[]
  notes       Note[]
  createdAt   DateTime  @default(now())
}

model Company {
  id          String    @id @default(cuid())
  name        String
  domain      String?   @unique
  industry    String?
  size        String?
  address     String?
  contacts    Contact[]
  deals       Deal[]
}

model Deal {
  id          String    @id @default(cuid())
  name        String
  value       Decimal
  stage       DealStage @default(LEAD)
  probability Int       @default(0)
  expectedClose DateTime?
  contact     Contact   @relation(fields: [contactId], references: [id])
  contactId   String
  company     Company?  @relation(fields: [companyId], references: [id])
  companyId   String?
  owner       User      @relation(fields: [ownerId], references: [id])
  ownerId     String
  activities  Activity[]
  notes       Note[]
  closedAt    DateTime?
  createdAt   DateTime  @default(now())
}

model Activity {
  id          String       @id @default(cuid())
  type        ActivityType
  subject     String
  description String?
  user        User         @relation(fields: [userId], references: [id])
  userId      String
  contact     Contact?     @relation(fields: [contactId], references: [id])
  contactId   String?
  deal        Deal?        @relation(fields: [dealId], references: [id])
  dealId      String?
  dueDate     DateTime?
  completed   Boolean      @default(false)
  createdAt   DateTime     @default(now())
}

model Task {
  id          String   @id @default(cuid())
  title       String
  description String?
  assignee    User     @relation(fields: [assigneeId], references: [id])
  assigneeId  String
  dueDate     DateTime?
  priority    Priority @default(MEDIUM)
  status      TaskStatus @default(TODO)
  createdAt   DateTime @default(now())
}

model Note {
  id          String   @id @default(cuid())
  content     String
  contactId   String?
  dealId      String?
  contact     Contact? @relation(fields: [contactId], references: [id])
  deal        Deal?    @relation(fields: [dealId], references: [id])
  createdAt   DateTime @default(now())
}

enum UserRole {
  ADMIN
  MANAGER
  MEMBER
}

enum DealStage {
  LEAD
  QUALIFIED
  PROPOSAL
  NEGOTIATION
  WON
  LOST
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  TASK
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/crm-admin ./my-crm
cd my-crm
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## 📈 Extending

- **Email Integration**: Connect Gmail/Outlook
- **Calendar Sync**: Google Calendar integration
- **Automation**: Workflow automation rules
- **AI**: Lead scoring, email suggestions
- **Integrations**: Zapier, webhooks


