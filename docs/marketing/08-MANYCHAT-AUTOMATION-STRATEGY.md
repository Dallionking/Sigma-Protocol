# ManyChat Automation Strategy: Simplified Content Funnel & Lead Capture

**Version:** 2.0
**Date:** 2026-02-08
**Series:** SSS Unified Platform (`08-MANYCHAT-AUTOMATION-STRATEGY.md`)
**Replaces:** v1.0 (25-keyword system with Make.com middleware, CRM stages, challenge trackers)

---

## Overview

5 keyword flows in ManyChat that gate links behind name + email + follow verification, synced directly to Resend via ManyChat's External Request action. No middleware, no CRM stages, no challenge trackers.

### Funnel

```
Video (IG / YT / X / TikTok)
  → CTA: "Comment [KEYWORD]" or "Link in bio"
  → ManyChat DM (Instagram / TikTok)
     OR Landing Page (YouTube / X / TikTok bio link)
  → Collect: first name, email
  → Verify: follower status
  → Deliver: link (GitHub, Discord, PDF, waitlist confirmation)
  → Sync: contact added to Resend segment via External Request
```

### What Got Cut (and Why)

| Removed | Reason |
|---------|--------|
| 25 keyword flows | 5 is enough. Add more later when there's volume to justify it |
| Challenge tracker links | Overcomplication — nobody needs a dashboard for a DM funnel |
| Make.com webhooks | ManyChat → Resend directly via External Request. No middleware needed |
| CRM lead scoring / lead stages | Collecting emails, not running Salesforce |
| Firm-specific comparison sheets | Not relevant to Sigma Protocol content |
| DM sequence A/B testing matrix | Premature optimization — ship first, optimize later |
| Weekly metrics dashboard | Resend + ManyChat built-in dashboards are enough |
| Auto-follow DM | Not needed yet — focus on keyword-triggered flows |

---

## Flow Template

Every keyword flow follows this identical pattern. The only difference is the deliverable link and the Resend segment.

```
1. User comments KEYWORD on post
2. ManyChat DM: "Hey! I'll send that over. Quick — what's your first name?"
3. User replies with name → saved to `first_name` custom field
4. ManyChat DM: "And what's the best email to reach you at?"
5. User replies with email → saved to `email` custom field
6. ManyChat checks follower status (built-in system field: "Follows your Instagram account")

7a. IF following:
    → Send message with the deliverable link
    → Fire External Request to Resend API (add contact to segment)

7b. IF NOT following:
    → "Make sure you're following me first! Once you do, reply KEYWORD again and I'll send it right over."
```

### ManyChat Visual Builder Steps (Per Flow)

1. **Create Keyword Trigger** — Set the trigger word (e.g., `SIGMA`)
2. **Ask a Question block** → "What's your first name?" → Save response to `first_name` custom field
3. **Ask a Question block** → "What's the best email to reach you at?" → Save response to `email` custom field
4. **Condition block** → Check system field: "Follows your Instagram account" = `true`
   - **True branch:** Send Message (with link) + External Request action (Resend API)
   - **False branch:** Send Message ("Follow me first, then reply KEYWORD again")
5. **External Request action** — configured per the Resend section below

---

## The 5 Keyword Flows

### 1. SIGMA — Sigma Protocol GitHub Access

| Field | Value |
|-------|-------|
| **Keyword** | `SIGMA` |
| **Deliverable** | Sigma Protocol GitHub repo link |
| **Resend Segment** | `sigma-protocol` |
| **DM Copy** | "Here's the Sigma Protocol — the full 13-step methodology with 185+ commands: [GitHub link]. Star the repo if it's useful!" |

### 2. QUANT — Quant Stream Waitlist

| Field | Value |
|-------|-------|
| **Keyword** | `QUANT` |
| **Deliverable** | Quant Stream waitlist confirmation (GitHub link when open-sourced) |
| **Resend Segment** | `quant-stream` |
| **DM Copy** | "You're on the Quant Stream waitlist! You'll be the first to know when it drops. In the meantime, here's what's coming: [overview link or brief description]." |

