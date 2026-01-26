---
name: react-performance
description: "Optimize React application performance with memoization, code splitting, and rendering optimization. Ensures fast, snappy user experiences."
version: "1.0.0"
triggers:
  - implement-prd
  - scaffold
  - ui-healer
  - performance issues
  - slow rendering
  - re-render optimization
---

# React Performance Optimization Skill

This skill guides creation of **fast, snappy React applications** that maintain 60fps interactions and sub-100ms response times. Apply these patterns proactively during implementation, not as afterthoughts.

## When to Invoke

Invoke this skill when:
- Implementing any PRD with React components
- Components re-render unexpectedly or frequently
- Lists render slowly (100+ items)
- Forms feel sluggish
- Dashboard/data-heavy screens lag
- User reports "slow" or "laggy" UI

---

## Core Principle: React Renders Are Expensive

**React re-renders a component when:**
1. Its state changes
2. Its props change (reference, not value)
3. Its parent re-renders
4. Context it consumes changes

**Goal:** Minimize unnecessary re-renders while keeping code readable.

---

## Memoization Strategies

### 1. `React.memo()` — Prevent Child Re-renders

Wrap components that receive **stable props** but re-render due to parent changes:

```tsx
// ❌ BAD: Re-renders every time parent renders
function ExpensiveList({ items }: { items: Item[] }) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
}

// ✅ GOOD: Only re-renders when items actually change
const ExpensiveList = memo(function ExpensiveList({ items }: { items: Item[] }) {
  return items.map(item => <ExpensiveItem key={item.id} item={item} />);
});
```

**When to use `memo()`:**
- Component renders the same output for same props
- Component renders frequently due to parent updates
- Component is expensive to render (complex calculations, large DOM trees)

**When NOT to use `memo()`:**
- Props change on every render anyway
- Component is cheap to render
- You're just guessing it might help (measure first!)

### 2. `useMemo()` — Cache Expensive Calculations

```tsx
// ❌ BAD: Recalculates on every render
function Dashboard({ transactions }: Props) {
  const stats = transactions.reduce((acc, t) => {
    // Expensive calculation
    return { ...acc, total: acc.total + t.amount };
  }, { total: 0 });
  
  return <StatsDisplay stats={stats} />;
}

// ✅ GOOD: Only recalculates when transactions change
function Dashboard({ transactions }: Props) {
  const stats = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return { ...acc, total: acc.total + t.amount };
    }, { total: 0 });
  }, [transactions]);
  
  return <StatsDisplay stats={stats} />;
}
```

**When to use `useMemo()`:**
- Expensive calculations (filtering, sorting, aggregating)
- Creating objects/arrays passed to memoized children
- Derived state that depends on props

### 3. `useCallback()` — Stable Function References

```tsx
// ❌ BAD: New function reference every render, breaks child memo
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <MemoizedChild onClick={handleClick} />;
}

// ✅ GOOD: Stable function reference
function Parent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <MemoizedChild onClick={handleClick} />;
}
```

**When to use `useCallback()`:**
- Passing callbacks to memoized children
- Callbacks used in `useEffect` dependencies
- Event handlers that don't need to change

---

## Component Design Patterns

### 1. Lift State Down (Not Up)

```tsx
// ❌ BAD: Typing in input re-renders entire form
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <ExpensiveAddressLookup address={address} onChange={setAddress} />
    </>
  );
}

// ✅ GOOD: Each input manages own state, isolated re-renders
function Form() {
  return (
    <>
      <NameInput />
      <EmailInput />
      <AddressInput />
    </>
  );
}

function NameInput() {
  const [name, setName] = useState('');
  return <input value={name} onChange={e => setName(e.target.value)} />;
}
```

### 2. Colocate State with Usage

```tsx
// ❌ BAD: Modal state at root causes unnecessary re-renders
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Header />           {/* Re-renders when modal opens */}
      <MainContent />       {/* Re-renders when modal opens */}
      <Footer />           {/* Re-renders when modal opens */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

// ✅ GOOD: Modal state colocated with trigger
function MainContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>Open</button>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
```

### 3. Extract Expensive Children

```tsx
// ❌ BAD: Counter update re-renders ExpensiveChart
function Dashboard() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
      <ExpensiveChart data={staticData} />
    </div>
  );
}

// ✅ GOOD: Separate components, chart never re-renders
function Dashboard() {
  return (
    <div>
      <Counter />
      <ExpensiveChart data={staticData} />
    </div>
  );
}

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
```

---

## List Rendering Optimization

### 1. Virtualization for Long Lists

```tsx
// ❌ BAD: Renders all 10,000 items at once
function BadList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}

// ✅ GOOD: Only renders visible items
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Estimated row height
  });
  
  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }} className="relative">
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.key}
            className="absolute w-full"
            style={{ 
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)` 
            }}
          >
            <ItemCard item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Stable Keys

```tsx
// ❌ BAD: Index keys cause unnecessary re-renders on reorder
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ GOOD: Stable unique keys
{items.map(item => <Item key={item.id} {...item} />)}
```

### 3. Pagination Over Infinite Scroll

For most cases, pagination is simpler and more performant than infinite scroll:

