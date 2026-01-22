# Technical Notes: WriteStack

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Editor**: Tiptap (rich text)
- **Charts**: Recharts
- **Date**: date-fns

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Payments**: Stripe Connect
- **Email**: Resend (or SendGrid)

### Deployment
- **Hosting**: Vercel
- **Email Service**: Dedicated provider at scale

## Key Technical Decisions

### 1. Rich Text Editor with Tiptap

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

function PostEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="prose max-w-none">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

### 2. Image Upload

```typescript
async function uploadImage(file: File, publicationId: string) {
  const filename = `${publicationId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('post-images')
    .upload(filename, file, {
      cacheControl: '31536000',
      contentType: file.type,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}
```

### 3. Email Sending with Resend

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendPostEmail(
  post: Post,
  publication: Publication,
  subscribers: Subscriber[]
) {
  const html = renderEmailTemplate(post, publication);
  
  // Batch send (Resend supports up to 100 per call)
  const batches = chunk(subscribers, 100);
  
  for (const batch of batches) {
    await resend.batch.send(
      batch.map(subscriber => ({
        from: `${publication.name} <${publication.slug}@mail.yourdomain.com>`,
        to: subscriber.email,
        subject: post.title,
        html,
        headers: {
          'List-Unsubscribe': `<${unsubscribeUrl(subscriber.id)}>`,
        },
        tags: [
          { name: 'post_id', value: post.id },
          { name: 'subscriber_id', value: subscriber.id },
        ],
      }))
    );
  }

  // Record sends for tracking
  await supabase.from('email_sends').insert(
    subscribers.map(sub => ({
      post_id: post.id,
      subscriber_id: sub.id,
      sent_at: new Date(),
    }))
  );
}
```

### 4. Email Open/Click Tracking

```typescript
// Tracking pixel in email
function getTrackingPixel(emailSendId: string) {
  return `<img src="${process.env.NEXT_PUBLIC_URL}/api/track/open/${emailSendId}" width="1" height="1" />`;
}

// Wrap links for click tracking
function wrapLinksForTracking(html: string, emailSendId: string) {
  return html.replace(
    /<a href="([^"]+)"([^>]*)>/g,
    (match, url, attrs) => {
      const trackingUrl = `${process.env.NEXT_PUBLIC_URL}/api/track/click/${emailSendId}?url=${encodeURIComponent(url)}`;
      return `<a href="${trackingUrl}"${attrs}>`;
    }
  );
}

// API Route: /api/track/open/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
  await supabase
    .from('email_sends')
    .update({ opened_at: new Date() })
    .eq('id', params.id)
    .is('opened_at', null);

  // Return 1x1 transparent pixel
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );
  return new Response(pixel, {
    headers: { 'Content-Type': 'image/gif' },
  });
}
```

### 5. Stripe Connect for Creators

```typescript
// Create connected account
async function createStripeAccount(userId: string, email: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
  });

  await supabase
    .from('publications')
    .update({ stripe_account_id: account.id })
    .eq('user_id', userId);

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_URL}/settings/payments`,
    return_url: `${process.env.NEXT_PUBLIC_URL}/settings/payments/complete`,
    type: 'account_onboarding',
  });

  return accountLink.url;
}

// Create subscription checkout
async function createSubscriptionCheckout(
  publication: Publication,
  subscriberEmail: string,
  tier: 'monthly' | 'annual'
) {
  const priceId = tier === 'monthly' 
    ? publication.stripe_price_monthly 
    : publication.stripe_price_annual;

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: subscriberEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        application_fee_percent: 10, // Platform takes 10%
      },
      success_url: `${process.env.NEXT_PUBLIC_URL}/${publication.slug}?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/${publication.slug}`,
      metadata: {
        publication_id: publication.id,
        subscriber_email: subscriberEmail,
      },
    },
    { stripeAccount: publication.stripe_account_id }
  );

  return session;
}
```

### 6. Post Scheduling

```typescript
// Schedule post
async function schedulePost(postId: string, scheduledFor: Date) {
  await supabase
    .from('posts')
    .update({
      status: 'scheduled',
      scheduled_for: scheduledFor,
    })
    .eq('id', postId);
}

// Cron job to publish scheduled posts (run every minute)
// Using Supabase Edge Functions or Vercel Cron
export async function publishScheduledPosts() {
  const now = new Date();

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now.toISOString());

  for (const post of posts || []) {
    await supabase
      .from('posts')
      .update({
        status: 'published',
        published_at: now,
      })
      .eq('id', post.id);

    // Send emails
    await sendPostEmail(post);
  }
}
```

### 7. Paywall Logic

```typescript
// Check if reader can access post
function canAccessPost(
  post: Post,
  subscriber: Subscriber | null
): boolean {
  // Free posts accessible to all
  if (!post.is_premium) return true;
  
  // No subscriber = show paywall
  if (!subscriber) return false;
  
  // Paid subscriber = full access
  if (subscriber.is_paid) return true;
  
  // Free subscriber hitting premium = paywall
  return false;
}

// Post page component
function PostPage({ post, subscriber }) {
  const hasAccess = canAccessPost(post, subscriber);

  if (!hasAccess) {
    return (
      <div>
        <PostPreview post={post} />
        <Paywall publication={post.publication} />
      </div>
    );
  }

  return <FullPost post={post} />;
}
```

## API Endpoints

```
# Publications
GET    /api/publications/[slug]
POST   /api/publications
PATCH  /api/publications/[id]

# Posts
GET    /api/posts
POST   /api/posts
GET    /api/posts/[id]
PATCH  /api/posts/[id]
DELETE /api/posts/[id]
POST   /api/posts/[id]/publish
POST   /api/posts/[id]/schedule
POST   /api/posts/[id]/send-email

# Subscribers
GET    /api/subscribers
POST   /api/subscribers
DELETE /api/subscribers/[id]
GET    /api/subscribers/export

# Subscription
POST   /api/subscribe          # Free
POST   /api/checkout           # Paid
POST   /api/webhooks/stripe    # Stripe events

# Analytics
GET    /api/analytics/overview
GET    /api/analytics/emails
GET    /api/analytics/revenue

# Tracking (public)
GET    /api/track/open/[id]
GET    /api/track/click/[id]
POST   /api/unsubscribe
```

## Database Indexes

```sql
CREATE INDEX idx_posts_publication ON posts(publication_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published ON posts(published_at DESC);
CREATE INDEX idx_subscribers_publication ON subscribers(publication_id);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_email_sends_post ON email_sends(post_id);
CREATE INDEX idx_email_sends_subscriber ON email_sends(subscriber_id);
```

## Estimated Build Time

| Task | Time |
|------|------|
| Setup + Auth | 4 hrs |
| Publication setup | 4 hrs |
| Rich text editor | 8 hrs |
| Post management | 6 hrs |
| Email delivery | 8 hrs |
| Stripe integration | 8 hrs |
| Public pages | 6 hrs |
| Paywall logic | 2 hrs |
| Comments | 4 hrs |
| Analytics | 6 hrs |
| Polish + testing | 8 hrs |
| **Total** | **~64 hours** |


