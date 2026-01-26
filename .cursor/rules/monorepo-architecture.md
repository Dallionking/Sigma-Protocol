---
name: monorepo-architecture
description: "Design and implement monorepo structures for web + mobile projects using Turborepo, Nx, or pnpm workspaces. Ensures shared code, consistent tooling, and efficient CI/CD."
version: "1.0.0"
triggers:
  - step-1-ideation
  - step-2-architecture
  - new-project
  - scaffold
  - web + mobile project
  - monorepo setup
---

# Monorepo Architecture Skill

This skill guides **monorepo design decisions** for projects with multiple applications (web, mobile, admin) and shared packages. Based on best practices from Turborepo, Nx, and industry standards.

## When to Invoke

Invoke this skill when:
- Step 1 reveals web + mobile companion app
- Multiple applications share logic/types/components
- Team needs consistent tooling across projects
- Code sharing between platforms is required
- CI/CD should be optimized across apps

---

## Decision Framework: Monorepo vs Polyrepo

### Use Monorepo When:
- ✅ Web and mobile share >30% of business logic
- ✅ Same team maintains both applications
- ✅ Need atomic changes across apps (one PR, one deploy)
- ✅ Shared UI component library
- ✅ Unified versioning desired

### Use Polyrepo When:
- ❌ Teams are completely separate
- ❌ Different release cadences
- ❌ Minimal code sharing
- ❌ Different languages (e.g., Swift + Python)
- ❌ Compliance requires separate repos

---

## Recommended Tool: Turborepo

For most Sigma Protocol projects, **Turborepo** is recommended:

| Tool | Best For | Complexity | Vercel Integration |
|------|----------|------------|-------------------|
| **Turborepo** ✅ | Next.js + Expo projects | Low | Native |
| **Nx** | Enterprise, complex plugins | High | Manual |
| **pnpm only** | Simple sharing, no caching | Minimal | N/A |

---

## Standard Monorepo Structure

```
project/
├── apps/
│   ├── web/                    # Next.js web application
│   │   ├── app/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   ├── mobile/                 # Expo React Native app
│   │   ├── app/
│   │   ├── package.json
│   │   └── app.json
│   │
│   └── admin/                  # Optional admin dashboard
│       ├── app/
│       └── package.json
│
├── packages/
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── src/
│   │   │   ├── format.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── api/                    # Shared API client & types
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── config-eslint/          # Shared ESLint config
│   │   ├── base.js
│   │   ├── next.js
│   │   ├── react-native.js
│   │   └── package.json
│   │
│   └── config-typescript/      # Shared TypeScript config
│       ├── base.json
│       ├── nextjs.json
│       ├── react-native.json
│       └── package.json
│
├── tooling/                    # Build tooling (optional)
│   └── tailwind/
│       ├── tailwind.config.ts
│       └── package.json
│
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # Workspace definition
├── package.json                # Root package
└── .github/
    └── workflows/
        └── ci.yml              # Monorepo-aware CI
```

---

## Key Configuration Files

### 1. `pnpm-workspace.yaml`

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

### 2. `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "globalEnv": ["NODE_ENV", "DATABASE_URL"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### 3. Root `package.json`

```json
{
  "name": "project",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "dev:web": "turbo dev --filter=web",
    "dev:mobile": "turbo dev --filter=mobile",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 4. App `package.json` (e.g., `apps/web/package.json`)

```json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@project/ui": "workspace:*",
    "@project/utils": "workspace:*",
    "@project/api": "workspace:*",
    "next": "^15.0.0",
    "react": "^19.0.0"
  }
}
```

### 5. Package `package.json` (e.g., `packages/ui/package.json`)

```json
{
  "name": "@project/ui",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./button": "./src/button.tsx",
    "./card": "./src/card.tsx"
  },
  "dependencies": {
    "react": "^19.0.0"
  },
  "devDependencies": {
    "@project/config-typescript": "workspace:*",
    "typescript": "^5.0.0"
  }
}
```

---

## Shared Packages Design

### 1. UI Package (Cross-Platform)

For web + mobile, create platform-agnostic components:

```tsx
// packages/ui/src/button.tsx
import { forwardRef, type ComponentPropsWithRef } from 'react';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

// Web implementation
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
```

For **React Native** compatibility, use separate exports:

```tsx
// packages/ui/src/button.native.tsx (React Native version)
import { Pressable, Text, type PressableProps } from 'react-native';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: string;
}

