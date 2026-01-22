# Technical Notes: EventHub

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **QR Generation**: qrcode.react
- **QR Scanning**: html5-qrcode
- **Calendar**: ics (iCalendar generation)
- **Maps**: @react-google-maps/api or Mapbox
- **Rich Text**: Tiptap

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (images)
- **Payments**: Stripe
- **Email**: Resend

### Deployment
- **Hosting**: Vercel
- **Edge**: Check-in API at edge for speed

## Key Technical Decisions

### 1. Confirmation Code Generation

Short, unique, URL-safe codes:

```typescript
import { customAlphabet } from 'nanoid';

// Uppercase alphanumeric, 6 chars
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

async function createRegistration(data: RegistrationData) {
  let code: string;
  let attempts = 0;
  
  // Ensure uniqueness
  do {
    code = generateCode();
    const { data: existing } = await supabase
      .from('registrations')
      .select('id')
      .eq('confirmation_code', code)
      .single();
    
    if (!existing) break;
    attempts++;
  } while (attempts < 10);
  
  return supabase.from('registrations').insert({
    ...data,
    confirmation_code: code,
  });
}
```

### 2. QR Code with Embedded Data

```typescript
import QRCode from 'qrcode.react';

interface TicketQRProps {
  confirmationCode: string;
  eventSlug: string;
}

function TicketQR({ confirmationCode, eventSlug }: TicketQRProps) {
  // URL for check-in
  const value = `${process.env.NEXT_PUBLIC_URL}/e/${eventSlug}/checkin?c=${confirmationCode}`;
  
  return (
    <div className="p-4 bg-white rounded-lg">
      <QRCode
        value={value}
        size={200}
        level="M"
        includeMargin
      />
      <p className="mt-2 text-center font-mono text-lg">
        {confirmationCode}
      </p>
    </div>
  );
}
```

### 3. QR Scanner Component

```typescript
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
}

function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isScanning) return;

    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader',
      {
        qrbox: { width: 250, height: 250 },
        fps: 10,
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Parse URL to extract code
        try {
          const url = new URL(decodedText);
          const code = url.searchParams.get('c');
          if (code) {
            onScan(code);
            // Pause scanning briefly to prevent duplicates
            setIsScanning(false);
            setTimeout(() => setIsScanning(true), 2000);
          }
        } catch {
          // Not a URL, might be raw code
          onScan(decodedText);
        }
      },
      (error) => {
        // Only report actual errors, not "no QR found"
        if (!error.includes('No QR code found')) {
          onError?.(error);
        }
      }
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, [isScanning, onScan, onError]);

  return <div id="qr-reader" className="w-full max-w-md mx-auto" />;
}
```

### 4. Calendar Invite Generation

