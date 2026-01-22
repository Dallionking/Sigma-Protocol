# User Stories: EventHub

## Epic 1: Organizer Account

### US-1.1: Create Organizer Account
**As an** event organizer
**I want to** create an account
**So that** I can create and manage events

**Acceptance Criteria:**
- Sign up with email/password
- Enter name and organization
- Account created
- Redirected to dashboard

### US-1.2: View Dashboard
**As an** organizer
**I want to** see my events overview
**So that** I can manage my events

**Acceptance Criteria:**
- List of my events
- Quick stats per event
- Create event button
- Filter by status

---

## Epic 2: Event Creation

### US-2.1: Create Event
**As an** organizer
**I want to** create a new event
**So that** people can register

**Acceptance Criteria:**
- Enter event title
- Set date and time
- Select timezone
- Choose location type
- Enter venue or virtual URL
- Add description
- Upload cover image

### US-2.2: Add Ticket Types
**As an** organizer
**I want to** create ticket options
**So that** I can offer different tiers

**Acceptance Criteria:**
- Add multiple ticket types
- Set name and description
- Set price (or free)
- Set quantity limit
- Set sales period
- Reorder tickets

### US-2.3: Add Custom Questions
**As an** organizer
**I want to** ask custom questions
**So that** I collect needed info

**Acceptance Criteria:**
- Add text questions
- Add dropdown questions
- Mark as required
- Questions appear on registration

### US-2.4: Preview Event
**As an** organizer
**I want to** preview my event page
**So that** I can verify it looks good

**Acceptance Criteria:**
- See page as attendees will
- Preview all ticket options
- Test registration form

### US-2.5: Publish Event
**As an** organizer
**I want to** publish my event
**So that** people can register

**Acceptance Criteria:**
- Publish button available
- Event becomes public
- Get shareable URL
- Can unpublish if needed

---

## Epic 3: Event Page

### US-3.1: View Event Details
**As a** visitor
**I want to** see event information
**So that** I can decide to attend

**Acceptance Criteria:**
- Event title and description
- Date, time, timezone
- Location with map
- Organizer info
- Share buttons

### US-3.2: View Ticket Options
**As a** visitor
**I want to** see available tickets
**So that** I can choose one

**Acceptance Criteria:**
- All ticket types listed
- Price displayed
- Availability shown
- Sold out indicator
- Select button

### US-3.3: Event SEO
**As an** organizer
**I want to** my event discoverable
**So that** more people find it

**Acceptance Criteria:**
- Proper meta tags
- Open Graph for sharing
- Event schema markup
- Friendly URL

---

## Epic 4: Registration

### US-4.1: Register for Event
**As an** attendee
**I want to** register for an event
**So that** I can attend

**Acceptance Criteria:**
- Select ticket type
- Enter name and email
- Answer custom questions
- Submit registration
- See confirmation

### US-4.2: Receive Confirmation
**As an** attendee
**I want to** receive confirmation
**So that** I have my ticket

**Acceptance Criteria:**
- Confirmation page with QR
- Confirmation code shown
- Email sent immediately
- Email includes QR code
- Email includes details

### US-4.3: Add to Calendar
**As an** attendee
**I want to** add event to calendar
**So that** I don't forget

**Acceptance Criteria:**
- Add to Calendar button
- Downloads .ics file
- Works with major calendars
- Includes event details

### US-4.4: Pay for Ticket
**As an** attendee
**I want to** pay for a paid ticket
**So that** I can complete registration

**Acceptance Criteria:**
- Stripe payment form
- Secure checkout
- Payment confirmation
- Receipt emailed

---

## Epic 5: Attendee Management

### US-5.1: View Attendee List
**As an** organizer
**I want to** see all registrations
**So that** I know who's coming

**Acceptance Criteria:**
- List all registrations
- Show name, email, ticket type
- Show check-in status
- Pagination for large lists

### US-5.2: Search Attendees
**As an** organizer
**I want to** search for attendees
**So that** I can find specific people

**Acceptance Criteria:**
- Search by name
- Search by email
- Search by confirmation code
- Results update as typing

### US-5.3: Filter Attendees
**As an** organizer
**I want to** filter the attendee list
**So that** I can segment views

**Acceptance Criteria:**
- Filter by ticket type
- Filter by check-in status
- Filter by registration date
- Combine multiple filters

### US-5.4: Export Attendees
**As an** organizer
**I want to** export attendee data
**So that** I can use elsewhere

**Acceptance Criteria:**
- Export as CSV
- Includes all fields
- Respects current filters
- Downloads immediately

### US-5.5: Cancel Registration
**As an** organizer
**I want to** cancel a registration
**So that** I can handle issues

**Acceptance Criteria:**
- Cancel button available
- Confirmation required
- Spot freed up
- Attendee notified

---

## Epic 6: Check-in

### US-6.1: Scan QR Code
**As a** check-in staff
**I want to** scan attendee QR codes
**So that** I can check them in

**Acceptance Criteria:**
- Camera access requested
- QR scanner displays
- Scans quickly
- Shows attendee info
- Confirm check-in

### US-6.2: Manual Check-in
**As a** check-in staff
**I want to** search and check in
**So that** I can help people without QR

**Acceptance Criteria:**
- Search by name/email
- Find attendee in list
- Tap to check in
- Confirmation shown

### US-6.3: View Check-in Stats
**As an** organizer
**I want to** see check-in progress
**So that** I know attendance

**Acceptance Criteria:**
- Checked in count
- Total registered
- Percentage checked in
- Real-time updates

### US-6.4: Prevent Duplicate Check-in
**As a** check-in staff
**I want to** be warned of duplicates
**So that** I don't check in twice

**Acceptance Criteria:**
- Warning if already checked in
- Shows original check-in time
- Option to override

---

## Epic 7: Event Analytics

### US-7.1: View Registration Stats
**As an** organizer
**I want to** see registration analytics
**So that** I can track progress

**Acceptance Criteria:**
- Total registrations
- Registrations by ticket type
- Revenue (if paid)
- Registration over time chart

### US-7.2: View Traffic Sources
**As an** organizer
**I want to** know where traffic comes from
**So that** I can optimize promotion

**Acceptance Criteria:**
- Page views count
- Conversion rate
- Referral sources (basic)

---

## Priority Order

### Must Have (P0)
- US-1.1 (Account)
- US-2.1, US-2.2, US-2.5 (Event creation)
- US-3.1, US-3.2 (Event page)
- US-4.1, US-4.2 (Registration)
- US-5.1 (Attendee list)
- US-6.1, US-6.2 (Check-in)

### Should Have (P1)
- US-1.2 (Dashboard)
- US-2.3, US-2.4 (Questions, preview)
- US-4.3 (Calendar)
- US-5.2, US-5.3, US-5.4 (Search, filter, export)
- US-6.3, US-6.4 (Stats, duplicate prevention)

### Nice to Have (P2)
- US-3.3 (SEO)
- US-4.4 (Payments)
- US-5.5 (Cancel)
- US-7.1, US-7.2 (Analytics)


