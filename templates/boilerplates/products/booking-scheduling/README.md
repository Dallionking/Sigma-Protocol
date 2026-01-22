# Booking & Scheduling Boilerplate

An appointment booking platform with calendar, availability management, and automated reminders. Built on Next.js with Stripe payments.

## 🎯 Overview

Build platforms like Calendly, Acuity, or Square Appointments. Perfect for service businesses, consultants, or healthcare.

## ✨ Features

### For Clients
- Service catalog
- Provider selection
- Availability view
- Book appointments
- Reschedule/cancel
- Appointment reminders
- Online payments

### For Providers
- Availability management
- Calendar view
- Appointment management
- Client management
- Service configuration
- Buffer times
- Break times

### Platform
- Multi-provider support
- Payment processing
- Email notifications
- SMS reminders (optional)
- Timezone handling
- Google Calendar sync

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Calendar**: FullCalendar
- **Payments**: Stripe
- **Email**: Resend
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  role        Role      @default(CLIENT)
  provider    Provider?
  bookings    Booking[] @relation("client")
}

model Provider {
  id            String    @id @default(cuid())
  user          User      @relation(fields: [userId], references: [id])
  userId        String    @unique
  businessName  String
  slug          String    @unique
  description   String?
  avatar        String?
  timezone      String    @default("UTC")
  services      Service[]
  availability  Availability[]
  bookings      Booking[] @relation("provider")
  breaks        Break[]
  bufferBefore  Int       @default(0)  // minutes
  bufferAfter   Int       @default(0)
  googleCalendarId String?
}

model Service {
  id          String    @id @default(cuid())
  provider    Provider  @relation(fields: [providerId], references: [id])
  providerId  String
  name        String
  description String?
  duration    Int       // minutes
  price       Decimal
  color       String?
  isActive    Boolean   @default(true)
  bookings    Booking[]
}

model Availability {
  id          String   @id @default(cuid())
  provider    Provider @relation(fields: [providerId], references: [id])
  providerId  String
  dayOfWeek   Int      // 0-6
  startTime   String   // "09:00"
  endTime     String   // "17:00"
  isActive    Boolean  @default(true)
}

model Break {
  id          String   @id @default(cuid())
  provider    Provider @relation(fields: [providerId], references: [id])
  providerId  String
  name        String   // "Lunch"
  dayOfWeek   Int?     // NULL = all days
  startTime   String
  endTime     String
}

model Booking {
  id            String        @id @default(cuid())
  provider      Provider      @relation("provider", fields: [providerId], references: [id])
  providerId    String
  client        User          @relation("client", fields: [clientId], references: [id])
  clientId      String
  service       Service       @relation(fields: [serviceId], references: [id])
  serviceId     String
  startTime     DateTime
  endTime       DateTime
  status        BookingStatus @default(PENDING)
  price         Decimal
  notes         String?
  stripePaymentId String?
  reminderSent  Boolean       @default(false)
  googleEventId String?
  createdAt     DateTime      @default(now())
  cancelledAt   DateTime?
  cancelReason  String?
}

model BlockedTime {
  id          String   @id @default(cuid())
  providerId  String
  startTime   DateTime
  endTime     DateTime
  reason      String?
}

enum Role {
  CLIENT
  PROVIDER
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/booking-scheduling ./my-booking
cd my-booking
npm install
cp .env.example .env.local
npx prisma migrate dev
npm run dev
```

## 📅 Availability Logic

```typescript
import { addMinutes, isWithinInterval, parseISO } from 'date-fns';

async function getAvailableSlots(
  providerId: string,
  serviceId: string,
  date: Date
): Promise<TimeSlot[]> {
  const [provider, service, bookings, availability] = await Promise.all([
    getProvider(providerId),
    getService(serviceId),
    getBookingsForDate(providerId, date),
    getAvailabilityForDay(providerId, date.getDay()),
  ]);

  if (!availability) return [];

  const slots: TimeSlot[] = [];
  const slotDuration = service.duration;
  const bufferTotal = provider.bufferBefore + provider.bufferAfter;

  let currentTime = parseTimeToDate(availability.startTime, date);
  const endTime = parseTimeToDate(availability.endTime, date);

  while (addMinutes(currentTime, slotDuration) <= endTime) {
    const slotEnd = addMinutes(currentTime, slotDuration + bufferTotal);
    
    const isAvailable = !bookings.some(booking =>
      isOverlapping(
        { start: currentTime, end: slotEnd },
        { start: booking.startTime, end: booking.endTime }
      )
    );

    if (isAvailable) {
      slots.push({
        startTime: currentTime,
        endTime: addMinutes(currentTime, slotDuration),
      });
    }

    currentTime = addMinutes(currentTime, 30); // 30-min increments
  }

  return slots;
}
```

## 📈 Extending

- **Google Calendar**: Two-way sync
- **Zoom/Meet**: Auto-create meeting links
- **SMS**: Twilio reminders
- **Recurring**: Recurring appointments
- **Packages**: Multi-session packages
- **Teams**: Multiple staff per location


