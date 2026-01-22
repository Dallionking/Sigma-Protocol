---
name: architecture-patterns
description: "Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven Design. Use when architecting complex backend systems or refactoring existing applications for better maintainability."
version: "1.0.0"
source: "@wshobson/agents"
triggers:
  - step-2-architecture
  - step-8-technical-spec
  - scaffold
  - new-project
  - refactoring
---

# Architecture Patterns Skill

Implement proven backend architecture patterns including Clean Architecture, Hexagonal Architecture, and Domain-Driven Design. Use when architecting complex backend systems or refactoring existing applications for better maintainability.

## When to Invoke

Invoke this skill when:

- Designing system architecture (Step 2)
- Writing technical specifications (Step 8)
- Scaffolding new projects
- Refactoring for maintainability
- Discussing architectural decisions
- Separating concerns in growing codebases

---

## Core Patterns

### 1. Clean Architecture

**Principle:** Dependencies point inward. Inner layers know nothing about outer layers.

```
┌─────────────────────────────────────────────┐
│                Frameworks & Drivers          │  ← External (DB, Web, UI)
│  ┌─────────────────────────────────────┐    │
│  │         Interface Adapters           │    │  ← Controllers, Gateways, Presenters
│  │  ┌─────────────────────────────┐    │    │
│  │  │       Application            │    │    │  ← Use Cases, Application Services
│  │  │  ┌─────────────────────┐    │    │    │
│  │  │  │      Domain         │    │    │    │  ← Entities, Business Rules
│  │  │  │                     │    │    │    │
│  │  │  └─────────────────────┘    │    │    │
│  │  └─────────────────────────────┘    │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

**Directory Structure:**

```
src/
├── domain/                 # Core business logic (no dependencies)
│   ├── entities/          # Business objects
│   ├── value-objects/     # Immutable value types
│   ├── repositories/      # Repository interfaces (not implementations)
│   └── services/          # Domain services
│
├── application/           # Use cases (depends only on domain)
│   ├── use-cases/        # Application-specific business rules
│   ├── dto/              # Data transfer objects
│   └── ports/            # Input/output port interfaces
│
├── infrastructure/        # External concerns
│   ├── persistence/      # Database implementations
│   ├── external/         # Third-party service adapters
│   └── config/           # Configuration
│
└── presentation/          # Delivery mechanism
    ├── http/             # REST/GraphQL controllers
    ├── cli/              # Command-line interface
    └── websocket/        # Real-time handlers
```

### 2. Hexagonal Architecture (Ports & Adapters)

**Principle:** Application core is isolated via ports (interfaces) and adapters (implementations).

```
            ┌──────────────────────────────────┐
            │                                  │
   Primary  │      ┌──────────────────┐       │  Secondary
   Adapters │      │                  │       │  Adapters
            │      │   Application    │       │
  [REST] ◄──┼─────►│      Core       │◄──────┼──► [Database]
  [CLI]  ◄──┼─────►│                  │◄──────┼──► [Email]
  [gRPC] ◄──┼─────►│   (Use Cases)   │◄──────┼──► [S3]
            │      │                  │       │
            │      └──────────────────┘       │
            │              ▲                  │
            │              │                  │
            │         [Domain]                │
            │                                  │
            └──────────────────────────────────┘

Ports = Interfaces defined by the core
Adapters = Implementations of those interfaces
```

**Key Concepts:**

- **Primary/Driving Ports:** How the outside world calls your application (HTTP, CLI, Events)
- **Secondary/Driven Ports:** How your application calls the outside world (DB, Email, APIs)
- **Adapters:** Concrete implementations that satisfy ports

### 3. Domain-Driven Design (DDD)

**Principle:** Model the domain explicitly. Use ubiquitous language. Protect invariants.

**Building Blocks:**

| Concept            | Purpose                 | Example               |
| ------------------ | ----------------------- | --------------------- |
| **Entity**         | Has identity, mutable   | User, Order, Product  |
| **Value Object**   | No identity, immutable  | Email, Money, Address |
| **Aggregate**      | Consistency boundary    | Order + OrderItems    |
| **Repository**     | Collection abstraction  | UserRepository        |
| **Domain Service** | Cross-entity logic      | PaymentProcessor      |
| **Domain Event**   | Something that happened | OrderPlaced           |
| **Factory**        | Complex object creation | OrderFactory          |

**Aggregate Rules:**

1. Each aggregate has a root entity
2. External objects can only reference the root
3. All changes go through the root
4. Invariants are enforced within the aggregate
5. Aggregates are transactionally consistent

```typescript
// Aggregate Root Example
class Order {
  private items: OrderItem[] = [];
  private status: OrderStatus;

