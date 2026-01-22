# User Stories: MenuScan

## Epic 1: Restaurant Setup

### US-1.1: Create Restaurant Account
**As a** restaurant owner
**I want to** create an account for my restaurant
**So that** I can set up my digital menu

**Acceptance Criteria:**
- Sign up with email/password
- Enter restaurant name (required)
- Choose unique URL slug
- Account created and logged in

### US-1.2: Restaurant Profile
**As a** restaurant owner
**I want to** customize my restaurant's profile
**So that** my menu reflects my brand

**Acceptance Criteria:**
- Upload restaurant logo
- Edit restaurant description
- Add address and phone
- Select currency for prices

---

## Epic 2: Menu Management

### US-2.1: Create Category
**As a** restaurant owner
**I want to** create menu categories
**So that** my menu is organized

**Acceptance Criteria:**
- Enter category name
- Select emoji/icon for category
- Category appears in menu builder
- Can create multiple categories

### US-2.2: Reorder Categories
**As a** restaurant owner
**I want to** reorder my categories
**So that** they appear in logical order

**Acceptance Criteria:**
- Drag and drop categories
- Order saved automatically
- Reflects on public menu

### US-2.3: Add Menu Item
**As a** restaurant owner
**I want to** add items to my menu
**So that** diners can see what I offer

**Acceptance Criteria:**
- Enter item name (required)
- Enter price (required)
- Add description (optional)
- Upload photo (optional)
- Select dietary tags
- Item appears in category

### US-2.4: Edit Menu Item
**As a** restaurant owner
**I want to** edit existing menu items
**So that** I can update information

**Acceptance Criteria:**
- Edit all item fields
- Replace photo
- Changes save immediately

### US-2.5: Delete Menu Item
**As a** restaurant owner
**I want to** remove menu items
**So that** discontinued items don't show

**Acceptance Criteria:**
- Delete confirmation
- Item removed from menu
- Category reorders automatically

### US-2.6: Mark Item Unavailable
**As a** restaurant owner
**I want to** mark items as sold out
**So that** diners know what's available

**Acceptance Criteria:**
- Toggle "Sold Out" status
- Item shows as unavailable on menu
- Can quickly toggle back

### US-2.7: Dietary Tags
**As a** restaurant owner
**I want to** tag items with dietary info
**So that** diners can filter appropriately

**Acceptance Criteria:**
- Vegan tag (V)
- Vegetarian tag (VG)
- Gluten-free tag (GF)
- Spicy level (0-3 peppers)
- Tags display on menu items

---

## Epic 3: Public Menu

### US-3.1: View Menu
**As a** diner
**I want to** view the restaurant's menu
**So that** I can decide what to order

**Acceptance Criteria:**
- Menu loads at /[restaurant-slug]
- Shows restaurant branding
- Displays all categories and items
- Works on mobile devices

### US-3.2: Browse Categories
**As a** diner
**I want to** navigate between categories
**So that** I can find what I'm looking for

**Acceptance Criteria:**
- Category tabs or sections
- Smooth scrolling
- Active category highlighted

### US-3.3: View Item Details
**As a** diner
**I want to** see item details
**So that** I understand what I'm ordering

**Acceptance Criteria:**
- Item name and price
- Description visible
- Photo displayed (if available)
- Dietary icons shown

### US-3.4: Filter by Dietary
**As a** diner with dietary restrictions
**I want to** filter menu items
**So that** I only see what I can eat

**Acceptance Criteria:**
- Filter buttons for V, VG, GF
- Menu updates to show filtered items
- Clear filter option

---

## Epic 4: QR Code

### US-4.1: View QR Code
**As a** restaurant owner
**I want to** see my menu's QR code
**So that** I can verify it works

**Acceptance Criteria:**
- QR code displayed in dashboard
- Scanning opens menu page
- Shows URL below QR

### US-4.2: Download QR Code
**As a** restaurant owner
**I want to** download my QR code
**So that** I can print it

**Acceptance Criteria:**
- Download as PNG
- High resolution for printing
- Minimum 2cm x 2cm recommended

### US-4.3: QR Code Styling
**As a** restaurant owner
**I want to** customize my QR code
**So that** it matches my brand

**Acceptance Criteria:**
- Optional logo in center
- Custom frame/border
- Color options

---

## Epic 5: Analytics (Stretch)

### US-5.1: View Menu Analytics
**As a** restaurant owner
**I want to** see how many people viewed my menu
**So that** I can gauge engagement

**Acceptance Criteria:**
- Total scans/views
- Views by day
- Popular items viewed

---

## Priority Order

### Must Have (P0)
- US-1.1 (Account creation)
- US-2.1, US-2.3 (Categories and items)
- US-3.1, US-3.2, US-3.3 (Public menu)
- US-4.1, US-4.2 (QR code)

### Should Have (P1)
- US-1.2 (Restaurant profile)
- US-2.4, US-2.5, US-2.6, US-2.7 (Item management)
- US-3.4 (Dietary filter)
- US-2.2 (Reorder)

### Nice to Have (P2)
- US-4.3 (QR styling)
- US-5.1 (Analytics)


