# User Stories: LaunchList

## Epic 1: Landing Page

### US-1.1: View Landing Page
**As a** visitor
**I want to** see a compelling landing page
**So that** I understand the product and want to join

**Acceptance Criteria:**
- Hero section with clear headline
- Value proposition explained
- Feature highlights visible
- Social proof elements
- Email signup form prominent
- Mobile responsive

### US-1.2: Animated Elements
**As a** visitor
**I want to** see subtle animations
**So that** the page feels premium and engaging

**Acceptance Criteria:**
- Hero text animates on load
- Feature cards fade in on scroll
- CTA button has hover effect
- Success state has celebration animation

---

## Epic 2: Email Signup

### US-2.1: Submit Email
**As a** visitor
**I want to** enter my email to join the waitlist
**So that** I'm notified when the product launches

**Acceptance Criteria:**
- Email input field visible
- Clear CTA button
- Email validation (format check)
- Error message for invalid email
- Loading state while submitting

### US-2.2: Duplicate Prevention
**As a** returning visitor
**I want to** be told if I'm already signed up
**So that** I don't create duplicate entries

**Acceptance Criteria:**
- Check email against database
- Show friendly message if exists
- Redirect to thank you page with their info

### US-2.3: Spam Protection
**As a** site owner
**I want to** prevent bot signups
**So that** my list has real people

**Acceptance Criteria:**
- reCAPTCHA v3 integrated
- Score threshold filtering
- Rate limiting on submissions

---

## Epic 3: Referral System

### US-3.1: Get Referral Link
**As a** new signup
**I want to** receive a unique referral link
**So that** I can share and earn rewards

**Acceptance Criteria:**
- Unique code generated (6 chars)
- Full URL displayed
- Easy to copy to clipboard
- Code persists for user

### US-3.2: Share on Social
**As a** signup
**I want to** share my link on social media
**So that** I can refer friends easily

**Acceptance Criteria:**
- Twitter share button (pre-filled text)
- LinkedIn share button
- Copy link button
- Share counts increment

### US-3.3: Track Referrals
**As a** referrer
**I want to** see how many people I've referred
**So that** I know my progress

**Acceptance Criteria:**
- Referral count displayed
- Updates when referral signs up
- Shows on thank you page

### US-3.4: Referral Attribution
**As a** site owner
**I want to** track referral chains
**So that** I know who referred whom

**Acceptance Criteria:**
- Referral code captured from URL
- Stored with new signup
- Referrer's count incremented
- Chain visible in admin

---

## Epic 4: Thank You Page

### US-4.1: Confirmation Display
**As a** new signup
**I want to** see confirmation after signing up
**So that** I know it worked

**Acceptance Criteria:**
- Success message displayed
- Position in waitlist shown
- Animated celebration

### US-4.2: Reward Tiers
**As a** signup
**I want to** see what rewards I can earn
**So that** I'm motivated to refer

**Acceptance Criteria:**
- Tier thresholds displayed
- Progress indicator for each tier
- Current tier highlighted
- Next milestone shown

### US-4.3: Return Visit
**As a** previous signup
**I want to** check my status later
**So that** I can see my progress

**Acceptance Criteria:**
- Link in welcome email to status page
- Shows current position
- Shows referral count
- Shows tier progress

---

## Epic 5: Email Notifications

### US-5.1: Welcome Email
**As a** new signup
**I want to** receive a welcome email
**So that** I have my referral link saved

**Acceptance Criteria:**
- Sent immediately after signup
- Contains referral link
- Contains position number
- Explains reward tiers
- Branded template

### US-5.2: Referral Success Email
**As a** referrer
**I want to** be notified when someone uses my link
**So that** I know my sharing worked

**Acceptance Criteria:**
- Email sent when referral signs up
- Shows new referral count
- Shows progress to next tier

### US-5.3: Milestone Email
**As a** referrer
**I want to** be notified when I hit a tier
**So that** I know I earned a reward

**Acceptance Criteria:**
- Email sent at 3, 10, 25 referrals
- Congratulates on achievement
- Explains the reward earned

---

## Epic 6: Admin Dashboard

### US-6.1: View Stats
**As an** admin
**I want to** see waitlist statistics
**So that** I can track campaign performance

**Acceptance Criteria:**
- Total signups count
- Today's signups count
- Week-over-week growth
- Referral conversion rate

### US-6.2: Signup Chart
**As an** admin
**I want to** see signup velocity over time
**So that** I can identify trends

**Acceptance Criteria:**
- Line chart of signups per day
- Last 30 days default
- Hover for exact numbers

### US-6.3: Top Referrers
**As an** admin
**I want to** see who's referring the most
**So that** I can recognize top advocates

**Acceptance Criteria:**
- Table of top 10 referrers
- Shows email and count
- Sortable by count

### US-6.4: Export List
**As an** admin
**I want to** export email list
**So that** I can import into email tool

**Acceptance Criteria:**
- CSV download button
- Includes email, date, referral count
- Filters for status

---

## Priority Order

### Must Have (P0)
- US-1.1 (Landing page)
- US-2.1 (Email signup)
- US-3.1, US-3.2, US-3.3 (Referrals)
- US-4.1 (Thank you page)
- US-5.1 (Welcome email)

### Should Have (P1)
- US-1.2 (Animations)
- US-2.2, US-2.3 (Validation)
- US-4.2, US-4.3 (Tiers, return visit)
- US-6.1, US-6.4 (Admin stats, export)

### Nice to Have (P2)
- US-3.4 (Chain tracking)
- US-5.2, US-5.3 (Notification emails)
- US-6.2, US-6.3 (Charts, leaderboard)


