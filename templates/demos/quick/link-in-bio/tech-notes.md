# Technical Notes: LinkHub

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Drag & Drop**: @dnd-kit/core
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (avatars)
- **Analytics**: Custom (Supabase) or PostHog

### Deployment
- **Hosting**: Vercel
- **Domain**: Vercel (or custom)

## Key Technical Decisions

### 1. Username as URL Slug
The username doubles as the public URL path. This requires:
- Unique constraint in database
- Reserved words list (admin, api, settings, etc.)
- Validation: lowercase, alphanumeric, hyphens only
- Length: 3-30 characters

```typescript
const RESERVED_USERNAMES = [
  'admin', 'api', 'settings', 'dashboard', 'login', 
  'signup', 'auth', 'profile', 'analytics', 'help'
];

const usernameSchema = z.string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9-]+$/)
  .refine(val => !RESERVED_USERNAMES.includes(val));
```

### 2. Click Tracking Strategy
Two options:

**Option A: Redirect Through API (simpler)**
```
User clicks → /api/click/[linkId] → Track → Redirect to URL
```
Pros: Simple, reliable
Cons: Adds latency, loses referrer

**Option B: Beacon API (recommended)**
```typescript
// On link click
navigator.sendBeacon('/api/track', JSON.stringify({
  linkId: link.id,
  profileId: profile.id,
  referrer: document.referrer
}));
// Then navigate normally
window.open(link.url, '_blank');
```
Pros: No latency, preserves referrer
Cons: Slightly less reliable

### 3. Theme System

Store theme as string identifier, apply via CSS variables:

```typescript
const themes = {
  minimal: {
    '--bg': '#ffffff',
    '--text': '#000000',
    '--button-bg': '#f3f4f6',
    '--button-radius': '8px',
  },
  dark: {
    '--bg': '#1a1a1a',
    '--text': '#ffffff',
    '--button-bg': '#2a2a2a',
    '--button-radius': '8px',
  },
  // ...
};
```

Apply on public profile:
```tsx
<div style={themes[profile.theme]}>
  {/* Profile content */}
</div>
```

### 4. Drag and Drop Implementation

Use @dnd-kit for accessible drag-and-drop:

```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function LinkList({ links, onReorder }) {
  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={links} strategy={verticalListSortingStrategy}>
        {links.map(link => <SortableLink key={link.id} link={link} />)}
      </SortableContext>
    </DndContext>
  );
}
```

### 5. Image Upload

Use Supabase Storage with size limits:

```typescript
async function uploadAvatar(file: File, userId: string) {
  // Validate
  if (file.size > 2 * 1024 * 1024) throw new Error('Max 2MB');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Upload
  const path = `avatars/${userId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });
    
  return supabase.storage.from('avatars').getPublicUrl(path);
}
```

## API Endpoints

```
POST   /api/auth/signup      - Create account
POST   /api/auth/login       - Sign in
POST   /api/auth/logout      - Sign out

GET    /api/links            - Get user's links
POST   /api/links            - Create link
PATCH  /api/links/[id]       - Update link
DELETE /api/links/[id]       - Delete link
PATCH  /api/links/reorder    - Update link positions

GET    /api/profile          - Get user's profile
PATCH  /api/profile          - Update profile
POST   /api/profile/avatar   - Upload avatar

GET    /api/analytics        - Get analytics data
POST   /api/track            - Track view/click event

GET    /[username]           - Public profile page (SSR)
```

## Database Indexes

```sql
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_position ON links(user_id, position);
CREATE INDEX idx_analytics_profile_id ON analytics(profile_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
```

## Performance Considerations

1. **Public Profile Caching**: Use ISR (Incremental Static Regeneration) with 60-second revalidation
2. **Analytics Aggregation**: Pre-aggregate daily stats to avoid expensive queries
3. **Image Optimization**: Use Next.js Image component with Supabase URLs

## Security Considerations

1. **URL Validation**: Validate all URLs to prevent javascript: or data: schemes
2. **Rate Limiting**: Limit track endpoint to prevent analytics spam
3. **RLS Policies**: Ensure users can only modify their own data

```sql
-- Example RLS policy
CREATE POLICY "Users can only update own links"
ON links FOR UPDATE
USING (auth.uid() = user_id);
```

## Testing Strategy

1. **Unit Tests**: Username validation, URL validation
2. **Integration Tests**: Link CRUD operations
3. **E2E Tests**: Full signup → add link → view public profile flow

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 30 min |
| Database schema + RLS | 20 min |
| Dashboard UI | 40 min |
| Link CRUD | 30 min |
| Drag-and-drop | 20 min |
| Profile customization | 30 min |
| Public profile page | 30 min |
| Click tracking | 20 min |
| Analytics display | 20 min |
| **Total** | **~4 hours** |


