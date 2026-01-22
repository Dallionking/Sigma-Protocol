# User Stories: HabitFlow

## Epic 1: User Account

### US-1.1: Create Account
**As a** new user
**I want to** create an account
**So that** I can track my habits

**Acceptance Criteria:**
- Sign up with email/password
- Sign up with Google OAuth
- Set timezone during onboarding
- Account created and logged in

### US-1.2: Update Profile
**As a** user
**I want to** update my profile settings
**So that** the app works for my timezone

**Acceptance Criteria:**
- Change display name
- Change timezone
- Changes saved immediately

---

## Epic 2: Habit Management

### US-2.1: Create Habit
**As a** user
**I want to** create a new habit to track
**So that** I can build better routines

**Acceptance Criteria:**
- Enter habit name (required)
- Select emoji icon
- Choose color
- Select category
- Set frequency (daily, weekdays, custom)
- Optionally set reminder time
- Habit appears in today view

### US-2.2: Edit Habit
**As a** user
**I want to** edit an existing habit
**So that** I can adjust my tracking

**Acceptance Criteria:**
- Edit all habit fields
- Changes reflect immediately
- Past completions preserved

### US-2.3: Archive Habit
**As a** user
**I want to** archive a habit I'm pausing
**So that** it doesn't clutter my daily view

**Acceptance Criteria:**
- Archive option available
- Archived habits hidden from today
- Can view archived habits separately
- Can restore archived habits

### US-2.4: Delete Habit
**As a** user
**I want to** delete a habit
**So that** I can remove habits I no longer want

**Acceptance Criteria:**
- Confirmation dialog
- All completions deleted
- Habit removed from views

### US-2.5: Reorder Habits
**As a** user
**I want to** reorder my habits
**So that** important ones appear first

**Acceptance Criteria:**
- Drag and drop reordering
- Order saved automatically
- Order persists across sessions

---

## Epic 3: Daily Tracking

### US-3.1: View Today's Habits
**As a** user
**I want to** see which habits I need to do today
**So that** I know what to complete

**Acceptance Criteria:**
- Shows current date
- Lists habits scheduled for today
- Shows completion status
- Shows current streak for each

### US-3.2: Complete Habit
**As a** user
**I want to** mark a habit as done
**So that** I maintain my streak

**Acceptance Criteria:**
- Tap checkbox to complete
- Visual confirmation (animation)
- Streak updates immediately
- Completion timestamp recorded

### US-3.3: Uncomplete Habit
**As a** user
**I want to** undo a completion
**So that** I can fix mistakes

**Acceptance Criteria:**
- Tap completed habit to undo
- Streak recalculates
- Works for today only

### US-3.4: View Past Days
**As a** user
**I want to** view past days
**So that** I can backfill missed entries

**Acceptance Criteria:**
- Navigate to previous days
- See that day's habits
- Complete habits retroactively
- Limited to last 7 days

### US-3.5: Add Completion Note
**As a** user
**I want to** add notes to completions
**So that** I can track context

**Acceptance Criteria:**
- Optional note field on completion
- Notes visible in history
- Can edit notes later

---

## Epic 4: Streaks

### US-4.1: View Current Streak
**As a** user
**I want to** see my current streak
**So that** I stay motivated

**Acceptance Criteria:**
- Streak number displayed per habit
- Flame icon for 3+ days
- Updates in real-time

### US-4.2: View Longest Streak
**As a** user
**I want to** see my best streak ever
**So that** I know my record

**Acceptance Criteria:**
- Longest streak in habit details
- Updated when new record set
- Celebration on new record

### US-4.3: Use Streak Freeze
**As a** user
**I want to** use a streak freeze
**So that** one miss doesn't break my streak

**Acceptance Criteria:**
- One freeze available by default
- Automatically used on first miss
- Notified when freeze used
- Freezes replenish weekly

### US-4.4: Streak Milestone
**As a** user
**I want to** be celebrated at milestones
**So that** I feel accomplished

**Acceptance Criteria:**
- Special animation at 7, 30, 100 days
- Milestone badge displayed
- Shareable achievement

---

## Epic 5: Statistics

### US-5.1: View Completion Rate
**As a** user
**I want to** see my overall completion rate
**So that** I know how consistent I am

**Acceptance Criteria:**
- Percentage displayed
- Timeframe options (7d, 30d, 90d)
- Updates with new completions

### US-5.2: View Calendar Heatmap
**As a** user
**I want to** see my activity calendar
**So that** I can visualize consistency

**Acceptance Criteria:**
- GitHub-style heatmap
- Color intensity = completion %
- Shows last 90 days
- Tap for day details

### US-5.3: View Habit Stats
**As a** user
**I want to** see individual habit statistics
**So that** I know which habits I maintain best

**Acceptance Criteria:**
- Current streak
- Longest streak
- Total completions
- Completion rate
- First/last completion dates

### US-5.4: View Best Habits
**As a** user
**I want to** see my best performing habits
**So that** I know what's working

**Acceptance Criteria:**
- Ranked list by completion rate
- Shows top 5 habits
- Indicates improvement trends

---

## Epic 6: Reminders

### US-6.1: Enable Reminders
**As a** user
**I want to** enable push notifications
**So that** I don't forget my habits

**Acceptance Criteria:**
- Permission request on first enable
- Per-habit reminder toggle
- Works when app closed

### US-6.2: Set Reminder Time
**As a** user
**I want to** set when I'm reminded
**So that** reminders come at useful times

**Acceptance Criteria:**
- Time picker per habit
- Respects user timezone
- Can set different times per habit

### US-6.3: Daily Summary
**As a** user
**I want to** get a daily summary notification
**So that** I know what's left to do

**Acceptance Criteria:**
- Configurable summary time
- Shows incomplete habits count
- Links to today view

---

## Priority Order

### Must Have (P0)
- US-1.1 (Account)
- US-2.1, US-2.2, US-2.4 (Habit CRUD)
- US-3.1, US-3.2, US-3.3 (Daily tracking)
- US-4.1 (Current streak)

### Should Have (P1)
- US-2.3, US-2.5 (Archive, reorder)
- US-3.4, US-3.5 (Past days, notes)
- US-4.2, US-4.3 (Longest streak, freeze)
- US-5.1, US-5.2 (Stats, heatmap)

### Nice to Have (P2)
- US-1.2 (Profile settings)
- US-4.4 (Milestones)
- US-5.3, US-5.4 (Detailed stats)
- US-6.1, US-6.2, US-6.3 (Reminders)


