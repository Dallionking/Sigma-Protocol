# User Stories: JobHub

## Epic 1: Authentication & Roles

### US-1.1: Employer Signup
**As an** employer
**I want to** create an employer account
**So that** I can post jobs

**Acceptance Criteria:**
- Sign up with email/password
- Select "I'm hiring" option
- Create company profile after signup
- Redirected to employer dashboard

### US-1.2: Job Seeker Signup
**As a** job seeker
**I want to** create a job seeker account
**So that** I can apply to jobs

**Acceptance Criteria:**
- Sign up with email/password
- Select "I'm looking for work" option
- Optionally create profile
- Can browse and apply to jobs

### US-1.3: Sign In
**As a** user
**I want to** sign into my account
**So that** I can access my dashboard

**Acceptance Criteria:**
- Sign in with email/password
- Redirected to role-appropriate dashboard
- Session persists

---

## Epic 2: Company Management

### US-2.1: Create Company Profile
**As an** employer
**I want to** create my company profile
**So that** job seekers know about us

**Acceptance Criteria:**
- Enter company name (required)
- Upload logo
- Add website URL
- Write company description
- Select company size
- Select industry
- Profile visible on job listings

### US-2.2: Edit Company Profile
**As an** employer
**I want to** update my company info
**So that** it stays current

**Acceptance Criteria:**
- Edit all company fields
- Replace logo
- Changes reflect on all jobs

---

## Epic 3: Job Posting

### US-3.1: Post New Job
**As an** employer
**I want to** post a job opening
**So that** I can find candidates

**Acceptance Criteria:**
- Enter job title (required)
- Select category
- Select job type (full-time, etc.)
- Select location type
- Enter location (if applicable)
- Set salary range (optional)
- Select experience level
- Write description (rich text)
- Add requirements list
- Add benefits list
- Choose apply method
- Submit job

### US-3.2: Preview Job
**As an** employer
**I want to** preview my job post
**So that** I can verify it looks good

**Acceptance Criteria:**
- Preview button available
- Shows job as seekers will see it
- Can go back and edit

### US-3.3: Edit Job
**As an** employer
**I want to** edit my posted job
**So that** I can update information

**Acceptance Criteria:**
- Edit available from dashboard
- All fields editable
- Changes save immediately

### US-3.4: Close Job
**As an** employer
**I want to** close a filled position
**So that** it stops receiving applications

**Acceptance Criteria:**
- Close button available
- Job removed from listings
- Existing applications preserved
- Can reopen if needed

### US-3.5: Delete Job
**As an** employer
**I want to** delete a job post
**So that** I can remove mistakes

**Acceptance Criteria:**
- Delete confirmation required
- Job removed completely
- Applications deleted

---

## Epic 4: Job Browsing

### US-4.1: View All Jobs
**As a** visitor
**I want to** see all job listings
**So that** I can find opportunities

**Acceptance Criteria:**
- Job cards displayed
- Pagination or infinite scroll
- Shows title, company, location, salary
- Mobile responsive

### US-4.2: Search Jobs
**As a** job seeker
**I want to** search for jobs
**So that** I can find relevant ones

**Acceptance Criteria:**
- Search input prominent
- Searches title, description, company
- Results update quickly
- Highlights matching terms

### US-4.3: Filter Jobs
**As a** job seeker
**I want to** filter job listings
**So that** I see only relevant jobs

**Acceptance Criteria:**
- Filter by category
- Filter by location type
- Filter by experience level
- Filter by salary range
- Multiple filters combine (AND)
- Clear all filters option

### US-4.4: Sort Jobs
**As a** job seeker
**I want to** sort job listings
**So that** I see preferred jobs first

**Acceptance Criteria:**
- Sort by newest (default)
- Sort by highest salary
- Sort by relevance (with search)

### US-4.5: View Job Details
**As a** job seeker
**I want to** see full job details
**So that** I can decide to apply

**Acceptance Criteria:**
- Full description displayed
- Requirements listed
- Benefits listed
- Company info shown
- Apply button prominent

---

## Epic 5: Applications

### US-5.1: Apply to Job
**As a** job seeker
**I want to** apply for a job
**So that** I can be considered

**Acceptance Criteria:**
- Apply button on job page
- Upload resume (or use profile)
- Add cover letter (optional)
- Submit application
- Confirmation shown

### US-5.2: Track Applications
**As a** job seeker
**I want to** see my applications
**So that** I know where I've applied

**Acceptance Criteria:**
- List of applications
- Shows job, company, date
- Shows status (pending, reviewed, etc.)
- Link to job details

### US-5.3: Save Job
**As a** job seeker
**I want to** save interesting jobs
**So that** I can apply later

**Acceptance Criteria:**
- Save button on listings
- Save button on detail page
- Saved jobs accessible in dashboard
- Can unsave jobs

---

## Epic 6: Applicant Management

### US-6.1: View Applicants
**As an** employer
**I want to** see who applied
**So that** I can review candidates

**Acceptance Criteria:**
- Applicant list per job
- Shows name, date applied
- Shows current status
- Sortable by date/status

### US-6.2: View Application
**As an** employer
**I want to** see application details
**So that** I can evaluate the candidate

**Acceptance Criteria:**
- View cover letter
- Download resume
- See applicant profile
- See LinkedIn if provided

### US-6.3: Update Application Status
**As an** employer
**I want to** update applicant status
**So that** I can track my pipeline

**Acceptance Criteria:**
- Status dropdown available
- Options: pending, reviewed, interviewed, rejected, hired
- Status saves immediately
- Optional: notify applicant

### US-6.4: Add Applicant Notes
**As an** employer
**I want to** add notes to applicants
**So that** I remember evaluation details

**Acceptance Criteria:**
- Notes field available
- Notes saved per applicant
- Only visible to employer

---

## Epic 7: Job Seeker Profile

### US-7.1: Create Profile
**As a** job seeker
**I want to** create my profile
**So that** I can apply quickly

**Acceptance Criteria:**
- Enter full name
- Add headline/title
- Write bio
- Upload resume
- Add LinkedIn URL
- Add portfolio URL

### US-7.2: Edit Profile
**As a** job seeker
**I want to** update my profile
**So that** it stays current

**Acceptance Criteria:**
- Edit all profile fields
- Replace resume
- Changes save immediately

---

## Epic 8: Employer Dashboard

### US-8.1: View Dashboard
**As an** employer
**I want to** see my hiring overview
**So that** I know my status

**Acceptance Criteria:**
- Active jobs count
- Total applications count
- Pending review count
- Recent applications list

### US-8.2: View Job Analytics
**As an** employer
**I want to** see job performance
**So that** I know how it's doing

**Acceptance Criteria:**
- Views count per job
- Applications count per job
- Conversion rate

---

## Priority Order

### Must Have (P0)
- US-1.1, US-1.2, US-1.3 (Auth)
- US-2.1 (Company profile)
- US-3.1 (Post job)
- US-4.1, US-4.5 (View jobs)
- US-5.1 (Apply)

### Should Have (P1)
- US-3.2, US-3.3, US-3.4 (Job management)
- US-4.2, US-4.3, US-4.4 (Search, filter, sort)
- US-5.2, US-5.3 (Track, save)
- US-6.1, US-6.2, US-6.3 (Applicant management)

### Nice to Have (P2)
- US-2.2 (Edit company)
- US-3.5 (Delete job)
- US-6.4 (Notes)
- US-7.1, US-7.2 (Seeker profile)
- US-8.1, US-8.2 (Dashboard, analytics)


