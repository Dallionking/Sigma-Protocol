---
name: agentic-coding
description: "Best practices for AI-assisted coding with Claude Code, Cursor, and similar agents. Covers context engineering, prompt patterns, and human-AI collaboration workflows."
version: "1.0.0"
triggers:
  - AI coding session
  - cursor usage
  - claude code
  - agent workflow
  - context engineering
sources:
  - "Anthropic Claude Code Best Practices (2025)"
  - "Softcery Agentic Coding Guide"
  - "Addy Osmani LLM Coding Workflow"
---

# Agentic Coding Skill

This skill guides **effective human-AI collaboration** for software development. Based on best practices from Anthropic, industry practitioners, and lessons learned from heavy agentic coding workflows.

## Core Philosophy

**Treat AI agents as supervised junior developers, not magic autocomplete.**

- ✅ They can implement well-specified tasks quickly
- ✅ They catch bugs and suggest improvements
- ✅ They handle boilerplate and repetitive work
- ❌ They shouldn't make unsupervised architectural decisions
- ❌ They don't have context you haven't given them
- ❌ They can confidently produce incorrect code

---

## Context Engineering

### The Golden Rule

**Context quality determines output quality.** The AI only knows what you tell it.

### Context Hierarchy (Most to Least Effective)

| Context Type | Effectiveness | Example |
|--------------|---------------|---------|
| **Files in chat** | Highest | `@file.ts` |
| **Rules files** | High | `.cursorrules`, `CLAUDE.md` |
| **Codebase indexing** | Medium | Automatic from IDE |
| **System prompts** | Medium | Project-level instructions |
| **Conversation history** | Lower | Previous messages |
| **Training data** | Lowest | General knowledge |

### Context Engineering Patterns

#### 1. CLAUDE.md / .cursorrules (Project Root)

```markdown
# Project: [Name]

## Tech Stack
- Next.js 15 (App Router)
- Supabase (Auth, Database, Storage)
- TanStack Query (Data fetching)
- Tailwind CSS + shadcn/ui

## Architecture Patterns
- All server actions in `/actions/[feature]/[action].ts`
- All server actions return `Result<T, E>` type
- Zod schemas colocated with server actions
- RLS policies for all tables

## Code Style
- Use `type` over `interface` for object types
- Prefer named exports over default exports
- Use early returns for guard clauses
- Maximum file length: 300 lines

## File Organization
```
app/
  (auth)/           # Auth-required routes
  (public)/         # Public routes
  api/              # API routes (prefer server actions)
actions/
  [feature]/
    [action].ts     # Server action
    [action].schema.ts  # Zod schema
components/
  ui/               # shadcn components
  [feature]/        # Feature-specific components
```

## Do NOT
- Use `any` type
- Skip Zod validation on server actions
- Create components larger than 200 lines
- Use inline styles
```

#### 2. Per-Feature Context Files

For complex features, create feature-specific context:

```markdown
<!-- /features/billing/CONTEXT.md -->
# Billing Feature Context

## Data Model
- `subscriptions` table with Stripe sync
- `invoices` table for billing history
- `usage_events` for metered billing

## External Dependencies
- Stripe webhooks at `/api/webhooks/stripe`
- Stripe Customer Portal for self-service

## Key Files
- `/actions/billing/create-checkout.ts` - Creates Stripe Checkout
- `/lib/stripe.ts` - Stripe client
- `/components/billing/PricingTable.tsx` - Pricing display

## Business Rules
- Trial: 14 days
- Grace period: 7 days after failed payment
- Proration: Enabled for plan changes
```

#### 3. Task-Specific Context

When starting a task, provide relevant context:

```markdown
## Task: Add team member invitation

### Related Files (read these first)
- `/actions/team/create-team.ts` - How we create teams
- `/db/schema/team.ts` - Team schema
- `/components/team/MemberList.tsx` - Where invite button goes

### Requirements
1. Email invite with unique token
2. Token expires in 7 days
3. Rate limit: 10 invites per hour per team

### Expected Output Files
- `/actions/team/invite-member.ts` - Server action
- `/actions/team/accept-invite.ts` - Accept action
- `/db/schema/invite.ts` - Schema addition
- `/components/team/InviteMemberDialog.tsx` - UI
```

---

## Prompting Patterns

### 1. The Specification Pattern

Be explicit about what you want:

```markdown
❌ BAD: "Add a settings page"

✅ GOOD:
"Create a settings page with the following:

**File:** `/app/(dashboard)/settings/page.tsx`

**Sections:**
1. Profile (name, avatar, bio)
2. Security (password change, 2FA toggle)
3. Notifications (email preferences)

**Data:**
- Use server action `getUser()` for initial data
- Use `updateUser()` action for saves

**UI:**
- Use shadcn Card for each section
- Show success toast on save
- Disable save button while submitting

**Behavior:**
- Form validation with react-hook-form
- Optimistic updates for toggle switches
- Confirm dialog for destructive actions"
```

