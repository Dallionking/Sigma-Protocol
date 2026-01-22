# Technical Notes: LaunchList

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Framer Motion
- **Charts**: Recharts (admin dashboard)
- **Social Share**: react-share

### Backend
- **Database**: Supabase (PostgreSQL)
- **Email**: Resend
- **Spam Protection**: reCAPTCHA v3
- **Analytics**: PostHog or Plausible

### Deployment
- **Hosting**: Vercel
- **Domain**: Custom or Vercel subdomain

## Key Technical Decisions

### 1. Referral Code Generation

Short, unique, URL-safe codes:

```typescript
import { customAlphabet } from 'nanoid';

// Alphanumeric, no confusing chars (0/O, 1/l)
const nanoid = customAlphabet('23456789abcdefghjkmnpqrstuvwxyz', 6);

function generateReferralCode(): string {
  return nanoid(); // e.g., "x7k9m2"
}
```

### 2. Referral Tracking

Store referral code in cookie/localStorage when user lands:

```typescript
// On page load
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  if (refCode) {
    localStorage.setItem('referral_code', refCode);
    // Also track in analytics
    track('referral_link_clicked', { code: refCode });
  }
}, []);

// On signup
async function handleSignup(email: string) {
  const referralCode = localStorage.getItem('referral_code');
  
  const { data } = await supabase
    .from('signups')
    .insert({
      email,
      referral_code: generateReferralCode(),
      referred_by: referralCode ? await getReferrerId(referralCode) : null,
    })
    .select()
    .single();
    
  // If referred, increment referrer's count
  if (referralCode) {
    await supabase.rpc('increment_referral_count', { code: referralCode });
  }
  
  return data;
}
```

### 3. Position Calculation

Use database sequence for accurate positioning:

```sql
-- On signup, position = count of existing signups + 1
CREATE OR REPLACE FUNCTION get_next_position()
RETURNS integer AS $$
  SELECT COALESCE(MAX(position), 0) + 1 FROM signups;
$$ LANGUAGE SQL;
```

Or use a trigger:

```sql
CREATE OR REPLACE FUNCTION set_position()
RETURNS TRIGGER AS $$
BEGIN
  NEW.position := (SELECT COALESCE(MAX(position), 0) + 1 FROM signups);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_signup_position
BEFORE INSERT ON signups
FOR EACH ROW EXECUTE FUNCTION set_position();
```

### 4. Welcome Email with Resend

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(signup: Signup) {
  const referralUrl = `${process.env.NEXT_PUBLIC_URL}?ref=${signup.referral_code}`;
  
  await resend.emails.send({
    from: 'LaunchList <hello@yourdomain.com>',
    to: signup.email,
    subject: "You're on the waitlist! 🎉",
    html: `
      <h1>You're #${signup.position} on the list!</h1>
      <p>Share your link to move up:</p>
      <p><a href="${referralUrl}">${referralUrl}</a></p>
      <h2>Rewards:</h2>
      <ul>
        <li>3 referrals → Early access</li>
        <li>10 referrals → Founding member</li>
        <li>25 referrals → Free first month</li>
      </ul>
    `,
  });
}
```

### 5. reCAPTCHA v3 Integration

```typescript
// Frontend: Load script
<Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} />

// Get token on submit
async function handleSubmit(email: string) {
  const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'signup' });
  
  const response = await fetch('/api/signup', {
    method: 'POST',
    body: JSON.stringify({ email, recaptchaToken: token }),
  });
}

// Backend: Verify token
async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
  });
  
  const data = await response.json();
  return data.success && data.score >= 0.5;
}
```

### 6. Social Sharing

Pre-filled share text:

```tsx
import { TwitterShareButton, LinkedinShareButton } from 'react-share';

function ShareButtons({ referralUrl, position }) {
  const shareText = `I'm #${position} on the waitlist for [Product]! Join me:`;
  
  return (
    <div className="flex gap-2">
      <TwitterShareButton url={referralUrl} title={shareText}>
        <Button variant="outline">
          <TwitterIcon className="mr-2 h-4 w-4" />
          Tweet
        </Button>
      </TwitterShareButton>
      
      <LinkedinShareButton url={referralUrl}>
        <Button variant="outline">
          <LinkedinIcon className="mr-2 h-4 w-4" />
          Share
        </Button>
      </LinkedinShareButton>
      
      <Button variant="outline" onClick={() => copyToClipboard(referralUrl)}>
        <CopyIcon className="mr-2 h-4 w-4" />
        Copy Link
      </Button>
    </div>
  );
}
```

### 7. Admin Authentication

Simple password protection or Supabase Auth:

```typescript
// Simple approach: Environment variable password
// pages/admin/page.tsx
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  if (!authenticated) {
    return (
      <form onSubmit={() => {
        if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
          setAuthenticated(true);
        }
      }}>
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <Button type="submit">Login</Button>
      </form>
    );
  }
  
  return <AdminDashboard />;
}
```

## API Endpoints

```
POST   /api/signup           - Submit email to waitlist
GET    /api/signup/[code]    - Get signup by referral code
GET    /api/stats            - Get public stats (total count)

# Admin (protected)
GET    /api/admin/stats      - Detailed statistics
GET    /api/admin/signups    - List all signups
GET    /api/admin/export     - Export CSV
```

## Database Indexes

```sql
CREATE UNIQUE INDEX idx_signups_email ON signups(email);
CREATE UNIQUE INDEX idx_signups_referral_code ON signups(referral_code);
CREATE INDEX idx_signups_referred_by ON signups(referred_by);
CREATE INDEX idx_signups_created_at ON signups(created_at);
```

## Landing Page Performance

- Use Next.js Image component for optimized images
- Lazy load below-fold content
- Preload critical fonts
- Minimize JavaScript bundle

```tsx
// Critical CSS inline
<style jsx global>{`
  .hero-section {
    /* Critical styles */
  }
`}</style>

// Lazy load animations
const FeatureCards = dynamic(() => import('./FeatureCards'), {
  loading: () => <FeatureCardsSkeleton />,
  ssr: false,
});
```

## Analytics Events

```typescript
const events = {
  PAGE_VIEW: 'page_view',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  SIGNUP_ERROR: 'signup_error',
  REFERRAL_LINK_COPIED: 'referral_link_copied',
  REFERRAL_SHARED_TWITTER: 'referral_shared_twitter',
  REFERRAL_SHARED_LINKEDIN: 'referral_shared_linkedin',
  ADMIN_EXPORT: 'admin_export',
};

function track(event: string, properties?: Record<string, any>) {
  // PostHog, Plausible, or custom
  posthog.capture(event, properties);
}
```

## Testing Strategy

1. **Unit Tests**: Email validation, referral code generation
2. **Integration Tests**: Signup flow, referral attribution
3. **E2E Tests**: Full flow from landing to share

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup | 20 min |
| Landing page design | 45 min |
| Email capture form | 20 min |
| Database + API | 30 min |
| Referral system | 40 min |
| Thank you page | 30 min |
| Welcome email | 20 min |
| Admin dashboard | 45 min |
| Polish + testing | 30 min |
| **Total** | **~4.5 hours** |

## Common Pitfalls

1. **Email deliverability**: Verify domain with Resend, use proper FROM address
2. **Referral gaming**: Add IP-based rate limiting
3. **Position drift**: Use database constraints, not application logic
4. **Social preview**: Set OG meta tags for rich previews when sharing


