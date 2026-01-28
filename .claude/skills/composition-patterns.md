---
name: composition-patterns
description: "Build flexible React components with compound patterns, Context composition, render props, and slot patterns. Accordions, Tabs, Menus, and more."
version: "1.0.0"
tags: [react, components, composition, compound, context, patterns, frontend]
triggers:
  - compound component
  - component composition
  - render props
  - slots
  - flexible component
  - accordion
  - tabs
  - menu
---

# React Composition Patterns

This skill teaches **component composition patterns** for building flexible, reusable React components. These patterns from Vercel and the React ecosystem enable components that are both powerful and easy to use.

## Overview

Component composition is about building components that work together through shared context and implicit relationships, rather than through explicit prop drilling.

**Key Patterns:**
1. **Compound Components** - Multiple components that work together
2. **Context Composition** - Shared state without prop drilling
3. **Render Props** - Flexible rendering with callbacks
4. **Slot Patterns** - Named insertion points

---

## When to Use This Skill

Invoke this skill when:

- Building reusable component libraries
- Creating complex UI patterns (tabs, accordions, menus)
- Components need flexible child composition
- Props are being drilled through multiple levels
- Users need to customize component internals
- Building design system components

---

## Pattern 1: Compound Components with Context

### The Pattern

Compound components share implicit state through Context, allowing intuitive APIs:

```tsx
// ❌ Props explosion - not composable
<Accordion
  items={[
    { trigger: 'Section 1', content: 'Content 1' },
    { trigger: 'Section 2', content: 'Content 2' },
  ]}
  allowMultiple={true}
  defaultOpen={[0]}
/>

// ✅ Compound components - composable
<Accordion type="multiple" defaultValue={['item-1']}>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Content 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Complete Accordion Example

```tsx
// === Context ===
interface AccordionContextValue {
  type: 'single' | 'multiple';
  value: string[];
  onValueChange: (value: string[]) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordionContext() {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within <Accordion>');
  }
  return context;
}

// === Item Context ===
interface AccordionItemContextValue {
  value: string;
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error('AccordionItem components must be used within <AccordionItem>');
  }
  return context;
}