### 2. The Diff Pattern

When modifying existing code, specify the change:

```markdown
"In `/components/Header.tsx`:

**Current:** Logo links to `/`
**Change:** Logo links to `/dashboard` when authenticated, `/` when not

**Current behavior around line 15:**
```tsx
<Link href="/">
  <Logo />
</Link>
```

**Expected:**
```tsx
<Link href={session ? "/dashboard" : "/"}>
  <Logo />
</Link>
```"
```

### 3. The Constraint Pattern

Specify what NOT to do:

```markdown
"Add pagination to the users list.

**Constraints:**
- Do NOT change the existing query structure
- Do NOT add new dependencies
- Do NOT modify the User type
- Keep the same visual design

**Must use:**
- Existing `Pagination` component from shadcn
- URL params for page state (not useState)
- Server-side pagination via Supabase `.range()`"
```

### 4. The Example Pattern

Provide examples of similar code:

```markdown
"Create a server action for `deleteProject`.

**Follow the pattern from `deleteTeam`:**
```tsx
// From /actions/team/delete-team.ts
export async function deleteTeam(
  input: DeleteTeamInput
): Promise<Result<void, DeleteTeamError>> {
  const validated = deleteTeamSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: { code: 'VALIDATION_ERROR' } };
  }
  // ... rest of implementation
}
```

**Apply same pattern but for projects.**"
```

### 5. The Checkpoint Pattern

For complex tasks, use checkpoints:

```markdown
"Implement the checkout flow in stages. After each stage, show me the code and wait for approval.

**Stage 1:** Create Zod schemas for cart validation
**Stage 2:** Create `createCheckoutSession` server action
**Stage 3:** Create `CheckoutPage` component
**Stage 4:** Add Stripe webhook handler
**Stage 5:** Add order confirmation page

Start with Stage 1 only."
```

---

## Workflow Patterns

### 1. Plan → Implement → Review

```markdown
Phase 1: Planning (no code)
"Analyze the requirements and propose:
1. Files to create/modify
2. Data model changes
3. API/action signatures
4. Component hierarchy

Do NOT write implementation code yet."

Phase 2: Implementation (after plan approval)
"Implement the approved plan. Start with [specific file]."

Phase 3: Review
"Review the implementation for:
- Missing error handling
- Accessibility issues
- Performance concerns
- Security vulnerabilities"
```

### 2. Test-First Development

```markdown
"Before implementing, write test cases:

1. Happy path tests
2. Edge case tests
3. Error scenario tests

Then implement to make tests pass."
```

### 3. Incremental Refinement

```markdown
"Start with the simplest working version:
- No error handling
- No loading states
- No edge cases

Then iteratively add:
1. Error handling
2. Loading states
3. Edge cases
4. Optimizations"
```

---

## Human-AI Collaboration

### When to Use AI

| Task | AI Effectiveness | Human Oversight |
|------|------------------|-----------------|
| Boilerplate (CRUD, forms) | ⭐⭐⭐⭐⭐ | Low |
| Refactoring existing code | ⭐⭐⭐⭐⭐ | Medium |
| Bug fixes with stack trace | ⭐⭐⭐⭐ | Medium |
| Writing tests | ⭐⭐⭐⭐ | Medium |
| New feature implementation | ⭐⭐⭐ | High |
| Architecture decisions | ⭐⭐ | Very High |
| Security implementation | ⭐⭐ | Very High |
| Performance optimization | ⭐⭐⭐ | High |

### Staying in Control

#### 1. Review Every Change

```markdown
// In Cursor settings or workflow
"Before applying changes, show me:
1. Summary of changes
2. Files affected
3. Lines changed

Apply only after my explicit approval."
```

#### 2. Use Git Strategically

```bash
# Commit before AI session
git add -A && git commit -m "checkpoint: before AI changes"

# After AI changes, review diff
git diff

# If changes are wrong
git checkout .
```

#### 3. Scope Limits

```markdown
"For this task:
- Only modify files in `/features/billing/`
- Do not touch `/lib/` or `/utils/`
- Maximum 3 files changed
- No dependency additions"
```

---

## Anti-Patterns to Avoid

### 1. The Vague Request

```markdown
❌ "Make the app faster"
❌ "Fix the bugs"
❌ "Improve the code"

✅ "Reduce dashboard load time by memoizing the stats calculation"
✅ "Fix the race condition in useEffect on line 45 of UserProfile.tsx"
✅ "Extract the validation logic into a shared utility"
```

