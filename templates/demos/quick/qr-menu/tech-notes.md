# Technical Notes: MenuScan

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **QR Generation**: qrcode.react
- **Image Upload**: React Dropzone + browser-image-compression
- **Drag & Drop**: @dnd-kit/core

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (images)
- **Image Optimization**: Supabase Image Transform or Sharp

### Deployment
- **Hosting**: Vercel
- **CDN**: Vercel Edge for menu pages

## Key Technical Decisions

### 1. Restaurant Slug Generation

Auto-generate from restaurant name, ensure uniqueness:

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}
```

### 2. Image Handling Strategy

Compress and resize on client before upload:

```typescript
import imageCompression from 'browser-image-compression';

async function prepareImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  };
  return await imageCompression(file, options);
}
```

Store in Supabase with folder structure:
```
menu-images/
  └── [restaurant_id]/
      └── [item_id].webp
```

### 3. Menu Page Performance

Use ISR for public menu pages:

```typescript
// app/[slug]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds

export async function generateStaticParams() {
  const restaurants = await getActiveRestaurants();
  return restaurants.map(r => ({ slug: r.slug }));
}
```

Consider PWA for offline menu viewing:
```json
// public/manifest.json
{
  "name": "MenuScan",
  "short_name": "Menu",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff"
}
```

### 4. QR Code Generation

Using qrcode.react:

```tsx
import { QRCodeSVG } from 'qrcode.react';

function MenuQRCode({ restaurantSlug, logoUrl }) {
  const menuUrl = `${process.env.NEXT_PUBLIC_URL}/${restaurantSlug}`;
  
  return (
    <QRCodeSVG
      value={menuUrl}
      size={256}
      level="M"
      imageSettings={logoUrl ? {
        src: logoUrl,
        height: 50,
        width: 50,
        excavate: true,
      } : undefined}
    />
  );
}
```

Download as PNG:

```typescript
function downloadQRCode() {
  const svg = document.querySelector('#qr-code svg');
  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = () => {
    canvas.width = 1024;
    canvas.height = 1024;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.drawImage(img, 0, 0, 1024, 1024);
    
    const link = document.createElement('a');
    link.download = 'menu-qr-code.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}
```

### 5. Menu Data Structure

Organize for efficient querying:

```typescript
// Types
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  position: number;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isNew: boolean;
  dietaryTags: DietaryTag[];
  spicyLevel: 0 | 1 | 2 | 3;
  position: number;
}

type DietaryTag = 'vegan' | 'vegetarian' | 'gluten_free';
```

### 6. Currency Formatting

```typescript
function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

## API Endpoints

```
POST   /api/auth/signup           - Create restaurant account
POST   /api/auth/login            - Sign in

GET    /api/restaurant            - Get restaurant details
PATCH  /api/restaurant            - Update restaurant
POST   /api/restaurant/logo       - Upload logo

GET    /api/categories            - Get all categories with items
POST   /api/categories            - Create category
PATCH  /api/categories/[id]       - Update category
DELETE /api/categories/[id]       - Delete category
PATCH  /api/categories/reorder    - Reorder categories

POST   /api/items                 - Create menu item
PATCH  /api/items/[id]            - Update item
DELETE /api/items/[id]            - Delete item
PATCH  /api/items/reorder         - Reorder items
POST   /api/items/[id]/image      - Upload item image

GET    /[slug]                    - Public menu page (SSR/ISR)
```

## Database Indexes

```sql
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX idx_categories_restaurant ON categories(restaurant_id);
CREATE INDEX idx_categories_position ON categories(restaurant_id, position);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_position ON items(category_id, position);
```

## Mobile-First CSS Approach

Menu page should prioritize mobile:

```css
/* Menu item card */
.menu-item {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 12px;
  padding: 12px;
}

/* On larger screens */
@media (min-width: 640px) {
  .menu-item {
    grid-template-columns: 120px 1fr;
  }
}
```

## Testing Strategy

1. **Unit Tests**: Price formatting, slug generation
2. **Integration Tests**: Menu CRUD operations
3. **E2E Tests**: Full flow from signup to viewing menu
4. **Visual Tests**: Menu appearance on different devices

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 30 min |
| Database schema + RLS | 20 min |
| Restaurant dashboard | 30 min |
| Category CRUD | 30 min |
| Item CRUD | 40 min |
| Image upload | 20 min |
| Public menu page | 40 min |
| QR code generation | 20 min |
| Polish + testing | 30 min |
| **Total** | **~4 hours** |

## Common Pitfalls

1. **Large images**: Always compress before upload
2. **Slow menu loads**: Use ISR and image optimization
3. **QR too small**: Ensure minimum 2cm print size
4. **Broken slugs**: Validate and sanitize restaurant names