// === Root Component ===
interface AccordionProps {
  type?: 'single' | 'multiple';
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

function Accordion({
  type = 'single',
  defaultValue = [],
  value: controlledValue,
  onValueChange,
  children,
  className
}: AccordionProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue ?? internalValue;
  const setValue = onValueChange ?? setInternalValue;

  const handleValueChange = useCallback((newValue: string[]) => {
    if (type === 'single' && newValue.length > 1) {
      setValue([newValue[newValue.length - 1]]);
    } else {
      setValue(newValue);
    }
  }, [type, setValue]);

  return (
    <AccordionContext.Provider value={{ type, value, onValueChange: handleValueChange }}>
      <div className={cn('accordion', className)} data-type={type}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// === Item Component ===
interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function AccordionItem({ value, children, className, disabled = false }: AccordionItemProps) {
  const { value: openValues, onValueChange, type } = useAccordionContext();

  const isOpen = openValues.includes(value);

  const toggle = useCallback(() => {
    if (disabled) return;

    if (isOpen) {
      onValueChange(openValues.filter(v => v !== value));
    } else {
      if (type === 'single') {
        onValueChange([value]);
      } else {
        onValueChange([...openValues, value]);
      }
    }
  }, [disabled, isOpen, onValueChange, openValues, value, type]);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
      <div
        className={cn('accordion-item', className)}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

// === Trigger Component ===
interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { value, isOpen, toggle } = useAccordionItemContext();

  return (
    <button
      type="button"
      className={cn('accordion-trigger', className)}
      onClick={toggle}
      aria-expanded={isOpen}
      aria-controls={`accordion-content-${value}`}
    >
      {children}
      <ChevronIcon
        className={cn('accordion-chevron', isOpen && 'rotate-180')}
        aria-hidden
      />
    </button>
  );
}

// === Content Component ===
interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
}

function AccordionContent({ children, className }: AccordionContentProps) {
  const { value, isOpen } = useAccordionItemContext();

  return (
    <div
      id={`accordion-content-${value}`}
      className={cn('accordion-content', className)}
      data-state={isOpen ? 'open' : 'closed'}
      hidden={!isOpen}
    >
      {isOpen && children}
    </div>
  );
}

// === Export ===
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
};
```

### Usage

```tsx
<Accordion type="single" defaultValue={['faq-1']}>
  <AccordionItem value="faq-1">
    <AccordionTrigger>What is your return policy?</AccordionTrigger>
    <AccordionContent>
      <p>We offer 30-day returns on all items.</p>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="faq-2">
    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
    <AccordionContent>
      <p>Standard shipping takes 5-7 business days.</p>
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## Pattern 2: Tabs Component

### Complete Tabs Example

```tsx
// === Context ===
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within <Tabs>');
  }
  return context;
}

// === Root Component ===
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  className,
  orientation = 'horizontal'
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const value = controlledValue ?? internalValue;
  const setValue = onValueChange ?? setInternalValue;

  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div
        className={cn('tabs', className)}
        data-orientation={orientation}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// === TabsList Component ===
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn('tabs-list', className)}
    >
      {children}
    </div>
  );
}

// === TabsTrigger Component ===
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function TabsTrigger({ value, children, className, disabled = false }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = useTabsContext();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      aria-controls={`tabpanel-${value}`}
      data-state={isSelected ? 'active' : 'inactive'}
      disabled={disabled}
      className={cn('tabs-trigger', className)}
      onClick={() => !disabled && onValueChange(value)}
    >
      {children}
    </button>
  );
}

// === TabsContent Component ===
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  forceMount?: boolean;
}

function TabsContent({ value, children, className, forceMount = false }: TabsContentProps) {
  const { value: selectedValue } = useTabsContext();
  const isSelected = selectedValue === value;

  if (!isSelected && !forceMount) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${value}`}
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn('tabs-content', className)}
      hidden={!isSelected}
    >
      {children}
    </div>
  );
}

// === Export ===
export { Tabs, TabsList, TabsTrigger, TabsContent };
```

### Usage

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    <h2>Overview</h2>
    <p>Your project overview goes here.</p>
  </TabsContent>

  <TabsContent value="analytics">
    <h2>Analytics</h2>
    <AnalyticsDashboard />
  </TabsContent>

  <TabsContent value="settings">
    <h2>Settings</h2>
    <SettingsForm />
  </TabsContent>
</Tabs>
```

---

## Pattern 3: Render Props vs Hooks

### When to Use Render Props

Render props are useful when:
- You need to expose internal state to consumers
- Consumers need control over rendering
- Building headless UI components

```tsx
// Render props pattern
interface ToggleRenderProps {
  isOn: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
}

interface ToggleProps {
  defaultOn?: boolean;
  children: (props: ToggleRenderProps) => React.ReactNode;
}

function Toggle({ defaultOn = false, children }: ToggleProps) {
  const [isOn, setIsOn] = useState(defaultOn);

  const renderProps: ToggleRenderProps = {
    isOn,
    toggle: () => setIsOn(prev => !prev),
    setOn: () => setIsOn(true),
    setOff: () => setIsOn(false),
  };

  return <>{children(renderProps)}</>;
}

// Usage
<Toggle defaultOn={false}>
  {({ isOn, toggle }) => (
    <button onClick={toggle}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  )}
</Toggle>
```

### When to Use Hooks

Hooks are better when:
- Logic needs to be reused across components
- No rendering is involved (just state/behavior)
- You want cleaner syntax

