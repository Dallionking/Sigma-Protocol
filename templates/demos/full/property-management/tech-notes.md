# Technical Notes: HostHub

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **iCal**: node-ical, ical-generator

### Deployment
- **Hosting**: Vercel
- **Cron**: Vercel Cron or Supabase Edge

## Key Technical Decisions

### 1. Multi-Property Calendar with FullCalendar

```typescript
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';

function MultiPropertyCalendar({ properties, bookings, blockedDates }) {
  const resources = properties.map(p => ({
    id: p.id,
    title: p.name,
  }));

  const events = [
    ...bookings.map(b => ({
      id: b.id,
      resourceId: b.property_id,
      title: b.guest?.name || 'Reserved',
      start: b.check_in,
      end: b.check_out,
      backgroundColor: getStatusColor(b.status),
      extendedProps: { type: 'booking', booking: b },
    })),
    ...blockedDates.map(bd => ({
      id: `blocked-${bd.id}`,
      resourceId: bd.property_id,
      title: bd.reason || 'Blocked',
      start: bd.start_date,
      end: bd.end_date,
      backgroundColor: '#9ca3af',
      extendedProps: { type: 'blocked', blocked: bd },
    })),
  ];

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin, resourceTimelinePlugin]}
      initialView="resourceTimelineMonth"
      resources={resources}
      events={events}
      selectable={true}
      select={handleDateSelect}
      eventClick={handleEventClick}
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay,resourceTimelineWeek,resourceTimelineMonth',
      }}
    />
  );
}
```

### 2. Booking Conflict Detection

```typescript
async function checkAvailability(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string
): Promise<boolean> {
  // Check existing bookings
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('property_id', propertyId)
    .neq('status', 'cancelled')
    .or(`check_in.lte.${checkOut.toISOString()},check_out.gte.${checkIn.toISOString()}`);

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { data: conflictingBookings } = await query;
  if (conflictingBookings?.length > 0) return false;

  // Check blocked dates
  const { data: blockedDates } = await supabase
    .from('blocked_dates')
    .select('id')
    .eq('property_id', propertyId)
    .or(`start_date.lte.${checkOut.toISOString()},end_date.gte.${checkIn.toISOString()}`);

  return blockedDates?.length === 0;
}
```

### 3. iCal Import/Export

```typescript
import ical, { VEvent } from 'node-ical';
import { createEvents, EventAttributes } from 'ics';

// Import from external calendar
async function importICalFeed(propertyId: string, icalUrl: string) {
  const events = await ical.async.fromURL(icalUrl);
  const importedBookings = [];

  for (const [uid, event] of Object.entries(events)) {
    if (event.type !== 'VEVENT') continue;
    
    const vevent = event as VEvent;
    
    // Skip if already imported
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('property_id', propertyId)
      .eq('external_id', uid)
      .single();

    if (existing) continue;

    const booking = await supabase
      .from('bookings')
      .insert({
        property_id: propertyId,
        check_in: vevent.start,
        check_out: vevent.end,
        source: 'ical',
        external_id: uid,
        status: 'confirmed',
        guest_notes: vevent.summary || 'Reserved',
      })
      .select()
      .single();

    importedBookings.push(booking.data);
  }

  return importedBookings;
}

// Export calendar feed
async function generateICalFeed(propertyId: string): Promise<string> {
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .neq('status', 'cancelled');

  const events: EventAttributes[] = bookings.map(booking => ({
    uid: `${booking.id}@hosthub.app`,
    start: dateToArray(new Date(booking.check_in)),
    end: dateToArray(new Date(booking.check_out)),
    title: 'Reserved',
    status: 'CONFIRMED',
  }));

  const { value } = createEvents(events);
  return value || '';
}

// API endpoint for iCal feed
// GET /api/properties/[id]/calendar.ics
export async function GET(req: Request, { params }) {
  const icalContent = await generateICalFeed(params.id);
  
  return new Response(icalContent, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${params.id}.ics"`,
    },
  });
}
```

### 4. Photo Upload with Ordering

```typescript
interface PropertyPhoto {
  id: string;
  url: string;
  position: number;
}