export function Button({ variant = 'primary', size = 'md', children, ...props }: ButtonProps) {
  return (
    <Pressable style={[styles.base, styles[variant], styles[size]]} {...props}>
      <Text style={styles.text}>{children}</Text>
    </Pressable>
  );
}
```

### 2. API Package (Shared Types & Client)

```tsx
// packages/api/src/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

// Zod schemas for validation
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(8),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

```tsx
// packages/api/src/client.ts
import { User, CreateUserInput } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL;

export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await fetch(`${BASE_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}
```

### 3. Utils Package

```tsx
// packages/utils/src/format.ts
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

// packages/utils/src/validation.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## TypeScript Configuration

### Base Config (`packages/config-typescript/base.json`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### Next.js Config (`packages/config-typescript/nextjs.json`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "ESNext",
    "jsx": "preserve",
    "plugins": [{ "name": "next" }]
  }
}
```

### React Native Config (`packages/config-typescript/react-native.json`)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ES2022"],
    "module": "ESNext",
    "jsx": "react-jsx",
    "moduleResolution": "bundler"
  }
}
```

---

## CI/CD Configuration

### GitHub Actions (`/.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ vars.TURBO_TEAM }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build
```

### Vercel Configuration (Web)

```json
// apps/web/vercel.json
{
  "installCommand": "pnpm install --filter=web...",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=web"
}
```

---

## Platform-Specific Considerations

### iOS + Android Decision

| Consideration | iOS Only | Android Only | Both (Expo) |
|---------------|----------|--------------|-------------|
| Development speed | Fast | Fast | Slightly slower |
| Native features | Full access | Full access | Most via expo modules |
| App size | Optimal | Optimal | Larger |
| Deployment | App Store | Play Store | Both stores |
| Team expertise | Swift/iOS | Kotlin/Android | React Native |

**Recommendation for Sigma Protocol:** Use **Expo** for cross-platform unless:
- Client specifically requires native iOS (SwiftUI)
- Heavy native integrations needed (AR, NFC, etc.)
- Performance-critical native code required

### Environment Variables

```bash
# .env.local (root - shared)
DATABASE_URL=...

# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.example.com

# apps/mobile/.env
EXPO_PUBLIC_API_URL=https://api.example.com
```

---

## Migration Path: Single Repo → Monorepo

If starting with a single app and need to add another:

1. **Create monorepo structure:**
   ```bash
   mkdir -p apps packages
   mv src apps/web/
   ```

2. **Add Turborepo:**
   ```bash
   pnpm add turbo -D -w
   ```

3. **Extract shared code:**
   - Move types → `packages/api`
   - Move utils → `packages/utils`
   - Move UI components → `packages/ui`

4. **Update imports:**
   ```tsx
   // Before
   import { formatCurrency } from '../utils/format';
   
   // After
   import { formatCurrency } from '@project/utils';
   ```

---

## Anti-Patterns to Avoid

### 1. Deep Import Paths

```tsx
// ❌ BAD: Fragile, breaks on refactor
import { Button } from '@project/ui/src/components/button/Button';

// ✅ GOOD: Stable barrel exports
import { Button } from '@project/ui';
```

### 2. Circular Dependencies

```tsx
// ❌ BAD: ui depends on api depends on ui
// packages/ui imports from packages/api
// packages/api imports from packages/ui

// ✅ GOOD: Clear dependency direction
// packages/ui → no dependencies on other packages
// packages/api → can depend on utils
// apps → can depend on all packages
```

### 3. Root-Level Dependencies

```json
// ❌ BAD: Dependencies at root
{
  "dependencies": {
    "react": "^19.0.0"  // Should be in apps/packages
  }
}

// ✅ GOOD: Only dev tooling at root
{
  "devDependencies": {
    "turbo": "^2.0.0"
  }
}
```

---

## Integration with Sigma Protocol

### Step 1 (Ideation)
Project Scope Discovery determines if monorepo is needed.

### Step 2 (Architecture)
Architecture diagram includes package structure.

### Step 11 (PRD Generation)
PRDs specify which package code belongs in:
- Shared types → `packages/api`
- Shared UI → `packages/ui`
- App-specific → `apps/[app]/`

### Generator Commands
- `new-project` can scaffold monorepo structure
- `scaffold` generates components in correct package

---

*Remember: Monorepos add complexity. Only use when the benefits (code sharing, atomic changes, unified tooling) outweigh the costs (more complex CI, potential coupling).*