```tsx
// Hook pattern
function useToggle(defaultOn = false) {
  const [isOn, setIsOn] = useState(defaultOn);

  const toggle = useCallback(() => setIsOn(prev => !prev), []);
  const setOn = useCallback(() => setIsOn(true), []);
  const setOff = useCallback(() => setIsOn(false), []);

  return { isOn, toggle, setOn, setOff };
}

// Usage
function ToggleButton() {
  const { isOn, toggle } = useToggle(false);

  return (
    <button onClick={toggle}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

### Comparison Table

| Aspect | Render Props | Hooks |
|--------|-------------|-------|
| Syntax | Function as child | Direct call |
| Reusability | Per-component | Across components |
| Nesting | Can get deep | Flat |
| Type inference | Excellent | Excellent |
| Testing | Render component | Call hook |
| Use case | Headless UI, slots | Shared logic |

---

## Pattern 4: Slot Pattern

### Named Slots for Flexible Components

```tsx
// === Slot System ===
interface SlotProps {
  children?: React.ReactNode;
}

// Find slot by display name
function getSlot(children: React.ReactNode, slotName: string): React.ReactNode {
  const childArray = React.Children.toArray(children);

  for (const child of childArray) {
    if (React.isValidElement(child)) {
      const displayName = (child.type as any).displayName;
      if (displayName === slotName) {
        return child.props.children;
      }
    }
  }

  return null;
}

// Get non-slot children
function getNonSlotChildren(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).filter(child => {
    if (React.isValidElement(child)) {
      const displayName = (child.type as any).displayName;
      return !displayName?.startsWith('Slot.');
    }
    return true;
  });
}

// === Card with Slots ===
function CardHeader({ children }: SlotProps) {
  return <>{children}</>;
}
CardHeader.displayName = 'Slot.Header';

function CardFooter({ children }: SlotProps) {
  return <>{children}</>;
}
CardFooter.displayName = 'Slot.Footer';

function CardAction({ children }: SlotProps) {
  return <>{children}</>;
}
CardAction.displayName = 'Slot.Action';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  const header = getSlot(children, 'Slot.Header');
  const footer = getSlot(children, 'Slot.Footer');
  const action = getSlot(children, 'Slot.Action');
  const content = getNonSlotChildren(children);

  return (
    <div className={cn('card', className)}>
      {header && <div className="card-header">{header}</div>}

      <div className="card-content">{content}</div>

      {(footer || action) && (
        <div className="card-footer">
          {footer && <div className="card-footer-content">{footer}</div>}
          {action && <div className="card-footer-action">{action}</div>}
        </div>
      )}
    </div>
  );
}

Card.Header = CardHeader;
Card.Footer = CardFooter;
Card.Action = CardAction;

export { Card };
```

### Usage

```tsx
<Card className="w-96">
  <Card.Header>
    <h3>Upgrade to Pro</h3>
    <p className="text-muted">Get unlimited access</p>
  </Card.Header>

  <p>Unlock all premium features including:</p>
  <ul>
    <li>Unlimited projects</li>
    <li>Priority support</li>
    <li>Advanced analytics</li>
  </ul>

  <Card.Footer>
    <span className="text-sm text-muted">$9.99/month</span>
  </Card.Footer>

  <Card.Action>
    <Button>Upgrade Now</Button>
  </Card.Action>
</Card>
```

---

## Pattern 5: Menu/Dropdown Component

### Complete Menu Example

```tsx
// === Context ===
interface MenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenuContext() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('Menu components must be used within <Menu>');
  }
  return context;
}

// === Root Component ===
interface MenuProps {
  children: React.ReactNode;
}

function Menu({ children }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <MenuContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="menu-root relative">
        {children}
      </div>
    </MenuContext.Provider>
  );
}

// === Trigger Component ===
interface MenuTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function MenuTrigger({ children, className }: MenuTriggerProps) {
  const { isOpen, setIsOpen, triggerRef } = useMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      className={cn('menu-trigger', className)}
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
      aria-haspopup="menu"
    >
      {children}
    </button>
  );
}

// === Content Component ===
interface MenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

