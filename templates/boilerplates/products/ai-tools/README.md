# AI Tools Suite Boilerplate

A multi-tool AI platform with usage credits and API access. Built on Next.js with OpenAI integration, credit system, and tool management.

## 🎯 Overview

Build platforms like Jasper, Copy.ai, or Tome. Perfect for AI-powered writing, image generation, or data analysis tools.

## ✨ Features

### AI Tools
- Writing assistant
- Image generator
- Code helper
- Data analyzer
- Chat interface
- Custom prompts

### Credit System
- Usage-based credits
- Purchase credits
- Subscription tiers
- Usage history
- Credit alerts

### Tool Management
- Tool library
- Favorites
- History
- Templates
- Custom prompts

### API Access
- API key management
- Usage limits
- Documentation
- Playground

### Admin
- User management
- Usage analytics
- Tool configuration
- Billing management

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: OpenAI API, Anthropic, Replicate
- **Payments**: Stripe
- **Styling**: TailwindCSS + shadcn/ui

## 📊 Database Schema

```prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  name        String?
  credits     Int       @default(100)
  plan        Plan      @default(FREE)
  apiKeys     ApiKey[]
  usage       Usage[]
  generations Generation[]
  favorites   Favorite[]
  templates   Template[]
  stripeCustomerId String?
}

model Tool {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String
  icon        String?
  category    String
  creditCost  Int       @default(1)
  isActive    Boolean   @default(true)
  model       String    @default("gpt-4")
  systemPrompt String?
  inputSchema Json
  generations Generation[]
}

model Generation {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  tool        Tool     @relation(fields: [toolId], references: [id])
  toolId      String
  input       Json
  output      String
  tokens      Int
  credits     Int
  duration    Int      // ms
  createdAt   DateTime @default(now())
}

model Usage {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  type        UsageType
  credits     Int
  description String?
  createdAt   DateTime @default(now())
}

model ApiKey {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  name        String
  key         String   @unique
  lastUsed    DateTime?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model Template {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  toolId      String
  name        String
  input       Json
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model Favorite {
  id          String   @id @default(cuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String
  toolId      String
  createdAt   DateTime @default(now())
  
  @@unique([userId, toolId])
}

model CreditPack {
  id          String   @id @default(cuid())
  name        String
  credits     Int
  price       Decimal
  stripePriceId String?
  isActive    Boolean  @default(true)
}

enum Plan {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum UsageType {
  GENERATION
  PURCHASE
  SUBSCRIPTION
  BONUS
  REFUND
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/ai-tools ./my-ai-tools
cd my-ai-tools
npm install
cp .env.example .env.local
# Add OpenAI API key
npx prisma migrate dev
npm run dev
```

## 🤖 AI Integration

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generate(tool: Tool, input: Record<string, any>, userId: string) {
  // Check credits
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user.credits < tool.creditCost) {
    throw new Error('Insufficient credits');
  }

  // Generate
  const start = Date.now();
  const response = await openai.chat.completions.create({
    model: tool.model,
    messages: [
      { role: 'system', content: tool.systemPrompt },
      { role: 'user', content: formatInput(tool, input) },
    ],
  });

  const output = response.choices[0].message.content;
  const tokens = response.usage?.total_tokens || 0;

  // Record usage
  await prisma.$transaction([
    prisma.generation.create({
      data: {
        userId,
        toolId: tool.id,
        input,
        output,
        tokens,
        credits: tool.creditCost,
        duration: Date.now() - start,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: tool.creditCost } },
    }),
    prisma.usage.create({
      data: {
        userId,
        type: 'GENERATION',
        credits: -tool.creditCost,
        description: `Used ${tool.name}`,
      },
    }),
  ]);

  return output;
}
```

## 📈 Extending

- **More Models**: Add Claude, Gemini, local models
- **Image Generation**: DALL-E, Stable Diffusion
- **Voice**: Text-to-speech, speech-to-text
- **Workflows**: Chain multiple tools
- **Plugins**: Third-party integrations