async function uploadPropertyPhoto(
  propertyId: string,
  file: File
): Promise<PropertyPhoto> {
  // Get current max position
  const { data: photos } = await supabase
    .from('property_photos')
    .select('position')
    .eq('property_id', propertyId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = (photos?.[0]?.position ?? -1) + 1;

  // Upload file
  const filename = `${propertyId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('property-photos')
    .upload(filename, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('property-photos')
    .getPublicUrl(filename);

  // Save to database
  const { data: photo } = await supabase
    .from('property_photos')
    .insert({
      property_id: propertyId,
      url: urlData.publicUrl,
      position: nextPosition,
    })
    .select()
    .single();

  return photo;
}

async function reorderPhotos(
  propertyId: string,
  photoIds: string[]
): Promise<void> {
  const updates = photoIds.map((id, index) => ({
    id,
    position: index,
  }));

  for (const update of updates) {
    await supabase
      .from('property_photos')
      .update({ position: update.position })
      .eq('id', update.id);
  }
}
```

### 5. Financial Calculations

```typescript
interface PropertyFinancials {
  revenue: number;
  expenses: number;
  profit: number;
  occupancyRate: number;
  averageDailyRate: number;
}

async function calculatePropertyFinancials(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<PropertyFinancials> {
  // Get bookings in period
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', propertyId)
    .gte('check_in', startDate.toISOString())
    .lte('check_out', endDate.toISOString())
    .eq('status', 'completed');

  // Calculate revenue
  const revenue = bookings?.reduce((sum, b) => sum + (b.payout_amount || b.total || 0), 0) || 0;

  // Get expenses in period
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('property_id', propertyId)
    .gte('date', startDate.toISOString())
    .lte('date', endDate.toISOString());

  const totalExpenses = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;

  // Calculate occupancy
  const totalDays = differenceInDays(endDate, startDate);
  const bookedDays = bookings?.reduce((sum, b) => {
    const nights = differenceInDays(new Date(b.check_out), new Date(b.check_in));
    return sum + nights;
  }, 0) || 0;

  const occupancyRate = totalDays > 0 ? (bookedDays / totalDays) * 100 : 0;

  // Calculate ADR
  const averageDailyRate = bookedDays > 0 ? revenue / bookedDays : 0;

  return {
    revenue,
    expenses: totalExpenses,
    profit: revenue - totalExpenses,
    occupancyRate: Math.round(occupancyRate),
    averageDailyRate: Math.round(averageDailyRate * 100) / 100,
  };
}
```

### 6. Automated Messaging

```typescript
// Cron job to send scheduled messages
async function processScheduledMessages() {
  const now = new Date();

  // Get bookings with upcoming check-ins (for check-in messages)
  const { data: upcomingCheckins } = await supabase
    .from('bookings')
    .select(`
      *,
      property:properties(*),
      guest:guests(*)
    `)
    .eq('status', 'confirmed')
    .gte('check_in', now.toISOString())
    .lte('check_in', addHours(now, 24).toISOString());

  for (const booking of upcomingCheckins || []) {
    // Get applicable templates
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .eq('user_id', booking.property.user_id)
      .eq('trigger_type', 'check_in_day')
      .eq('is_active', true);

    for (const template of templates || []) {
      // Check if already sent
      const { data: existing } = await supabase
        .from('messages')
        .select('id')
        .eq('booking_id', booking.id)
        .eq('is_automated', true)
        .ilike('content', `%${template.name}%`);

      if (existing?.length > 0) continue;

      // Send message
      const content = processTemplate(template.content, booking);
      
      await supabase.from('messages').insert({
        booking_id: booking.id,
        sender_type: 'host',
        content,
        is_automated: true,
      });

      // Send email to guest
      if (booking.guest?.email) {
        await sendGuestEmail(booking.guest.email, template.subject, content);
      }
    }
  }
}

function processTemplate(template: string, booking: any): string {
  return template
    .replace(/\{\{guest_name\}\}/g, booking.guest?.name || 'Guest')
    .replace(/\{\{property_name\}\}/g, booking.property?.name || '')
    .replace(/\{\{check_in_date\}\}/g, format(new Date(booking.check_in), 'MMMM d, yyyy'))
    .replace(/\{\{check_in_time\}\}/g, booking.property?.checkin_time || '3:00 PM')
    .replace(/\{\{checkout_date\}\}/g, format(new Date(booking.check_out), 'MMMM d, yyyy'))
    .replace(/\{\{checkout_time\}\}/g, booking.property?.checkout_time || '11:00 AM');
}
```

## API Endpoints

```
# Properties
GET    /api/properties
POST   /api/properties
GET    /api/properties/[id]
PATCH  /api/properties/[id]
DELETE /api/properties/[id]
POST   /api/properties/[id]/photos
PATCH  /api/properties/[id]/photos/reorder
GET    /api/properties/[id]/calendar.ics

# Bookings
GET    /api/bookings
POST   /api/bookings
GET    /api/bookings/[id]
PATCH  /api/bookings/[id]
DELETE /api/bookings/[id]
POST   /api/bookings/[id]/checkin
POST   /api/bookings/[id]/checkout

# Calendar
GET    /api/calendar
POST   /api/calendar/block
DELETE /api/calendar/block/[id]
POST   /api/calendar/sync

# Guests
GET    /api/guests
POST   /api/guests
GET    /api/guests/[id]
PATCH  /api/guests/[id]

# Messages
GET    /api/bookings/[id]/messages
POST   /api/bookings/[id]/messages
GET    /api/message-templates
POST   /api/message-templates
PATCH  /api/message-templates/[id]

# Expenses
GET    /api/expenses
POST   /api/expenses
PATCH  /api/expenses/[id]
DELETE /api/expenses/[id]

# Analytics
GET    /api/analytics/overview
GET    /api/analytics/revenue
GET    /api/analytics/occupancy
```

## Database Indexes

```sql
CREATE INDEX idx_properties_user ON properties(user_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_blocked_dates_property ON blocked_dates(property_id);
CREATE INDEX idx_expenses_property ON expenses(property_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
```

## Estimated Build Time

| Task | Time |
|------|------|
| Setup + Auth | 4 hrs |
| Property CRUD | 6 hrs |
| Photo management | 4 hrs |
| Calendar component | 8 hrs |
| Booking management | 8 hrs |
| iCal sync | 6 hrs |
| Guest management | 4 hrs |
| Messaging | 6 hrs |
| Financial tracking | 6 hrs |
| Dashboard + analytics | 6 hrs |
| Polish + testing | 8 hrs |
| **Total** | **~66 hours** |