function MenuContent({ children, className, align = 'start' }: MenuContentProps) {
  const { isOpen } = useMenuContext();

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      className={cn(
        'menu-content absolute mt-2 min-w-[200px] rounded-md border bg-white shadow-lg',
        align === 'start' && 'left-0',
        align === 'center' && 'left-1/2 -translate-x-1/2',
        align === 'end' && 'right-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// === Item Component ===
interface MenuItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
}

function MenuItem({ children, onSelect, disabled = false, className }: MenuItemProps) {
  const { setIsOpen } = useMenuContext();

  const handleSelect = () => {
    if (disabled) return;
    onSelect?.();
    setIsOpen(false);
  };

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      className={cn(
        'menu-item w-full px-4 py-2 text-left hover:bg-gray-100',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleSelect}
    >
      {children}
    </button>
  );
}

// === Separator Component ===
function MenuSeparator() {
  return <div role="separator" className="menu-separator h-px bg-gray-200 my-1" />;
}

// === Export ===
export { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator };
```

### Usage

```tsx
<Menu>
  <MenuTrigger className="px-4 py-2 bg-blue-500 text-white rounded">
    Actions
  </MenuTrigger>

  <MenuContent align="start">
    <MenuItem onSelect={() => handleEdit()}>
      Edit
    </MenuItem>
    <MenuItem onSelect={() => handleDuplicate()}>
      Duplicate
    </MenuItem>
    <MenuSeparator />
    <MenuItem onSelect={() => handleDelete()} className="text-red-600">
      Delete
    </MenuItem>
  </MenuContent>
</Menu>
```

---

## Anti-Patterns

### 1. Props Explosion

```tsx
// ❌ Too many props, not composable
<Table
  columns={columns}
  data={data}
  sortable={true}
  filterable={true}
  pagination={true}
  selectable={true}
  onSort={handleSort}
  onFilter={handleFilter}
  onPageChange={handlePage}
  onSelect={handleSelect}
  // ... 20 more props
/>

// ✅ Compound components, composable
<Table data={data}>
  <Table.Header>
    <Table.Column sortable>Name</Table.Column>
    <Table.Column sortable filterable>Status</Table.Column>
  </Table.Header>
  <Table.Body />
  <Table.Pagination />
</Table>
```

### 2. Context Leaking

```tsx
// ❌ Using context outside provider
function BadUsage() {
  const { value } = useTabsContext(); // Error: not within <Tabs>
  return <div>{value}</div>;
}

// ✅ Always wrap in provider
function GoodUsage() {
  return (
    <Tabs defaultValue="tab1">
      <TabsContent value="tab1">
        <SomeComponent /> {/* Can use useTabsContext here */}
      </TabsContent>
    </Tabs>
  );
}
```

### 3. Missing Error Boundaries

```tsx
// ❌ No error message when misused
function useTabsContext() {
  return useContext(TabsContext); // Returns null silently
}

// ✅ Helpful error for developers
function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      'useTabsContext must be used within <Tabs>. ' +
      'Make sure to wrap your component with <Tabs>.'
    );
  }
  return context;
}
```

---

## Checklist: Building Compound Components

- [ ] Root component provides Context
- [ ] Child components consume Context with helpful errors
- [ ] Support both controlled and uncontrolled modes
- [ ] Include proper ARIA attributes for accessibility
- [ ] Allow className customization at each level
- [ ] Handle keyboard navigation
- [ ] Close on outside click (for popups/menus)
- [ ] Close on Escape key (for popups/menus)
- [ ] Export all sub-components
- [ ] Document usage with examples

---

## Integration with Sigma Protocol

### With frontend-design

Use composition patterns when building design system components.

### With react-performance

Memoize Context values to prevent unnecessary re-renders:

```tsx
const contextValue = useMemo(
  () => ({ value, onValueChange }),
  [value, onValueChange]
);
```

### With verification-before-completion

Before shipping compound components, verify:
- All ARIA attributes present
- Keyboard navigation works
- Error boundaries catch misuse

---

*Remember: Good component APIs feel like speaking a language, not configuring a machine. Compound components let consumers compose meaning, not just pass data.*
