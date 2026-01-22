# User Stories: InvoiceFlow

## Epic 1: Business Setup

### US-1.1: Create Account
**As a** freelancer
**I want to** create an account
**So that** I can start invoicing clients

**Acceptance Criteria:**
- Sign up with email/password
- Sign up with Google OAuth
- Directed to business setup

### US-1.2: Setup Business Profile
**As a** new user
**I want to** enter my business details
**So that** they appear on invoices

**Acceptance Criteria:**
- Enter business name (required)
- Upload logo (optional)
- Enter address
- Set currency (dropdown)
- Set default payment terms
- Save and proceed to dashboard

### US-1.3: Edit Business Profile
**As a** user
**I want to** update my business details
**So that** future invoices are correct

**Acceptance Criteria:**
- Access from settings
- Edit all business fields
- Upload new logo
- Changes apply to new invoices

---

## Epic 2: Client Management

### US-2.1: Add Client
**As a** user
**I want to** add a new client
**So that** I can invoice them

**Acceptance Criteria:**
- Enter client name (required)
- Enter email (required for sending)
- Enter address, phone (optional)
- Set custom payment terms (optional)
- Add notes (optional)
- Client saved and available

### US-2.2: View Clients
**As a** user
**I want to** see all my clients
**So that** I can manage them

**Acceptance Criteria:**
- List all clients
- Search by name/email
- Show outstanding balance per client
- Sort by name, balance, recent

### US-2.3: Edit Client
**As a** user
**I want to** edit a client's details
**So that** information stays current

**Acceptance Criteria:**
- Edit all client fields
- Changes saved immediately
- Existing invoices unchanged

### US-2.4: Delete Client
**As a** user
**I want to** delete a client
**So that** I can remove old entries

**Acceptance Criteria:**
- Confirmation required
- Cannot delete with outstanding invoices
- Client and history removed

### US-2.5: View Client History
**As a** user
**I want to** see a client's invoice history
**So that** I know our history

**Acceptance Criteria:**
- List client's invoices
- Show paid, outstanding, total
- Navigate to any invoice

---

## Epic 3: Invoice Creation

### US-3.1: Start New Invoice
**As a** user
**I want to** create a new invoice
**So that** I can bill a client

**Acceptance Criteria:**
- Click "New Invoice"
- Select existing client or create new
- Invoice number auto-generated
- Today's date as default

### US-3.2: Add Line Items
**As a** user
**I want to** add services/products to invoice
**So that** I can itemize my work

**Acceptance Criteria:**
- Add line item button
- Enter description, quantity, price
- Total auto-calculated
- Reorder items
- Delete items

### US-3.3: Set Invoice Details
**As a** user
**I want to** configure invoice settings
**So that** the invoice is complete

**Acceptance Criteria:**
- Set invoice date
- Set due date (or use terms)
- Set tax rate (%)
- Set discount (% or fixed)
- Add notes
- Add terms & conditions

### US-3.4: Preview Invoice
**As a** user
**I want to** preview the invoice
**So that** I can verify before sending

**Acceptance Criteria:**
- Preview matches PDF output
- Shows all details
- Totals calculated correctly

### US-3.5: Save Draft
**As a** user
**I want to** save without sending
**So that** I can finish later

**Acceptance Criteria:**
- Save as draft button
- Returns to dashboard
- Draft visible in invoice list
- Can edit and complete later

---

## Epic 4: Invoice Delivery

### US-4.1: Download PDF
**As a** user
**I want to** download the invoice as PDF
**So that** I can share it manually

**Acceptance Criteria:**
- Download button available
- PDF generated quickly (< 5s)
- Filename includes invoice number
- PDF matches preview

### US-4.2: Send Invoice Email
**As a** user
**I want to** email the invoice to client
**So that** they receive it immediately

**Acceptance Criteria:**
- Send button available
- Preview email before sending
- PDF attached to email
- Status updates to "Sent"
- Sent timestamp recorded

### US-4.3: Resend Invoice
**As a** user
**I want to** resend an invoice
**So that** clients who missed it can receive again

**Acceptance Criteria:**
- Resend available for sent invoices
- Same email format
- No duplicate charges

---

## Epic 5: Payment Tracking

### US-5.1: Record Full Payment
**As a** user
**I want to** mark an invoice as paid
**So that** I track received payments

**Acceptance Criteria:**
- "Mark Paid" button
- Enter payment date
- Enter payment method
- Status updates to "Paid"
- Dashboard updates

### US-5.2: Record Partial Payment
**As a** user
**I want to** record a partial payment
**So that** I track what's still owed

**Acceptance Criteria:**
- Enter payment amount
- Balance remaining shown
- Status updates to "Partial"
- Multiple partials allowed

### US-5.3: View Overdue Invoices
**As a** user
**I want to** see overdue invoices
**So that** I can follow up

**Acceptance Criteria:**
- Filter for overdue
- Days overdue shown
- Sorted by oldest first
- Total overdue displayed

### US-5.4: Send Payment Reminder
**As a** user
**I want to** send a reminder email
**So that** clients pay on time

**Acceptance Criteria:**
- Reminder button on overdue
- Friendly reminder template
- Original invoice attached
- Reminder sent timestamp

---

## Epic 6: Invoice Management

### US-6.1: View All Invoices
**As a** user
**I want to** see all my invoices
**So that** I have an overview

**Acceptance Criteria:**
- List all invoices
- Show number, client, amount, status
- Filter by status, client, date
- Search by number/client

### US-6.2: Duplicate Invoice
**As a** user
**I want to** duplicate an invoice
**So that** I can quickly create similar ones

**Acceptance Criteria:**
- Duplicate button on invoice
- New invoice number assigned
- All details copied
- Opens in edit mode

### US-6.3: Edit Draft Invoice
**As a** user
**I want to** edit a draft invoice
**So that** I can make changes

**Acceptance Criteria:**
- Edit available for drafts only
- All fields editable
- Can save as draft or send

### US-6.4: Delete Invoice
**As a** user
**I want to** delete an invoice
**So that** I can remove mistakes

**Acceptance Criteria:**
- Delete available for drafts
- Confirmation required
- Invoice removed permanently

---

## Epic 7: Dashboard

### US-7.1: View Dashboard
**As a** user
**I want to** see my business overview
**So that** I know my financial status

**Acceptance Criteria:**
- Total outstanding shown
- This month revenue shown
- Overdue count shown
- Recent invoices listed

### US-7.2: Quick Actions
**As a** user
**I want to** quickly create items
**So that** I save time

**Acceptance Criteria:**
- "New Invoice" button prominent
- "New Client" button available
- Single click to start

---

## Priority Order

### Must Have (P0)
- US-1.1, US-1.2 (Account, business)
- US-2.1, US-2.2 (Client CRUD)
- US-3.1, US-3.2, US-3.3, US-3.5 (Invoice creation)
- US-4.1 (PDF download)
- US-5.1 (Mark paid)

### Should Have (P1)
- US-2.3, US-2.4, US-2.5 (Client management)
- US-3.4 (Preview)
- US-4.2 (Send email)
- US-5.2, US-5.3 (Partial, overdue)
- US-6.1, US-6.2 (List, duplicate)
- US-7.1 (Dashboard)

### Nice to Have (P2)
- US-1.3 (Edit business)
- US-4.3 (Resend)
- US-5.4 (Reminder)
- US-6.3, US-6.4 (Edit, delete)
- US-7.2 (Quick actions)


