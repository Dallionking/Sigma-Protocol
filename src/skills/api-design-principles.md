---
name: api-design-principles
description: "Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs, reviewing API specifications, or establishing API design standards."
version: "1.0.0"
source: "@wshobson/agents"
triggers:
  - step-2-architecture
  - step-8-technical-spec
  - api-docs-gen
  - implement-prd
  - backend-development
---

# API Design Principles Skill

Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs, reviewing API specifications, or establishing API design standards.

## When to Invoke

Invoke this skill when:

- Designing API endpoints (Step 2, Step 8)
- Implementing backend features
- Reviewing API specifications
- Generating API documentation
- Discussing API conventions

---

## REST API Design

### Resource Naming Conventions

```
✅ GOOD (Nouns, plural, hierarchical)
GET    /users
GET    /users/{id}
GET    /users/{id}/orders
POST   /users/{id}/orders
GET    /organizations/{orgId}/teams/{teamId}/members

❌ BAD (Verbs, actions, inconsistent)
GET    /getUser
POST   /createUser
GET    /user/{id}/getOrders
POST   /addOrderToUser
```

### HTTP Methods

| Method | Purpose              | Idempotent | Safe | Request Body |
| ------ | -------------------- | ---------- | ---- | ------------ |
| GET    | Retrieve resource(s) | Yes        | Yes  | No           |
| POST   | Create resource      | No         | No   | Yes          |
| PUT    | Replace resource     | Yes        | No   | Yes          |
| PATCH  | Partial update       | No\*       | No   | Yes          |
| DELETE | Remove resource      | Yes        | No   | Optional     |

\*PATCH can be idempotent if implemented with JSON Patch

### Response Status Codes

```
2xx Success
├── 200 OK                  - Success with response body
├── 201 Created             - Resource created (include Location header)
├── 202 Accepted            - Request accepted, processing async
└── 204 No Content          - Success, no response body

4xx Client Errors
├── 400 Bad Request         - Invalid request syntax/payload
├── 401 Unauthorized        - Missing/invalid authentication
├── 403 Forbidden           - Authenticated but not authorized
├── 404 Not Found           - Resource doesn't exist
├── 409 Conflict            - Resource state conflict
├── 422 Unprocessable Entity - Validation failed
└── 429 Too Many Requests   - Rate limited

5xx Server Errors
├── 500 Internal Server Error - Unexpected server error
├── 502 Bad Gateway          - Upstream service error
├── 503 Service Unavailable  - Server temporarily unavailable
└── 504 Gateway Timeout      - Upstream service timeout
```

### Request/Response Format

```typescript
// Consistent response envelope
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

// Error response
interface ApiError {
  error: {
    code: string; // Machine-readable (e.g., "VALIDATION_ERROR")
    message: string; // Human-readable
    details?: {
      // Field-specific errors
      field: string;
      message: string;
    }[];
    requestId: string; // For support/debugging
  };
}
```

### Pagination

```
# Offset-based (simple, but has issues with large datasets)
GET /users?page=2&perPage=20

# Cursor-based (better for real-time data)
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
  "data": [...],
  "meta": {
    "pagination": {
      "nextCursor": "eyJpZCI6MTQzfQ",
      "hasMore": true
    }
  }
}
```

### Filtering, Sorting, Field Selection

```
# Filtering
GET /users?status=active&role=admin
GET /orders?createdAt[gte]=2024-01-01&total[lt]=100

# Sorting
GET /users?sort=createdAt:desc,name:asc

# Field selection (sparse fieldsets)
GET /users?fields=id,name,email
GET /users/{id}?include=orders,profile
```

### Versioning

```
# URL versioning (most explicit)
GET /v1/users
GET /v2/users

# Header versioning (cleaner URLs)
GET /users
Accept: application/vnd.myapi.v2+json

# Query parameter (useful for testing)
GET /users?version=2
```

---

## GraphQL API Design

### Schema Design