```typescript
import { createEvent, EventAttributes } from 'ics';
import { formatISO } from 'date-fns';

async function generateICS(event: Event): Promise<string> {
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const icsEvent: EventAttributes = {
    start: [
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      startDate.getDate(),
      startDate.getHours(),
      startDate.getMinutes(),
    ],
    end: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      endDate.getHours(),
      endDate.getMinutes(),
    ],
    title: event.title,
    description: event.description?.replace(/<[^>]*>/g, ''), // Strip HTML
    location: event.venue_address || event.virtual_url || '',
    url: `${process.env.NEXT_PUBLIC_URL}/events/${event.slug}`,
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: {
      name: event.organizer?.name || 'Event Organizer',
      email: event.organizer?.email || 'events@example.com',
    },
  };

  const { value, error } = createEvent(icsEvent);
  
  if (error) throw error;
  return value!;
}

// API Route: /api/events/[slug]/calendar
export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);
  const icsContent = await generateICS(event);
  
  return new Response(icsContent, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="${event.slug}.ics"`,
    },
  });
}
```

### 5. Check-in API

Fast check-in endpoint:

```typescript
// /api/events/[eventId]/checkin
export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  const { code } = await request.json();
  
  // Find registration
  const { data: registration, error } = await supabase
    .from('registrations')
    .select('id, name, email, checked_in, checked_in_at, ticket_types(name)')
    .eq('event_id', params.eventId)
    .eq('confirmation_code', code)
    .single();
  
  if (error || !registration) {
    return Response.json({ error: 'Registration not found' }, { status: 404 });
  }
  
  if (registration.checked_in) {
    return Response.json({
      warning: 'Already checked in',
      checkedInAt: registration.checked_in_at,
      registration,
    });
  }
  
  // Check in
  const { error: updateError } = await supabase
    .from('registrations')
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq('id', registration.id);
  
  if (updateError) {
    return Response.json({ error: 'Check-in failed' }, { status: 500 });
  }
  
  // Update event check-in count
  await supabase.rpc('increment_checkin_count', { event_id: params.eventId });
  
  return Response.json({
    success: true,
    registration: {
      ...registration,
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    },
  });
}
```

### 6. Stripe Integration

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function createCheckoutSession(
  event: Event,
  ticketType: TicketType,
  attendeeEmail: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: attendeeEmail,
    line_items: [
      {
        price_data: {
          currency: ticketType.currency.toLowerCase(),
          product_data: {
            name: `${event.title} - ${ticketType.name}`,
            description: ticketType.description || undefined,
          },
          unit_amount: Math.round(ticketType.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/events/${event.slug}/register/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/events/${event.slug}`,
    metadata: {
      event_id: event.id,
      ticket_type_id: ticketType.id,
    },
  });

  return session;
}
```

### 7. Email Confirmation

```typescript
import { Resend } from 'resend';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendConfirmationEmail(
  registration: Registration,
  event: Event
) {
  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(
    `${process.env.NEXT_PUBLIC_URL}/e/${event.slug}/checkin?c=${registration.confirmation_code}`,
    { width: 200 }
  );
  
  await resend.emails.send({
    from: 'EventHub <events@yourdomain.com>',
    to: registration.email,
    subject: `You're registered for ${event.title}!`,
    html: `
      <h1>You're registered! 🎉</h1>
      <h2>${event.title}</h2>
      <p><strong>Date:</strong> ${formatEventDate(event)}</p>
      <p><strong>Location:</strong> ${event.venue_name || 'Online'}</p>
      <p><strong>Confirmation Code:</strong> ${registration.confirmation_code}</p>
      
      <h3>Your Ticket</h3>
      <p>Show this QR code at check-in:</p>
      <img src="${qrDataUrl}" alt="QR Code" />
      
      <p>
        <a href="${process.env.NEXT_PUBLIC_URL}/api/events/${event.slug}/calendar">
          Add to Calendar
        </a>
      </p>
      
      <p>See you there!</p>
    `,
  });
}
```

## API Endpoints

```
# Auth
POST   /api/auth/signup
POST   /api/auth/login

# Events (Organizer)
GET    /api/events                    - My events
POST   /api/events                    - Create event
GET    /api/events/[id]               - Get event
PATCH  /api/events/[id]               - Update event
DELETE /api/events/[id]               - Delete event
POST   /api/events/[id]/publish       - Publish event

# Ticket Types
GET    /api/events/[id]/tickets       - Get ticket types
POST   /api/events/[id]/tickets       - Create ticket type
PATCH  /api/tickets/[id]              - Update ticket type
DELETE /api/tickets/[id]              - Delete ticket type

# Public Event
GET    /api/events/slug/[slug]        - Get event by slug
GET    /api/events/[slug]/calendar    - Download .ics

# Registration
POST   /api/events/[id]/register      - Register for event
POST   /api/events/[id]/checkout      - Create Stripe session
GET    /api/registrations/[code]      - Get registration by code

# Attendees (Organizer)
GET    /api/events/[id]/attendees     - List attendees
GET    /api/events/[id]/attendees/export - Export CSV
PATCH  /api/registrations/[id]        - Update registration
DELETE /api/registrations/[id]        - Cancel registration

# Check-in
POST   /api/events/[id]/checkin       - Check in attendee
GET    /api/events/[id]/checkin/stats - Get check-in stats
```

## Database Indexes

```sql
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_ticket_types_event ON ticket_types(event_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_code ON registrations(confirmation_code);
CREATE INDEX idx_registrations_email ON registrations(email);
```

## Testing Strategy

1. **Unit Tests**: Code generation, date formatting
2. **Integration Tests**: Registration flow, check-in
3. **E2E Tests**: Create event → Register → Check-in

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 45 min |
| Database schema + RLS | 45 min |
| Event creation form | 90 min |
| Ticket type management | 60 min |
| Public event page | 90 min |
| Registration flow | 90 min |
| Confirmation + email | 60 min |
| Attendee list | 45 min |
| Check-in (QR + manual) | 90 min |
| Calendar generation | 30 min |
| Polish + testing | 60 min |
| **Total** | **~12-14 hours** |


