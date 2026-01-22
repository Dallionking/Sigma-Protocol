# Technical Notes: FitCoach

## Recommended Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS + shadcn/ui
- **State**: React Query + Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit/core
- **PWA**: next-pwa

### Backend
- **Auth**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Realtime**: Supabase Realtime (messaging)
- **Email**: Resend

### Deployment
- **Hosting**: Vercel
- **PWA**: Service worker for offline

## Key Technical Decisions

### 1. Multi-Tenant Architecture

Trainers and clients share auth but have different roles:

```typescript
// On signup, create appropriate profile
async function handleSignup(user: User, role: 'trainer' | 'client') {
  if (role === 'trainer') {
    await supabase.from('trainers').insert({
      id: user.id,
      email: user.email,
      name: '',
      slug: generateSlug(user.email),
    });
  } else {
    // Client is created when trainer invites
    await supabase.from('clients')
      .update({ status: 'active', joined_at: new Date() })
      .eq('id', user.id);
  }
}
```

### 2. Exercise Library Seeding

Pre-populate with common exercises:

```typescript
// scripts/seed-exercises.ts
const exercises = [
  {
    name: 'Barbell Bench Press',
    muscle_groups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    instructions: '...',
    is_global: true,
  },
  // ... 100+ more
];

await supabase.from('exercises').insert(exercises);
```

### 3. Workout Builder State

Complex form with nested data:

```typescript
interface WorkoutFormData {
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: WorkoutExercise[];
}

interface WorkoutExercise {
  id: string; // temp ID for DnD
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
  supersetGroup?: number;
}

// Use Zustand for form state
const useWorkoutBuilder = create<WorkoutBuilderState>((set) => ({
  workout: initialWorkout,
  addExercise: (exercise) => set((state) => ({
    workout: {
      ...state.workout,
      exercises: [...state.workout.exercises, exercise],
    },
  })),
  reorderExercises: (from, to) => set((state) => ({
    workout: {
      ...state.workout,
      exercises: arrayMove(state.workout.exercises, from, to),
    },
  })),
  // ... more actions
}));
```

### 4. Program Schedule Calendar

Week/day grid for scheduling:

```typescript
interface ProgramSchedule {
  weeks: Week[];
}

interface Week {
  weekNumber: number;
  days: Day[];
}

interface Day {
  dayOfWeek: number; // 0-6
  workoutId?: string;
  workout?: Workout;
}

function ProgramCalendar({ schedule, onAssignWorkout }) {
  return (
    <div className="grid gap-4">
      {schedule.weeks.map((week) => (
        <div key={week.weekNumber} className="grid grid-cols-7 gap-2">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const scheduled = week.days.find(d => d.dayOfWeek === day);
            return (
              <DaySlot
                key={day}
                day={day}
                workout={scheduled?.workout}
                onDrop={(workoutId) => onAssignWorkout(week.weekNumber, day, workoutId)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

### 5. Workout Logging State

Track sets in real-time:

```typescript
interface WorkoutSession {
  workoutId: string;
  startedAt: Date;
  exercises: ExerciseLog[];
}

interface ExerciseLog {
  exerciseId: string;
  sets: SetLog[];
}

interface SetLog {
  setNumber: number;
  reps?: number;
  weight?: number;
  completed: boolean;
}

// Local state for active workout
const useWorkoutSession = create<WorkoutSessionState>((set, get) => ({
  session: null,
  startWorkout: (workoutId) => set({
    session: {
      workoutId,
      startedAt: new Date(),
      exercises: [],
    },
  }),
  logSet: (exerciseId, setLog) => set((state) => {
    // Update or add set log
    // ...
  }),
  completeWorkout: async () => {
    const { session } = get();
    // Save to database
    await saveWorkoutLog(session);
    set({ session: null });
  },
}));
```

### 6. Progress Charts

Weight and measurement trends:

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

function WeightChart({ measurements }) {
  const data = measurements.map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    weight: m.weight_kg,
  }));

  return (
    <LineChart data={data} width={400} height={200}>
      <XAxis dataKey="date" />
      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
      <Tooltip />
      <Line 
        type="monotone" 
        dataKey="weight" 
        stroke="#6366f1" 
        strokeWidth={2}
        dot={{ fill: '#6366f1' }}
      />
    </LineChart>
  );
}
```

### 7. Messaging with Realtime

```typescript
// Subscribe to messages
function useMessages(trainerId: string, clientId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initial load
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`trainer_id.eq.${trainerId},client_id.eq.${clientId}`)
        .order('created_at', { ascending: true });
      setMessages(data || []);
    };
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `trainer_id=eq.${trainerId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [trainerId, clientId]);

  return messages;
}
```

### 8. PWA for Offline Workouts

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'exercise-videos',
        expiration: { maxEntries: 50 },
      },
    },
  ],
});
```

## API Endpoints

```
# Trainer
GET    /api/trainer/profile
PATCH  /api/trainer/profile
GET    /api/trainer/dashboard

# Exercises
GET    /api/exercises
POST   /api/exercises
PATCH  /api/exercises/[id]
DELETE /api/exercises/[id]

# Workouts
GET    /api/workouts
POST   /api/workouts
GET    /api/workouts/[id]
PATCH  /api/workouts/[id]
DELETE /api/workouts/[id]

# Programs
GET    /api/programs
POST   /api/programs
GET    /api/programs/[id]
PATCH  /api/programs/[id]
DELETE /api/programs/[id]
POST   /api/programs/[id]/duplicate

# Clients
GET    /api/clients
POST   /api/clients/invite
GET    /api/clients/[id]
PATCH  /api/clients/[id]
POST   /api/clients/[id]/assign-program

# Client Portal
GET    /api/client/dashboard
GET    /api/client/today
GET    /api/client/program

# Workout Logs
POST   /api/workout-logs
GET    /api/workout-logs
GET    /api/workout-logs/[id]

# Progress
GET    /api/progress/measurements
POST   /api/progress/measurements
POST   /api/progress/photos
GET    /api/progress/charts

# Messages
GET    /api/messages/[clientId]
POST   /api/messages
```

## Database Indexes

```sql
CREATE INDEX idx_clients_trainer ON clients(trainer_id);
CREATE INDEX idx_exercises_trainer ON exercises(trainer_id);
CREATE INDEX idx_exercises_global ON exercises(is_global) WHERE is_global = true;
CREATE INDEX idx_workouts_trainer ON workouts(trainer_id);
CREATE INDEX idx_programs_trainer ON programs(trainer_id);
CREATE INDEX idx_client_programs_client ON client_programs(client_id);
CREATE INDEX idx_workout_logs_client ON workout_logs(client_id);
CREATE INDEX idx_measurements_client ON measurements(client_id);
CREATE INDEX idx_messages_conversation ON messages(trainer_id, client_id);
```

## Estimated Build Time

| Task | Time |
|------|------|
| Setup + Auth | 4 hrs |
| Exercise library | 4 hrs |
| Workout builder | 8 hrs |
| Program creation | 6 hrs |
| Client management | 4 hrs |
| Client portal | 6 hrs |
| Workout logging | 6 hrs |
| Progress tracking | 6 hrs |
| Messaging | 4 hrs |
| Charts + analytics | 4 hrs |
| Polish + testing | 8 hrs |
| **Total** | **~60 hours** |