### 2. The Unsupervised Refactor

```markdown
❌ "Refactor the entire codebase to use the new pattern"

✅ "Refactor `/actions/team/` to use the Result pattern. 
    Show me each file before and after."
```

### 3. The Context Dump

```markdown
❌ *Pastes 5000 lines of code*
   "What's wrong with this?"

✅ "In `/components/DataTable.tsx` around lines 45-60,
    the sorting doesn't work when clicking column headers.
    Expected: Toggle between asc/desc
    Actual: Nothing happens
    Here's the relevant code: [50 lines]"
```

### 4. The Security Shortcut

```markdown
❌ "Add auth, don't worry about security for now"

✅ "Add auth with:
    - Secure session handling (httpOnly cookies)
    - CSRF protection
    - Rate limiting on login
    - Password hashing with bcrypt"
```

### 5. The Premature Abstraction

```markdown
❌ "Create a reusable component that handles all our forms"

✅ "Create a specific UserProfileForm component.
    If we need more forms later, we'll extract common patterns."
```

---

## IDE-Specific Tips

### Cursor

```markdown
## Cursor Best Practices

1. **Use @ mentions liberally**
   - @file.ts - Include file in context
   - @folder/ - Include folder
   - @codebase - Search whole codebase

2. **Composer for multi-file changes**
   - Use Composer (Cmd+I) for changes spanning files
   - Review each file before accepting

3. **Chat vs Inline**
   - Chat: Planning, explanations, complex tasks
   - Inline (Cmd+K): Quick edits, single-file changes

4. **Rules files**
   - `.cursorrules` at project root
   - `.cursor/rules/*.mdc` for domain-specific rules
```

### Claude Code (CLI)

```markdown
## Claude Code Best Practices

1. **CLAUDE.md file**
   - Place at project root
   - Include project context, conventions, constraints

2. **Use /compact for long sessions**
   - Summarizes context to save tokens
   - Run when context gets cluttered

3. **Background mode for research**
   - `/research [topic]` - Runs research in background
   - `/status` - Check research progress

4. **Headless mode for CI**
   - `claude-code --headless --prompt "task"`
   - Good for automated code gen
```

---

## Quality Gates

Before accepting AI-generated code:

- [ ] **Compiles/Lints:** No TypeScript or ESLint errors
- [ ] **Tests Pass:** All existing tests still pass
- [ ] **Logic Review:** Does the logic make sense?
- [ ] **Security Check:** No obvious vulnerabilities
- [ ] **Performance Check:** No N+1 queries, unnecessary re-renders
- [ ] **Accessibility Check:** Proper ARIA, keyboard nav
- [ ] **Edge Cases:** Handles empty states, errors, loading
- [ ] **Consistency:** Matches existing codebase patterns

---

## Error Recovery

### When AI Goes Wrong

```markdown
1. **Immediate:** "Stop. That approach won't work because [reason]."

2. **Reset:** "Let's start over. Forget the previous approach."

3. **Constrain:** "Try again, but:
   - Don't use [technology]
   - Must follow [pattern]
   - Can't exceed [limit]"

4. **Example:** "Here's working code that does something similar: [code]
   Apply the same pattern."

5. **Escalate:** If AI keeps failing, implement manually and 
   document why the AI approach didn't work.
```

---

## Session Management

### Starting a Session

```markdown
1. Load project context
   - "Read .cursorrules and CLAUDE.md"
   - "What files are relevant to [feature]?"

2. State current objective
   - "Today we're implementing [feature]"
   - "Current state: [description]"
   - "Goal state: [description]"

3. Set constraints
   - "Don't modify [files]"
   - "Must complete in [time]"
```

### Ending a Session

```markdown
1. Summarize changes made
2. Document any decisions
3. List any follow-up items
4. Commit with descriptive message
5. Update memory/context files if needed
```

---

## Integration with SSS Protocol

### Step 11 (PRD) → Agentic Implementation

PRDs generated by SSS Protocol are designed for agentic implementation:
- Explicit file paths
- Complete code examples
- Declared dependencies
- Implementation order
- Test file locations

### Memory System → Context Loading

Use SSS memory system to:
- Load project patterns at session start
- Store decisions for future reference
- Build accumulated knowledge

### Quality Gates → AI Review

Use AI to verify its own work:
- "Review this code for [checklist]"
- "What edge cases might I have missed?"
- "How would you attack this security-wise?"

---

*Remember: AI amplifies your effectiveness, but you remain responsible for the code. Use AI as a powerful tool, not a replacement for engineering judgment.*