### 3. ACADEMY — Architect Academy Waitlist

| Field | Value |
|-------|-------|
| **Keyword** | `ACADEMY` |
| **Deliverable** | Academy waitlist confirmation |
| **Resend Segment** | `architect-academy` |
| **DM Copy** | "You're on the SSS Academy waitlist! You'll be first to know when enrollment opens. The full curriculum covers the 13-step Sigma methodology — from idea to deployed product." |

### 4. DISCORD — Community Access

| Field | Value |
|-------|-------|
| **Keyword** | `DISCORD` |
| **Deliverable** | SigmaView Discord invite link |
| **Resend Segment** | `discord-community` |
| **DM Copy** | "Here's the invite to the community: [Discord link]. Come say what's up!" |

### 5. TIPS — AI Coding Tips PDF

| Field | Value |
|-------|-------|
| **Keyword** | `TIPS` |
| **Deliverable** | PDF lead magnet (AI coding tips / Sigma methodology cheat sheet) |
| **Resend Segment** | `lead-magnet` |
| **DM Copy** | "Here's your copy: [PDF link]. It covers the 13-step Sigma methodology + 5 Claude Code patterns that ship products faster. Let me know what you think!" |

### Optional 6th: CLAUDE — Claude Code Resource

| Field | Value |
|-------|-------|
| **Keyword** | `CLAUDE` |
| **Deliverable** | Claude Code tips PDF or curated resource link |
| **Resend Segment** | `claude-code` |
| **DM Copy** | "Here you go: [resource link]. These are the Claude Code patterns I use daily to ship faster." |

---

## Resend Integration

### External Request Configuration

Every flow uses the same External Request config — only the `segments` value changes per flow.

```
Method: POST
URL: https://api.resend.com/contacts
Headers:
  Authorization: Bearer re_YOUR_API_KEY_HERE
  Content-Type: application/json
Body:
{
  "email": "{{email}}",
  "first_name": "{{first_name}}",
  "audience_id": "YOUR_AUDIENCE_ID",
  "unsubscribed": false
}
```

> **Note on segments:** Resend's Contacts API adds contacts to an audience. Segments are filter-based views within the audience (e.g., filter by tag or custom field). To tag contacts per flow, add a custom field or use a tag in the body. Check Resend's current API docs for the exact field — the API is evolving.

**Alternative approach (simpler):** If Resend segments are tag-based, add a `tags` field:
```json
{
  "email": "{{email}}",
  "first_name": "{{first_name}}",
  "audience_id": "YOUR_AUDIENCE_ID",
  "tags": ["sigma-protocol"]
}
```

### Resend Dashboard Setup (One-Time)

1. **Create an audience** (e.g., "Sigma Leads") — this is the container for all contacts
2. **Create segments** within the audience using filters:
   - `sigma-protocol` — tagged contacts from SIGMA keyword
   - `quant-stream` — tagged contacts from QUANT keyword
   - `architect-academy` — tagged contacts from ACADEMY keyword
   - `discord-community` — tagged contacts from DISCORD keyword
   - `lead-magnet` — tagged contacts from TIPS keyword
   - `claude-code` — tagged contacts from CLAUDE keyword (if using optional 6th flow)
3. **Verify sending domain** — add DNS records for your domain (e.g., sigmasoftwaresolutions.io)
4. **Note the audience ID** — needed for the ManyChat External Request config
5. **Generate an API key** — scoped to Contacts API at minimum

### Welcome Emails (Optional — Do Later)

Once contacts are flowing in, create a simple welcome broadcast per segment:
- Subject: "Welcome — here's what's next"
- Body: 2-3 sentences confirming what they signed up for + 1 next step
- Trigger: Manual broadcast or Resend's automation (when available)

This is not urgent. The ManyChat DM already delivers the link. Email is for nurture, not delivery.

---

## Platform-Specific Notes

### Instagram (Primary)
- ManyChat keyword triggers work on post comments and story replies
- Follower check uses ManyChat's built-in system field
- This is the primary channel — build and test all 5 flows here first

