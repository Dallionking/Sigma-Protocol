# Courses LMS Boilerplate

A complete online course platform for creators, educators, and businesses. Built on Next.js with video hosting, progress tracking, and certificates.

## 🎯 Overview

Build platforms like Udemy, Teachable, or Skillshare. Supports both individual instructors and multi-instructor marketplaces.

## ✨ Features

### For Students
- Course catalog with search and filters
- Video player with progress tracking
- Bookmarks and notes
- Completion certificates
- Quizzes and assessments
- Discussion forums per course

### For Instructors
- Course builder with drag-and-drop
- Video upload and processing
- Curriculum organization (sections, lessons)
- Student analytics
- Revenue dashboard
- Promotional tools (coupons, bundles)

### Platform
- User authentication
- Payment processing (Stripe)
- Email notifications
- Admin dashboard
- Content moderation

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Video**: Mux or Cloudinary
- **Payments**: Stripe
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          Role      @default(STUDENT)
  enrollments   Enrollment[]
  courses       Course[]  @relation("instructor")
  progress      Progress[]
  certificates  Certificate[]
}

model Course {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String?
  thumbnail     String?
  price         Decimal   @default(0)
  published     Boolean   @default(false)
  instructor    User      @relation("instructor", fields: [instructorId], references: [id])
  instructorId  String
  sections      Section[]
  enrollments   Enrollment[]
  category      Category? @relation(fields: [categoryId], references: [id])
  categoryId    String?
}

model Section {
  id        String   @id @default(cuid())
  title     String
  position  Int
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  lessons   Lesson[]
}

model Lesson {
  id          String   @id @default(cuid())
  title       String
  type        LessonType @default(VIDEO)
  videoUrl    String?
  content     String?  // For text lessons
  duration    Int?     // Seconds
  position    Int
  isPreview   Boolean  @default(false)
  section     Section  @relation(fields: [sectionId], references: [id])
  sectionId   String
  progress    Progress[]
}

model Enrollment {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  createdAt DateTime @default(now())
  
  @@unique([userId, courseId])
}

model Progress {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  lesson      Lesson   @relation(fields: [lessonId], references: [id])
  lessonId    String
  completed   Boolean  @default(false)
  watchTime   Int      @default(0)
  completedAt DateTime?
  
  @@unique([userId, lessonId])
}

model Certificate {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  courseId  String
  issuedAt  DateTime @default(now())
  pdfUrl    String?
}

enum Role {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum LessonType {
  VIDEO
  TEXT
  QUIZ
}
```

## 🚀 Quick Start

```bash
# Clone the boilerplate
cp -r templates/boilerplates/products/courses-lms ./my-courses

# Install dependencies
cd my-courses
npm install

# Set up environment
cp .env.example .env.local
# Add your Supabase, Stripe, and Mux credentials

# Run database migrations
npx prisma migrate dev

# Start development
npm run dev
```

## 📁 Project Structure

```
courses-lms/
├── src/
│   ├── app/
│   │   ├── (auth)/           # Auth pages
│   │   ├── (student)/        # Student routes
│   │   │   ├── courses/      # Course catalog
│   │   │   ├── my-learning/  # Enrolled courses
│   │   │   └── course/[slug]/# Course view + player
│   │   ├── (instructor)/     # Instructor routes
│   │   │   ├── dashboard/    # Instructor dashboard
│   │   │   ├── courses/      # Manage courses
│   │   │   └── analytics/    # Student analytics
│   │   └── (admin)/          # Admin routes
│   ├── components/
│   │   ├── course/           # Course components
│   │   │   ├── CourseCard.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── CurriculumBuilder.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── ui/               # Shared UI
│   └── lib/
│       ├── video.ts          # Video processing
│       ├── progress.ts       # Progress tracking
│       └── certificates.ts   # Certificate generation
├── prisma/
│   └── schema.prisma
└── docs/
    └── prds/
        └── course-platform.txt
```

## 🎬 Video Integration

### Option 1: Mux (Recommended)
```typescript
// Upload video to Mux
import Mux from '@mux/mux-node';

const { Video } = new Mux();

async function uploadVideo(fileUrl: string) {
  const asset = await Video.Assets.create({
    input: fileUrl,
    playback_policy: 'signed',
  });
  return asset;
}
```

### Option 2: Cloudinary
```typescript
import { v2 as cloudinary } from 'cloudinary';

async function uploadVideo(file: File) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: 'video',
    folder: 'courses',
  });
  return result;
}
```

## 💳 Stripe Integration

```typescript
// Create checkout for course purchase
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCourseCheckout(course: Course, userId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: course.title,
          description: course.description,
        },
        unit_amount: Math.round(course.price * 100),
      },
      quantity: 1,
    }],
    metadata: {
      courseId: course.id,
      userId,
    },
    success_url: `${process.env.NEXT_PUBLIC_URL}/course/${course.slug}?enrolled=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/course/${course.slug}`,
  });
  
  return session;
}
```

## 📈 Extending

- **Subscriptions**: Add subscription tiers for all-access
- **Live Sessions**: Integrate with Zoom/Meet for live classes
- **Community**: Add forums or Discord integration
- **Mobile**: Use with courses-lms-mobile companion
- **AI**: Add AI-generated quizzes and summaries


