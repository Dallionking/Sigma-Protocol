# Technical Notes: JobHub

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Rich Text**: Tiptap or React-Quill
- **Forms**: React Hook Form + Zod
- **Search UI**: InstantSearch (if using Algolia)

### Backend
- **Auth**: Supabase Auth with custom claims
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (logos, resumes)
- **Search**: Supabase full-text search or Algolia

### Deployment
- **Hosting**: Vercel
- **CDN**: Vercel Edge

## Key Technical Decisions

### 1. Role-Based Authentication

Use Supabase custom claims for roles:

```typescript
// On signup, set role in profiles table
async function createProfile(userId: string, role: 'seeker' | 'employer') {
  await supabase.from('profiles').insert({
    id: userId,
    role,
    email: user.email,
  });
}

// Middleware to check role
export function withRole(allowedRoles: string[]) {
  return async (req: Request) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!allowedRoles.includes(profile?.role)) {
      return NextResponse.redirect('/unauthorized');
    }
  };
}
```

### 2. Full-Text Search with Supabase

```typescript
// Search function
async function searchJobs(query: string, filters: JobFilters) {
  let queryBuilder = supabase
    .from('jobs')
    .select(`
      *,
      companies(name, logo_url, slug)
    `)
    .eq('status', 'active');

  // Full-text search
  if (query) {
    queryBuilder = queryBuilder.textSearch('search_vector', query, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Apply filters
  if (filters.category) {
    queryBuilder = queryBuilder.eq('category', filters.category);
  }
  if (filters.locationType) {
    queryBuilder = queryBuilder.eq('location_type', filters.locationType);
  }
  if (filters.experienceLevel) {
    queryBuilder = queryBuilder.eq('experience_level', filters.experienceLevel);
  }
  if (filters.salaryMin) {
    queryBuilder = queryBuilder.gte('salary_max', filters.salaryMin);
  }

  // Sorting
  switch (filters.sort) {
    case 'salary':
      queryBuilder = queryBuilder.order('salary_max', { ascending: false });
      break;
    case 'newest':
    default:
      queryBuilder = queryBuilder.order('published_at', { ascending: false });
  }

  // Pagination
  const { from, to } = getPagination(filters.page, filters.perPage);
  queryBuilder = queryBuilder.range(from, to);

  return queryBuilder;
}
```

### 3. SEO-Friendly Job URLs

Generate slugs and use dynamic routes:

```typescript
// Generate slug from title
function generateJobSlug(title: string, companySlug: string): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  return `${titleSlug}-at-${companySlug}`;
}

// Route: /jobs/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const job = await getJobBySlug(params.slug);
  
  return {
    title: `${job.title} at ${job.company.name} | JobHub`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: job.title,
      description: `${job.location_type} · ${job.type} · ${formatSalary(job)}`,
    },
  };
}
```

### 4. Application Flow

```typescript
// Apply to job
async function applyToJob(
  jobId: string,
  seekerId: string,
  data: ApplicationData
): Promise<Application> {
  // Check if already applied
  const { data: existing } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('seeker_id', seekerId)
    .single();

  if (existing) {
    throw new Error('Already applied to this job');
  }

  // Upload resume if provided
  let resumeUrl = data.resume_url;
  if (data.resumeFile) {
    const path = `resumes/${seekerId}/${jobId}.pdf`;
    await supabase.storage.from('resumes').upload(path, data.resumeFile);
    resumeUrl = supabase.storage.from('resumes').getPublicUrl(path).data.publicUrl;
  }

  // Create application
  const { data: application, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      seeker_id: seekerId,
      cover_letter: data.coverLetter,
      resume_url: resumeUrl,
    })
    .select()
    .single();

  // Optionally notify employer
  // await sendApplicationNotification(application);

  return application;
}
```

### 5. Job Filtering with URL State

Keep filters in URL for shareability:

```typescript
// Custom hook for filter state
function useJobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters: JobFilters = {
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    locationType: searchParams.get('location') || '',
    experienceLevel: searchParams.get('exp') || '',
    salaryMin: searchParams.get('salary') ? parseInt(searchParams.get('salary')!) : undefined,
    sort: searchParams.get('sort') as SortOption || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const setFilters = (newFilters: Partial<JobFilters>) => {
    const params = new URLSearchParams();
    
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });

    router.push(`/jobs?${params.toString()}`);
  };

  return { filters, setFilters };
}
```

### 6. Resume Storage Security

Secure resume access with signed URLs:

```typescript
// Get signed URL for resume (employer only)
async function getResumeUrl(
  applicationId: string,
  employerId: string
): Promise<string> {
  // Verify employer owns the job
  const { data: app } = await supabase
    .from('applications')
    .select(`
      resume_url,
      jobs!inner(company_id)
    `)
    .eq('id', applicationId)
    .single();

  const { data: company } = await supabase
    .from('companies')
    .select('user_id')
    .eq('id', app.jobs.company_id)
    .single();

  if (company.user_id !== employerId) {
    throw new Error('Unauthorized');
  }

  // Return signed URL (expires in 1 hour)
  const path = app.resume_url.split('/').pop();
  const { data } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, 3600);

  return data.signedUrl;
}
```

## API Endpoints

```
# Auth
POST   /api/auth/signup          - Register (with role)
POST   /api/auth/login           - Sign in

# Companies
GET    /api/companies/[slug]     - Get company
POST   /api/companies            - Create company (employer)
PATCH  /api/companies/[id]       - Update company

# Jobs
GET    /api/jobs                 - List jobs (with filters)
GET    /api/jobs/[slug]          - Get job details
POST   /api/jobs                 - Create job (employer)
PATCH  /api/jobs/[id]            - Update job
DELETE /api/jobs/[id]            - Delete job

# Applications
POST   /api/jobs/[id]/apply      - Apply to job (seeker)
GET    /api/applications         - My applications (seeker)
GET    /api/jobs/[id]/applicants - Job applicants (employer)
PATCH  /api/applications/[id]    - Update status (employer)

# Saved Jobs
POST   /api/saved-jobs           - Save job
DELETE /api/saved-jobs/[jobId]   - Unsave job
GET    /api/saved-jobs           - Get saved jobs

# Seeker Profile
GET    /api/profile              - Get profile
PATCH  /api/profile              - Update profile
POST   /api/profile/resume       - Upload resume

# Categories
GET    /api/categories           - List categories
```

## Database Indexes

```sql
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_published ON jobs(published_at DESC);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_location_type ON jobs(location_type);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_seeker ON applications(seeker_id);
CREATE INDEX idx_saved_jobs_seeker ON saved_jobs(seeker_id);
```

## Testing Strategy

1. **Unit Tests**: Search query building, slug generation
2. **Integration Tests**: Job CRUD, application flow
3. **E2E Tests**: Post job → apply → manage pipeline

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 60 min |
| Database schema + RLS | 45 min |
| Company management | 45 min |
| Job posting form | 90 min |
| Job listing + search | 90 min |
| Job detail page | 45 min |
| Application flow | 60 min |
| Employer dashboard | 60 min |
| Applicant management | 60 min |
| Polish + SEO | 60 min |
| **Total** | **~11 hours** |