```graphql
# Types - clear naming, nullable by default
type User {
  id: ID!
  email: String!
  name: String
  profile: Profile
  orders(first: Int, after: String): OrderConnection!
  createdAt: DateTime!
}

# Input types - suffix with "Input"
input CreateUserInput {
  email: String!
  name: String
  password: String!
}

input UpdateUserInput {
  name: String
  email: String
}

# Connections for pagination (Relay spec)
type OrderConnection {
  edges: [OrderEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type OrderEdge {
  node: Order!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Query Design

```graphql
type Query {
  # Single resource
  user(id: ID!): User

  # Collection with filtering
  users(
    filter: UserFilter
    first: Int
    after: String
    orderBy: UserOrderBy
  ): UserConnection!

  # Viewer pattern (current user)
  viewer: User
}

input UserFilter {
  status: UserStatus
  role: UserRole
  search: String
}

enum UserOrderBy {
  CREATED_AT_ASC
  CREATED_AT_DESC
  NAME_ASC
  NAME_DESC
}
```

### Mutation Design

```graphql
type Mutation {
  # Verb + Noun naming
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!

  # Action-based for non-CRUD
  sendPasswordReset(email: String!): SendPasswordResetPayload!
  verifyEmail(token: String!): VerifyEmailPayload!
}

# Payload pattern - always return full result
type CreateUserPayload {
  user: User
  errors: [UserError!]
}

type UserError {
  field: String
  message: String!
  code: ErrorCode!
}
```

### Error Handling

```graphql
# Union type for errors
union CreateUserResult = User | ValidationError | AuthorizationError

type ValidationError {
  field: String!
  message: String!
}

type AuthorizationError {
  message: String!
}

# Or with interfaces
interface Error {
  message: String!
}

type ValidationError implements Error {
  message: String!
  field: String!
}
```

---

## API Design Checklist

### Security

- [ ] Authentication on all non-public endpoints
- [ ] Authorization checks (ownership, roles)
- [ ] Input validation and sanitization
- [ ] Rate limiting configured
- [ ] CORS policy defined
- [ ] Sensitive data not in URLs (use body/headers)
- [ ] HTTPS only

### Consistency

- [ ] Consistent naming conventions
- [ ] Consistent response structure
- [ ] Consistent error format
- [ ] Consistent date/time format (ISO 8601)
- [ ] Consistent pagination approach

### Documentation

- [ ] OpenAPI/GraphQL schema documented
- [ ] All endpoints described
- [ ] Request/response examples
- [ ] Error codes documented
- [ ] Authentication explained
- [ ] Rate limits documented

### Performance

- [ ] Pagination on list endpoints
- [ ] Field selection supported
- [ ] N+1 queries prevented (GraphQL)
- [ ] Caching headers configured
- [ ] Compression enabled

---

## Common Anti-Patterns

### REST Anti-Patterns

```
❌ Verbs in URLs
POST /users/create
GET /users/getById/123

❌ Inconsistent pluralization
GET /user/123
GET /orders

❌ Deeply nested resources (> 3 levels)
GET /orgs/1/teams/2/projects/3/tasks/4/comments/5

❌ Using only 200 status code
{ "status": 200, "error": "User not found" }

❌ Exposing internal IDs
GET /users/a8f5f167-f44f-4588-90fa-f12345678901
```

### GraphQL Anti-Patterns

```graphql
# ❌ Huge root queries
type Query {
  getAllUsersWithOrdersAndPaymentsAndProfiles: [User!]!
}

# ❌ No pagination
type User {
  orders: [Order!]! # Could be thousands
}

# ❌ Business logic in resolvers
# (Should be in service layer)

# ❌ No input validation
type Mutation {
  createUser(email: String, name: String): User
  # Should use input type with validation
}
```

---

## Integration with SSS Protocol

### Step 2 (Architecture)

Define API style (REST/GraphQL), conventions, and high-level structure.

### Step 8 (Technical Spec)

Detail endpoint specifications, request/response schemas.

### @api-docs-gen

Generate OpenAPI/GraphQL schema documentation.

### @implement-prd

Apply these principles when building API features.

---

## MCP Integration

```javascript
// Research API patterns
mcp_exa_web_search_exa({
  query: "REST API design best practices 2025",
});

// Find documentation standards
mcp_Ref_ref_search_documentation({
  query: "OpenAPI 3.1 specification",
});
```

---

_Remember: APIs are contracts. Design them as if you'll be the one consuming them at 3 AM debugging a production issue._
