# User Stories: LinkHub

## Epic 1: User Authentication

### US-1.1: Sign Up
**As a** new user
**I want to** create an account with email or social login
**So that** I can start building my link page

**Acceptance Criteria:**
- Can sign up with email/password
- Can sign up with Google OAuth
- Must choose unique username during signup
- Username becomes my public URL slug
- Receive welcome email after signup

### US-1.2: Sign In
**As a** returning user
**I want to** log into my account
**So that** I can manage my links

**Acceptance Criteria:**
- Can sign in with email/password
- Can sign in with Google OAuth
- Redirected to dashboard after login
- "Remember me" option available

### US-1.3: Password Reset
**As a** user who forgot my password
**I want to** reset my password via email
**So that** I can regain access to my account

**Acceptance Criteria:**
- Can request password reset email
- Reset link expires after 1 hour
- Can set new password from reset link

---

## Epic 2: Link Management

### US-2.1: Add Link
**As a** user
**I want to** add a new link to my page
**So that** visitors can access my content

**Acceptance Criteria:**
- Can enter link title (required)
- Can enter link URL (required, validated)
- Can select optional icon
- Link appears in my link list
- Link appears on public profile

### US-2.2: Edit Link
**As a** user
**I want to** edit an existing link
**So that** I can update outdated information

**Acceptance Criteria:**
- Can edit title
- Can edit URL
- Can change icon
- Changes reflect immediately on public profile

### US-2.3: Delete Link
**As a** user
**I want to** delete a link
**So that** I can remove irrelevant content

**Acceptance Criteria:**
- Confirmation dialog before delete
- Link removed from public profile immediately
- Historical analytics preserved

### US-2.4: Reorder Links
**As a** user
**I want to** drag and drop links to reorder them
**So that** I can prioritize my most important links

**Acceptance Criteria:**
- Can drag links to new positions
- Order saved automatically
- Public profile reflects new order

### US-2.5: Toggle Link Visibility
**As a** user
**I want to** hide a link without deleting it
**So that** I can temporarily remove it from my page

**Acceptance Criteria:**
- Toggle switch on each link
- Hidden links not shown on public profile
- Hidden links remain in dashboard (grayed out)

---

## Epic 3: Profile Customization

### US-3.1: Edit Profile Info
**As a** user
**I want to** customize my profile information
**So that** visitors know who I am

**Acceptance Criteria:**
- Can upload profile photo
- Can edit display name
- Can edit bio (150 char limit)
- Changes reflect on public profile

### US-3.2: Select Theme
**As a** user
**I want to** choose a visual theme
**So that** my page matches my brand

**Acceptance Criteria:**
- At least 5 theme options
- Live preview when selecting
- Theme applies to public profile

### US-3.3: Custom Accent Color
**As a** user
**I want to** pick a custom accent color
**So that** my page has my brand color

**Acceptance Criteria:**
- Color picker component
- Color applies to buttons/accents
- Works with all themes

---

## Epic 4: Public Profile

### US-4.1: View Public Profile
**As a** visitor
**I want to** view someone's link page
**So that** I can access their content

**Acceptance Criteria:**
- Accessible at /[username]
- Shows profile photo, name, bio
- Shows all visible links as buttons
- Mobile-responsive design
- Fast load time (< 2s)

### US-4.2: Click Link
**As a** visitor
**I want to** click a link
**So that** I can visit that destination

**Acceptance Criteria:**
- Link opens in new tab
- Click is tracked for analytics
- Original URL is preserved (no redirects that break referrer)

### US-4.3: SEO Optimization
**As a** user
**I want to** my profile to be SEO-friendly
**So that** it appears in search results

**Acceptance Criteria:**
- Proper meta tags (title, description)
- Open Graph tags for social sharing
- Semantic HTML structure

---

## Epic 5: Analytics

### US-5.1: View Overview Stats
**As a** user
**I want to** see my overall page performance
**So that** I know how my page is doing

**Acceptance Criteria:**
- Total page views (7d, 30d)
- Total link clicks (7d, 30d)
- Click-through rate

### US-5.2: View Per-Link Stats
**As a** user
**I want to** see how each link performs
**So that** I know what content resonates

**Acceptance Criteria:**
- Click count per link
- Percentage of total clicks
- Sorted by most clicked

### US-5.3: Date Range Filter
**As a** user
**I want to** filter analytics by date range
**So that** I can analyze specific periods

**Acceptance Criteria:**
- Last 7 days option
- Last 30 days option
- All time option

---

## Priority Order

### Must Have (P0)
- US-1.1, US-1.2 (Auth)
- US-2.1, US-2.2, US-2.3 (Link CRUD)
- US-3.1 (Basic profile)
- US-4.1, US-4.2 (Public profile)

### Should Have (P1)
- US-2.4, US-2.5 (Reorder, visibility)
- US-3.2, US-3.3 (Themes)
- US-5.1, US-5.2 (Analytics)

### Nice to Have (P2)
- US-1.3 (Password reset)
- US-4.3 (SEO)
- US-5.3 (Date range)


