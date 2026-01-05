# SSS Dev Commands

Development workflow commands.

## Overview

Dev commands assist with implementation, planning, and database management.

## Command List

| Command | Description | When to Use |
|---------|-------------|-------------|
| `@implement-prd` | Implement a PRD feature | Main development workflow |
| `@plan` | Create implementation plan | Before starting complex features |
| `@db-migrate` | Database migration assistance | When schema changes needed |

## Usage

### Implementing a Feature

```bash
# Start implementing a PRD
@implement-prd --prd-id=F1

# The command will:
# 1. Load the PRD and related docs
# 2. Create an implementation plan
# 3. Guide through scaffolding
# 4. Track progress
# 5. Verify completion
```

### Creating a Plan

```bash
# Create a plan for complex work
@plan "Add user authentication with OAuth"
```

### Database Migrations

```bash
# Get migration assistance
@db-migrate --action=create --name=add-users-table
```

## Workflow Integration

Dev commands integrate with:
- **Tracking system** (`/.tracking-db/`)
- **PRD verification** (`@verify-prd`)
- **QA system** (`@qa-plan`, `@qa-run`)

## Related

- [TRACKING-SYSTEM.md](../docs/tracking/TRACKING-SYSTEM.md)
- [implement-prd details](./implement-prd)