  // All modifications through the root
  addItem(product: Product, quantity: number): void {
    if (this.status !== "draft") {
      throw new OrderNotModifiableError();
    }
    const item = new OrderItem(product, quantity);
    this.items.push(item);
  }

  // Invariant enforcement
  submit(): void {
    if (this.items.length === 0) {
      throw new EmptyOrderError();
    }
    this.status = "submitted";
    this.addDomainEvent(new OrderSubmitted(this.id));
  }
}
```

---

## Pattern Selection Guide

| Scenario             | Recommended Pattern | Why                                       |
| -------------------- | ------------------- | ----------------------------------------- |
| Simple CRUD app      | MVC / Layered       | Overkill to use DDD for simple apps       |
| Complex domain logic | DDD + Clean         | Domain complexity needs explicit modeling |
| Many integrations    | Hexagonal           | Easy to swap adapters                     |
| Microservices        | DDD + Event-Driven  | Bounded contexts map well to services     |
| Rapid prototyping    | Pragmatic layers    | Speed over purity initially               |

---

## Implementation Checklist

### Clean Architecture

- [ ] Domain layer has zero external dependencies
- [ ] Use cases depend only on domain abstractions
- [ ] Infrastructure implements domain interfaces
- [ ] Controllers/Presenters handle I/O transformation
- [ ] Dependency injection wires layers together

### Hexagonal Architecture

- [ ] Ports defined as interfaces in the core
- [ ] Adapters implement ports
- [ ] Core can be tested without infrastructure
- [ ] Primary adapters drive the application
- [ ] Secondary adapters are driven by the application

### DDD

- [ ] Ubiquitous language defined and used consistently
- [ ] Aggregates identified with clear boundaries
- [ ] Value objects used for concepts without identity
- [ ] Domain events capture important happenings
- [ ] Repositories abstract persistence

---

## Common Anti-Patterns

### The Anemic Domain Model

```typescript
// ❌ BAD: Logic outside the entity
class UserService {
  changeEmail(user: User, newEmail: string) {
    if (!isValidEmail(newEmail)) throw new Error();
    if (user.status === "banned") throw new Error();
    user.email = newEmail;
    user.updatedAt = new Date();
  }
}

// ✅ GOOD: Logic inside the entity
class User {
  changeEmail(newEmail: Email): void {
    if (this.status === "banned") {
      throw new BannedUserError();
    }
    this.email = newEmail;
    this.updatedAt = new Date();
  }
}
```

### The God Service

```typescript
// ❌ BAD: One service doing everything
class OrderService {
  createOrder() {}
  processPayment() {}
  sendEmail() {}
  updateInventory() {}
  generateInvoice() {}
}

// ✅ GOOD: Focused services
class CreateOrderUseCase {}
class PaymentService {}
class NotificationService {}
class InventoryService {}
class InvoiceGenerator {}
```

### Leaking Abstractions

```typescript
// ❌ BAD: Domain knows about database
class UserRepository {
  findByIdWithJoins(id: string, joins: string[]): Promise<User>;
}

// ✅ GOOD: Domain-centric interface
class UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
}
```

---

## Integration with SSS Protocol

### Step 2 (Architecture)

Use these patterns to design the system architecture.

### Step 8 (Technical Spec)

Reference these patterns when specifying component interactions.

### @scaffold

Generate folder structures following these patterns.

### @new-project

Apply appropriate pattern based on project complexity.

---

## MCP Integration

When researching architectural patterns:

```javascript
// Research current best practices
mcp_exa_web_search_exa({
  query: "clean architecture typescript 2025 best practices",
});

// Find implementation examples
mcp_exa_web_search_exa({
  query: "hexagonal architecture nestjs example github",
});
```

---

_Remember: Architecture is about managing complexity. Start simple, evolve as needed. Over-architecture is as harmful as under-architecture._
