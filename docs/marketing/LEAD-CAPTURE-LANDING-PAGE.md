# Lead Capture Landing Page Spec

**Version:** 1.0
**Date:** 2026-02-08
**Series:** SSS Unified Platform
**Purpose:** Email capture for non-Instagram platforms (YouTube, X, TikTok bio links)
**Related:** `08-MANYCHAT-AUTOMATION-STRATEGY.md`

---

## Why This Page Exists

Instagram uses ManyChat DMs for lead capture. YouTube, X, and TikTok can't — there's no comment-to-DM automation on those platforms. This landing page captures the same info (name + email + interest) and syncs to Resend, so every platform feeds the same email list.

**Where it's linked:**
- YouTube video descriptions + pinned comments
- X bio link
- TikTok bio link
- Instagram bio link (as backup / multi-link option)

---

## Page Structure

Single page. No navigation. No footer links. One job: collect name + email + interest.

### Layout

```
┌─────────────────────────────────────────────┐
│                                             │
│            [Sigma Protocol Logo]            │
│                                             │
│     Get Early Access to the Sigma Stack     │
│                                             │
│  The 13-step methodology, open-source       │
│  tools, and community for building          │
│  production software with AI.               │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  First Name                           │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  Email                                │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  What are you interested in?    ▼     │  │
│  │                                       │  │
│  │  ○ Sigma Protocol (GitHub repo)       │  │
│  │  ○ Quant Stream (waitlist)            │  │
│  │  ○ SSS Academy (waitlist)             │  │
│  │  ○ Discord Community                  │  │
│  │  ○ AI Coding Tips (free PDF)          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │          Send Me the Link →           │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  By signing up you agree to receive         │
│  occasional emails. Unsubscribe anytime.    │
│                                             │
└─────────────────────────────────────────────┘
```

### After Submit

**Option A: Redirect to link**
- On submit, redirect to the appropriate link based on dropdown selection:
  - Sigma Protocol → GitHub repo URL
  - Quant Stream → "You're on the waitlist" confirmation page
  - SSS Academy → "You're on the waitlist" confirmation page
  - Discord Community → Discord invite link
  - AI Coding Tips → PDF download URL

**Option B: Confirmation message (simpler)**
- Replace the form with: "Check your email — your link is on the way!"
- Resend sends a welcome email with the link

**Recommended:** Option A (redirect). Immediate gratification. No dependency on email delivery.

---

## Technical Implementation

### Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js (static page) or plain HTML | Single page, no routing needed |
| **Hosting** | Vercel | Free tier, automatic HTTPS, custom domain |
| **Form handling** | Client-side fetch → Resend API | No backend needed |
| **Styling** | Tailwind CSS | Matches existing SSS stack |
| **Domain** | `sigmasoftwaresolutions.io/links` or `links.sigmasoftwaresolutions.io` | Or standalone Vercel deploy |

### Form Submission Handler

On form submit, make a `POST` request to the Resend Contacts API:

```typescript
async function handleSubmit(e: FormEvent) {
  e.preventDefault()

  const formData = new FormData(e.target as HTMLFormElement)
  const firstName = formData.get('firstName') as string
  const email = formData.get('email') as string
  const interest = formData.get('interest') as string

  // Map interest selection to Resend segment tag
  const segmentMap: Record<string, string> = {
    'sigma-protocol': 'sigma-protocol',
    'quant-stream': 'quant-stream',
    'architect-academy': 'architect-academy',
    'discord-community': 'discord-community',
    'lead-magnet': 'lead-magnet',
  }

  // Map interest selection to redirect URL
  const redirectMap: Record<string, string> = {
    'sigma-protocol': 'https://github.com/dallionking/sigma-protocol',
    'quant-stream': '/waitlist-confirmed',
    'architect-academy': '/waitlist-confirmed',
    'discord-community': 'DISCORD_INVITE_URL',
    'lead-magnet': 'PDF_DOWNLOAD_URL',
  }

  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName,
        segment: segmentMap[interest],
      }),
    })

    // Redirect to the appropriate link
    window.location.href = redirectMap[interest]
  } catch (error) {
    // Show error state
  }
}
```

### API Route (`/api/subscribe`)

The Resend API key must not be exposed client-side. Use a thin API route:

```typescript
// app/api/subscribe/route.ts (Next.js App Router)
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, firstName, segment } = await request.json()

  const response = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      first_name: firstName,
      audience_id: process.env.RESEND_AUDIENCE_ID,
      // Tag with segment for filtering
      // Check Resend docs for exact field name
    }),
  })

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
```

### Environment Variables

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_AUDIENCE_ID=aud_xxxxxxxxxxxx
```

---

## Design Notes

### Visual Style
- Dark background (matches Sigma brand)
- Minimal — no images, no testimonials, no feature grid
- Logo at top, form centered, single CTA button
- Mobile-first (most traffic from social bio links is mobile)

### Copy Principles
- No hype. State what they get.
- "Get Early Access" (not "Join the Revolution")
- Dropdown labels match the ManyChat keyword deliverables exactly
- Consent line at the bottom (GDPR/CAN-SPAM friendly)

### Validation
- `firstName`: required, min 1 char
- `email`: required, valid email format (HTML5 `type="email"` is sufficient)
- `interest`: required, must select one option
- Button disabled until all fields valid
- Loading state on button during submission

---

## UTM Tracking (Optional)

Append UTM parameters to the landing page URL when sharing on different platforms:

| Platform | URL |
|----------|-----|
| YouTube description | `sigmasoftwaresolutions.io/links?utm_source=youtube` |
| X bio | `sigmasoftwaresolutions.io/links?utm_source=x` |
| TikTok bio | `sigmasoftwaresolutions.io/links?utm_source=tiktok` |
| Instagram bio | `sigmasoftwaresolutions.io/links?utm_source=instagram` |

The page can read `utm_source` from the URL and include it in the Resend API call as metadata. Not critical for launch — add when you want platform attribution.

---

## Multi-Link Alternative

If you'd rather use a link-in-bio tool (Linktree, Stan Store, etc.) instead of a custom page:

- Use the link-in-bio tool to list the 5 options as separate links
- Each link goes to a simple form page (or directly to the deliverable if email capture isn't needed)
- Downside: no email capture unless each link has its own form
- Recommendation: Build the custom landing page. It's one form, one page, ~2 hours of work, and captures emails for every visitor.

---

## Testing

- [ ] Form submits successfully on mobile (iPhone Safari, Android Chrome)
- [ ] Form submits successfully on desktop
- [ ] Resend contact created with correct name, email, and segment tag
- [ ] Redirect works for each dropdown option
- [ ] Error state displays when API fails (disable network and test)
- [ ] Page loads fast (< 2s on 3G)
- [ ] Consent text is visible without scrolling on mobile

---

*Last updated: 2026-02-08*
*Cross-reference: `08-MANYCHAT-AUTOMATION-STRATEGY.md`, `PDF-LEAD-MAGNETS.md`*
