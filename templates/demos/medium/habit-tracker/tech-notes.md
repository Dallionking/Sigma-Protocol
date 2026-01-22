# Technical Notes: HabitFlow

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit/core
- **Animations**: Framer Motion

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Push Notifications**: Web Push API + Supabase Edge Functions
- **Real-time**: Supabase Realtime (optional)

### Deployment
- **Hosting**: Vercel
- **PWA**: next-pwa

## Key Technical Decisions

### 1. Date/Timezone Handling

Critical for habit tracking across timezones:

```typescript
import { format, startOfDay, isToday, subDays } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

// Convert to user's timezone for display
function getUserToday(timezone: string): Date {
  return startOfDay(toZonedTime(new Date(), timezone));
}

// Store dates in UTC, compare in user's timezone
function isCompletedToday(
  completion: Completion, 
  timezone: string
): boolean {
  const completionInTz = toZonedTime(
    new Date(completion.completed_date), 
    timezone
  );
  const todayInTz = getUserToday(timezone);
  return isSameDay(completionInTz, todayInTz);
}
```

### 2. Streak Calculation

Accurate streak calculation with frequency support:

```typescript
interface StreakResult {
  current: number;
  longest: number;
  lastCompleted: Date | null;
}

function calculateStreak(
  habit: Habit,
  completions: Completion[],
  today: Date
): StreakResult {
  if (completions.length === 0) {
    return { current: 0, longest: 0, lastCompleted: null };
  }

  // Get expected dates based on frequency
  const expectedDates = getExpectedDates(habit, today, 365);
  const completionSet = new Set(
    completions.map(c => format(new Date(c.completed_date), 'yyyy-MM-dd'))
  );

  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  for (const date of expectedDates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (completionSet.has(dateStr)) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else if (isToday(date)) {
      // Today not yet completed - streak continues
      continue;
    } else {
      // Streak broken
      if (tempStreak > 0 && current === 0) {
        current = tempStreak;
      }
      tempStreak = 0;
    }
  }

  return {
    current: current || tempStreak,
    longest,
    lastCompleted: completions[0]?.completed_date 
      ? new Date(completions[0].completed_date) 
      : null
  };
}

function getExpectedDates(
  habit: Habit, 
  startDate: Date, 
  daysBack: number
): Date[] {
  const dates: Date[] = [];
  
  for (let i = 0; i < daysBack; i++) {
    const date = subDays(startDate, i);
    
    if (shouldTrackOnDay(habit, date)) {
      dates.push(date);
    }
  }
  
  return dates;
}

function shouldTrackOnDay(habit: Habit, date: Date): boolean {
  const dayOfWeek = date.getDay(); // 0 = Sunday
  
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'weekends':
      return dayOfWeek === 0 || dayOfWeek === 6;
    case 'custom':
      return habit.frequency_days?.includes(dayOfWeek) ?? false;
    default:
      return true;
  }
}
```

### 3. Calendar Heatmap Component

GitHub-style contribution calendar:

```tsx
interface HeatmapProps {
  completions: Completion[];
  habits: Habit[];
  days?: number;
}

function CalendarHeatmap({ completions, habits, days = 91 }: HeatmapProps) {
  const today = new Date();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    
    // Calculate completion rate per day
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const activeHabits = habits.filter(h => shouldTrackOnDay(h, date));
      const completed = completions.filter(
        c => c.completed_date === dateStr
      ).length;
      
      const rate = activeHabits.length > 0 
        ? completed / activeHabits.length 
        : 0;
      map.set(dateStr, rate);
    }
    
    return map;
  }, [completions, habits, days]);

  return (
    <div className="grid grid-cols-13 gap-1">
      {Array.from(data.entries()).map(([date, rate]) => (
        <div
          key={date}
          className={cn(
            "w-3 h-3 rounded-sm",
            rate === 0 && "bg-muted",
            rate > 0 && rate < 0.5 && "bg-green-200",
            rate >= 0.5 && rate < 1 && "bg-green-400",
            rate === 1 && "bg-green-600"
          )}
          title={`${date}: ${Math.round(rate * 100)}%`}
        />
      ))}
    </div>
  );
}
```

### 4. Optimistic Updates

Instant feedback when completing habits:

```typescript
function useHabitCompletion(habitId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (completed: boolean) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      if (completed) {
        return supabase
          .from('completions')
          .insert({ habit_id: habitId, completed_date: today });
      } else {
        return supabase
          .from('completions')
          .delete()
          .match({ habit_id: habitId, completed_date: today });
      }
    },
    onMutate: async (completed) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['completions']);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['completions']);
      
      // Optimistically update
      queryClient.setQueryData(['completions'], (old: Completion[]) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        if (completed) {
          return [...old, { habit_id: habitId, completed_date: today }];
        } else {
          return old.filter(
            c => !(c.habit_id === habitId && c.completed_date === today)
          );
        }
      });
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['completions'], context?.previous);
    },
  });
}
```

### 5. Push Notifications

Using Web Push API:

```typescript
// Request permission
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Subscribe to push
async function subscribeToPush(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  });
  
  // Save subscription to database
  await supabase.from('push_subscriptions').insert({
    user_id: user.id,
    subscription: JSON.stringify(subscription),
  });
  
  return subscription;
}

// Service worker (sw.js)
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge.png',
      data: { url: data.url },
    })
  );
});
```

### 6. PWA Configuration

Enable offline support:

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA({
  // Next.js config
});
```

```json
// public/manifest.json
{
  "name": "HabitFlow",
  "short_name": "Habits",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#6366f1",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

## API Endpoints

```
POST   /api/auth/signup        - Create account
POST   /api/auth/login         - Sign in

GET    /api/habits             - Get user's habits
POST   /api/habits             - Create habit
PATCH  /api/habits/[id]        - Update habit
DELETE /api/habits/[id]        - Delete habit
PATCH  /api/habits/reorder     - Reorder habits

GET    /api/completions        - Get completions (date range)
POST   /api/completions        - Mark habit complete
DELETE /api/completions        - Unmark completion

GET    /api/stats              - Get user statistics
GET    /api/stats/[habitId]    - Get habit-specific stats

POST   /api/push/subscribe     - Save push subscription
DELETE /api/push/unsubscribe   - Remove subscription
```

## Database Indexes

```sql
CREATE INDEX idx_habits_user ON habits(user_id);
CREATE INDEX idx_completions_habit ON completions(habit_id);
CREATE INDEX idx_completions_date ON completions(completed_date);
CREATE INDEX idx_completions_habit_date ON completions(habit_id, completed_date);
```

## Testing Strategy

1. **Unit Tests**: Streak calculation, date handling
2. **Integration Tests**: Completion flow, stats calculation
3. **E2E Tests**: Full daily check-in flow

## Estimated Build Time Breakdown

| Task | Time |
|------|------|
| Project setup + Auth | 45 min |
| Database schema + RLS | 30 min |
| Habit CRUD | 60 min |
| Daily view + tracking | 90 min |
| Streak calculation | 60 min |
| Statistics + heatmap | 90 min |
| Reminders (basic) | 45 min |
| Polish + testing | 60 min |
| **Total** | **~8 hours** |


