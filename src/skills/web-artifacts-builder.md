---
name: web-artifacts-builder
description: "Suite of tools for creating elaborate, multi-component web artifacts using modern frontend technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or component libraries."
version: "1.0.0"
source: "@anthropics/skills"
triggers:
  - complex-ui-development
  - multi-component-artifact
  - interactive-prototype
  - dashboard-creation
  - web-application
---

# Web Artifacts Builder Skill

Suite of tools for creating elaborate, multi-component web artifacts using modern frontend technologies (React, Tailwind CSS, shadcn/ui). Use for complex artifacts requiring state management, routing, or shadcn/ui components.

## When to Invoke

Invoke this skill when:

- Building complex, multi-component UIs
- Creating interactive prototypes
- Developing dashboards with multiple views
- Building web applications with state management
- Creating artifacts that need routing or navigation

---

## Technology Stack

### Core Technologies

- **React 18+** - UI framework with hooks
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library built on Radix
- **TypeScript** - Type safety

### State Management

- **React Context** - Simple state sharing
- **Zustand** - Lightweight store (recommended)
- **React Query** - Server state management

### Routing

- **React Router v6** - Client-side routing
- **Next.js App Router** - File-based routing with RSC

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── layout/          # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── features/        # Feature-specific components
│       ├── dashboard/
│       │   ├── stats-card.tsx
│       │   └── activity-feed.tsx
│       └── settings/
│           └── profile-form.tsx
├── hooks/               # Custom hooks
│   ├── use-auth.ts
│   └── use-theme.ts
├── lib/                 # Utilities
│   ├── utils.ts
│   └── api.ts
├── stores/              # State management
│   └── app-store.ts
└── pages/               # Route components
    ├── index.tsx
    ├── dashboard.tsx
    └── settings.tsx
```

### Component Template

```tsx
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p
            className={cn(
              "text-xs",
              change >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {change >= 0 ? "+" : ""}
            {change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Common Patterns

### Dashboard Layout

```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar className="hidden md:flex w-64 flex-col border-r" />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Data Table with Actions

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T;
    header: string;
    render?: (value: T[keyof T], row: T) => React.ReactNode;
  }[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead key={String(col.key)}>{col.header}</TableHead>
          ))}
          <TableHead className="w-[50px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </TableCell>
            ))}
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(row)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(row)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Form with Validation

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function ProfileForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => void;
}) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
}
```

---

## State Management

### Zustand Store

```tsx
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // UI
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";

  // Actions
  setUser: (user: User | null) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      sidebarOpen: true,
      theme: "system",

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
```

### React Query for Server State

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Fetch data
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => api.get("/users"),
  });
}

// Mutate data
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserData) => api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

---

## shadcn/ui Components Reference

### Most Used Components

| Component      | Use Case                   |
| -------------- | -------------------------- |
| `Button`       | Actions, form submission   |
| `Card`         | Content containers         |
| `Dialog`       | Modals, confirmations      |
| `DropdownMenu` | Action menus               |
| `Form`         | Forms with react-hook-form |
| `Input`        | Text inputs                |
| `Select`       | Dropdowns                  |
| `Table`        | Data display               |
| `Tabs`         | Content organization       |
| `Toast`        | Notifications              |

### Installation

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components
npx shadcn-ui@latest add button card dialog form input table
```

---

## Best Practices

### Performance

- Use React.memo for expensive components
- Implement virtualization for long lists
- Lazy load routes and heavy components
- Optimize images with next/image

### Accessibility

- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### Code Organization

- Co-locate related code
- Extract reusable hooks
- Use TypeScript strictly
- Document complex components

---

## Integration with SSS Protocol

### Complex UI Features

Use this skill when PRDs require sophisticated interfaces.

### Interactive Prototypes

Build high-fidelity prototypes for user testing.

### Dashboard Development

Create data-rich dashboards with multiple views.

### Admin Interfaces

Build CRUD interfaces with data tables and forms.

---

_Remember: Complex doesn't mean complicated. Build incrementally, test often, and prioritize user experience._