```tsx
// Use TanStack Query with pagination
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['items'],
  queryFn: ({ pageParam = 0 }) => fetchItems({ offset: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextOffset,
});
```

---

## Code Splitting

### 1. Route-Based Splitting

```tsx
import { lazy, Suspense } from 'react';

// ❌ BAD: All routes in main bundle
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

// ✅ GOOD: Each route loads on demand
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Suspense>
  );
}
```

### 2. Component-Based Splitting

```tsx
// Heavy component loaded only when needed
const HeavyEditor = lazy(() => import('./HeavyEditor'));

function Document() {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {isEditing && (
        <Suspense fallback={<EditorSkeleton />}>
          <HeavyEditor />
        </Suspense>
      )}
    </div>
  );
}
```

---

## State Management Optimization

### 1. Zustand Selectors (Prevent Unnecessary Subscribes)

```tsx
// ❌ BAD: Re-renders on ANY store change
const { user, settings, notifications } = useStore();

// ✅ GOOD: Only re-renders when selected slice changes
const user = useStore(state => state.user);
const userName = useStore(state => state.user.name); // Even more specific
```

### 2. Context Splitting

```tsx
// ❌ BAD: One context, everything re-renders
const AppContext = createContext<{
  user: User;
  theme: Theme;
  notifications: Notification[];
}>();

// ✅ GOOD: Separate contexts, isolated re-renders
const UserContext = createContext<User>();
const ThemeContext = createContext<Theme>();
const NotificationContext = createContext<Notification[]>();
```

---

## Form Optimization

### 1. Uncontrolled Inputs with `react-hook-form`

```tsx
import { useForm } from 'react-hook-form';

// ✅ Uncontrolled: No re-renders on each keystroke
function OptimizedForm() {
  const { register, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      <input {...register('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 2. Debounced Search

```tsx
import { useDeferredValue, useState } from 'react';

function Search() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  
  return (
    <>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)} 
        placeholder="Search..."
      />
      <SearchResults query={deferredQuery} />
    </>
  );
}
```

---

## Performance Measurement

### 1. React DevTools Profiler

Always measure before optimizing:
1. Open React DevTools → Profiler tab
2. Click "Start profiling"
3. Interact with your app
4. Click "Stop profiling"
5. Look for components with high render times or frequent re-renders

### 2. Why Did You Render

```bash
npm install @welldone-software/why-did-you-render --save-dev
```

```tsx
// In development only
import whyDidYouRender from '@welldone-software/why-did-you-render';
whyDidYouRender(React, { trackAllPureComponents: true });
```

### 3. Web Vitals

```tsx
import { onCLS, onINP, onLCP } from 'web-vitals';

// Track Core Web Vitals
onCLS(console.log);
onINP(console.log);  // Interaction to Next Paint (replaced FID)
onLCP(console.log);
```

---

## Performance Checklist

Before submitting any React component:

- [ ] No unnecessary re-renders (verified with Profiler)
- [ ] Expensive calculations wrapped in `useMemo()`
- [ ] Callbacks passed to children wrapped in `useCallback()`
- [ ] List items have stable, unique keys
- [ ] Long lists use virtualization (100+ items)
- [ ] Heavy components are lazy-loaded
- [ ] State is colocated with usage (not lifted too high)
- [ ] Forms use uncontrolled inputs or optimized libraries
- [ ] Context is split by concern (not one giant context)

---

## Anti-Patterns to Avoid

### 1. Creating Objects in JSX

```tsx
// ❌ BAD: New object every render
<Component style={{ color: 'red' }} />

// ✅ GOOD: Stable reference
const style = { color: 'red' };
<Component style={style} />

// Or use useMemo if dynamic
const style = useMemo(() => ({ color: theme.color }), [theme.color]);
```

### 2. Inline Functions in JSX (for memoized children)

```tsx
// ❌ BAD: New function every render
<MemoizedButton onClick={() => handleClick(id)} />

// ✅ GOOD: Stable function
const handleButtonClick = useCallback(() => handleClick(id), [id]);
<MemoizedButton onClick={handleButtonClick} />
```

### 3. Premature Optimization

```tsx
// ❌ BAD: Memoizing everything "just in case"
const Component = memo(function Component() {
  const value = useMemo(() => 1 + 1, []); // Pointless
  const onClick = useCallback(() => {}, []); // Pointless if no memoized children
  return <button onClick={onClick}>{value}</button>;
});

// ✅ GOOD: Measure first, optimize where needed
function Component() {
  return <button onClick={() => {}}>2</button>;
}
```

---

## Integration with Sigma Protocol

### PRD Implementation
When implementing PRD features with data-heavy UI:
1. Identify screens with >100 items → plan virtualization
2. Identify forms with many fields → use react-hook-form
3. Identify real-time data → consider optimistic updates

### Step 12 (Context Engine)
Generate performance rules when React patterns detected.

### Step 13 (Skillpack Generator)
Include this skill in performance-sensitive projects.

---

*Remember: The fastest code is code that doesn't run. Minimize re-renders by designing component hierarchies thoughtfully, not by sprinkling `memo()` everywhere after the fact.*