### TikTok
- ManyChat TikTok supports DM automation (keyword triggers in DMs work)
- **Comment-to-DM is NOT live yet** — users can't comment a keyword on a TikTok video and get a DM
- **Current approach:** TikTok bio → landing page (see `LEAD-CAPTURE-LANDING-PAGE.md`)
- When comment-to-DM launches, mirror the Instagram flows

### YouTube
- No DM automation — YouTube doesn't support ManyChat
- **Approach:** Description links + pinned comment → landing page
- "Link in description" is the CTA on YouTube videos

### X (Twitter)
- No DM automation via ManyChat
- **Approach:** Bio link → landing page
- Can also use X's built-in DMs manually for high-intent replies

### Landing Page (For Non-Instagram Platforms)
- Simple email capture form with dropdown for interest area
- See `LEAD-CAPTURE-LANDING-PAGE.md` for the full spec
- Handles YouTube, X, and TikTok traffic that can't use ManyChat DMs

---

## ManyChat Custom Fields

Create these custom fields in ManyChat (Settings → Custom Fields):

| Field Name | Type | Used By |
|------------|------|---------|
| `first_name` | Text | All flows — captured in step 2 |
| `email` | Email | All flows — captured in step 3 |
| `keyword_source` | Text | Optional — set automatically to track which keyword brought them in |

The `first_name` field likely already exists as a system field. The `email` field may need to be created as a custom field if ManyChat doesn't have it built-in for your plan.

---

## Testing Checklist

### Per-Flow Testing

- [ ] Comment keyword on a test post → verify ManyChat DM fires within 5 seconds
- [ ] Reply with a test name → verify it saves to `first_name` custom field
- [ ] Reply with a test email → verify it saves to `email` custom field
- [ ] Verify follower check:
  - [ ] With a following account → should receive the deliverable link
  - [ ] With a non-following account → should receive the "follow first" message
- [ ] Verify Resend External Request fires → check Resend dashboard for new contact
- [ ] Verify contact appears in the correct Resend segment with correct name/email

### End-to-End

- [ ] Instagram: keyword → DM → name → email → follow check → link delivered → Resend contact created
- [ ] Landing page: form submit → Resend contact created → redirect or confirmation shown
- [ ] PDF link: download works, content renders correctly, QR codes scan

---

## Build Sequence

| # | Task | Time Estimate | Priority |
|---|------|---------------|----------|
| 1 | Create Resend audience + segments + API key | 15 min | P0 |
| 2 | Create ManyChat custom fields (`email`, `keyword_source`) | 5 min | P0 |
| 3 | Build SIGMA flow in ManyChat | 30 min | P0 |
| 4 | Test SIGMA flow end-to-end | 15 min | P0 |
| 5 | Clone SIGMA flow → build remaining 4 flows (change keyword, link, segment) | 20 min each | P0 |
| 6 | Test all 5 flows | 30 min | P0 |
| 7 | Build landing page for non-IG platforms | 2-3 hours | P1 |
| 8 | Create PDF lead magnets | 2-3 hours | P1 |
| 9 | Add optional CLAUDE flow | 15 min | P2 |

**Total estimated setup time:** ~1 day (vs. the 4-week phased rollout in v1.0)

---

## Future Expansion (When Needed)

When volume justifies it, consider adding:
- **More keyword flows** — LEARN, METHODOLOGY, BUILD, DONNA, PROTOTYPE (from v1.0)
- **A/B testing** — Test DM copy variants on the highest-volume keyword
- **Auto-follow DM** — Welcome message on new follower
- **Email nurture sequences** — Resend drip campaigns per segment
- **UTM tracking** — Append `?utm_source=manychat&utm_campaign={keyword}` to all links
- **Webhook middleware** — Only if Resend's API can't handle a needed use case directly

Don't build these until the 5-flow system is running and you have data showing what needs optimization.

---

*Last updated: 2026-02-08*
*Replaces: v1.0 (25-keyword, Make.com, CRM system)*
*Cross-reference: `LEAD-CAPTURE-LANDING-PAGE.md`, `PDF-LEAD-MAGNETS.md`*
