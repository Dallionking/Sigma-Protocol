---
name: writing-clearly
description: "Use when generating documentation, commit messages, READMEs, or any text output. Reduces LLM verbosity and enforces professional conciseness."
version: 1.0.0
triggers:
  - commit message
  - documentation
  - README
  - write clearly
  - concise
---

# Writing Clearly and Concisely

Enforce professional, data-dense communication. Eliminate LLM verbosity patterns.

## Core Principles

### 1. Value Per Word Ratio

Every word must earn its place. Calculate data density:

```
Data Density = (Unique Information Units) / (Total Words)
```

Target: 0.7+ density ratio. If a sentence can lose words without losing meaning, cut them.

### 2. Active Voice Always

| Passive (Avoid) | Active (Use) |
|-----------------|--------------|
| "The file was updated by the system" | "The system updated the file" |
| "Errors were found in the code" | "The linter found 3 errors" |
| "It should be noted that..." | [Delete entirely] |

### 3. No Hedge Language

Remove uncertainty markers unless genuinely uncertain:

- "might" -> state definitively or specify conditions
- "could potentially" -> "can" or specify when
- "it seems like" -> investigate and state facts
- "I think" -> state the conclusion

### 4. Zero AI-isms

Never use these patterns:

- "I'd be happy to..."
- "Certainly!"
- "Great question!"
- "Let me help you with..."
- "Here's what I found..."
- "I hope this helps!"
- "Feel free to..."

## Anti-Pattern Detection

| AI Pattern | Replacement |
|------------|-------------|
| "I'd be happy to help you with..." | [Just do the thing] |
| "Certainly! Let me..." | [Just do it] |
| "Great question! Here's..." | [Answer directly] |
| "Here's what I found..." | [State the finding] |
| "Let me explain..." | [Explain directly] |
| "I hope this helps!" | [Delete] |
| "Feel free to ask..." | [Delete] |
| "might", "could potentially" | Use definitive statements |
| "It's worth noting that..." | [State the note directly] |
| "In order to..." | "To..." |
| "Due to the fact that..." | "Because..." |
| "At this point in time" | "Now" |
| "In the event that" | "If" |
| "Prior to" | "Before" |
| "Subsequent to" | "After" |
| "Utilize" | "Use" |
| "Implement" (when meaning "use") | "Use" |
| "Leverage" (business jargon) | "Use" |

## Output Examples

### Commit Messages

**Bad:**
```
Updated the user authentication module to fix a bug that was causing issues
when users tried to log in with their email addresses. The problem was in
the validation logic which wasn't properly handling edge cases.
```

**Good:**
```
fix(auth): validate email format before login attempt

Edge case: emails with '+' suffix failed regex check
```

### Documentation

**Bad:**
```markdown
## Introduction

Welcome to our documentation! In this section, we'll be walking you through
the process of getting started with our API. We hope you find this guide
helpful and informative. If you have any questions, please don't hesitate
to reach out to our support team.

### Getting Started

In order to get started with the API, you'll first need to obtain an API key.
This can be done by navigating to the settings page and clicking on the
"Generate API Key" button.
```

**Good:**
```markdown
## Quick Start

1. Get API key: Settings > Generate API Key
2. Set header: `Authorization: Bearer YOUR_KEY`
3. Base URL: `https://api.example.com/v1`

First request:
```bash
curl -H "Authorization: Bearer $KEY" https://api.example.com/v1/status
```
```

### Code Comments

**Bad:**
```javascript
// This function is responsible for taking a user object as input and
// validating that all of the required fields are present and contain
// valid values before returning a boolean indicating success or failure
function validateUser(user) {
```

**Good:**
```javascript
// Validates user object: requires name (string), email (valid format), age (18+)
function validateUser(user) {
```

### PR Descriptions

**Bad:**
```markdown
## Description

In this PR, I've made some changes to the authentication system. The main
thing I did was update the way we handle JWT tokens. Previously, we were
storing them in localStorage, but this approach had some security concerns.
So I decided to switch to using httpOnly cookies instead. I also added some
error handling for cases where the token is expired or invalid. I think
these changes will make our auth system more secure and reliable.

## Testing

I tested these changes manually by logging in and out multiple times and
checking that everything worked as expected. I also wrote some unit tests
to cover the new functionality.
```

**Good:**
```markdown
## Summary
- Switch JWT storage: localStorage -> httpOnly cookies (XSS mitigation)
- Add token expiry/invalid error handlers

## Changes
- `auth/token.ts`: Cookie-based token storage
- `middleware/auth.ts`: Expiry check with 401 response
- `tests/auth.test.ts`: 12 new cases for token lifecycle

## Test Plan
- [x] Login/logout flow
- [x] Token refresh on expiry
- [x] Invalid token rejection
```

## Token Efficiency Limits

| Output Type | Max Words | Notes |
|-------------|-----------|-------|
| Commit message subject | 10 | Imperative mood |
| Commit message body | 50 | Only if needed |
| PR title | 12 | Action + scope |
| PR description | 150 | Bullet points preferred |
| Code comment (inline) | 15 | Single line |
| Code comment (block) | 50 | Only for complex logic |
| README section | 100 | Per section, not total |
| Error message | 20 | Include fix action |
| Log message | 25 | Include context IDs |

## Self-Check Checklist

Before finalizing any text output:

- [ ] No sentences start with "I" (unless quoting)
- [ ] No filler phrases ("It should be noted", "In order to")
- [ ] No hedge words without justification
- [ ] Active voice throughout
- [ ] Each paragraph has one main point
- [ ] Could any sentence be cut without losing meaning?
- [ ] Word count within limits for output type

## Integration

### With Other Skills

Cross-reference with:
- `@verification-before-completion` - Apply clarity check before final output
- `@copy-editing` - For longer-form content
- `@doc-coauthoring` - For collaborative documentation

### Application Order

1. Generate initial content
2. Apply `writing-clearly` filter
3. Run `verification-before-completion`
4. Output final result

### Automated Enforcement

When generating any text artifact:

```
IF output_type IN [commit, pr, docs, readme, comments]:
    APPLY writing-clearly filters
    CHECK against anti-patterns
    VERIFY word count limits
    REMOVE detected AI-isms
```

## Quick Reference Card

```
DO:
- Start with the action or fact
- Use numbers and specifics
- One idea per sentence
- Cut ruthlessly

DON'T:
- Preamble or wind-up
- Hedge without reason
- Repeat information
- Add filler conclusions
```
