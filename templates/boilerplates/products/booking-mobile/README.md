# Booking Mobile Boilerplate

A mobile booking app for scheduling appointments. Built on Expo with calendar, push reminders, and real-time updates.

## 🎯 Overview

Mobile companion for the booking-scheduling web platform. Optimized for viewing and managing appointments on-the-go.

## ✨ Features

### For Clients
- Browse providers
- View availability
- Book appointments
- Manage bookings
- Push reminders

### For Providers
- View schedule
- Manage availability
- Appointment notifications
- Quick actions

### Shared
- Calendar views
- Real-time updates
- Push notifications
- Profile management

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **Calendar**: react-native-calendars
- **Notifications**: expo-notifications
- **Real-time**: Supabase Realtime
- **Styling**: NativeWind

## 📁 Project Structure

```
booking-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Home / Upcoming
│   │   ├── calendar.tsx      # Calendar view
│   │   ├── book.tsx          # New booking
│   │   └── profile.tsx       # Account
│   ├── provider/[id].tsx     # Provider detail
│   ├── booking/[id].tsx      # Booking detail
│   └── availability.tsx      # Set availability (providers)
├── components/
│   ├── calendar/
│   │   ├── CalendarView.tsx
│   │   ├── TimeSlots.tsx
│   │   └── DayView.tsx
│   ├── booking/
│   │   ├── BookingCard.tsx
│   │   ├── BookingForm.tsx
│   │   └── ConfirmationSheet.tsx
│   └── provider/
│       ├── ProviderCard.tsx
│       └── ServiceList.tsx
└── lib/
    ├── api.ts
    ├── notifications.ts
    └── calendar.ts
```

## 📱 Key Components

### Calendar with Bookings

```tsx
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';

export function BookingCalendar({ bookings, onDayPress }) {
  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};
    
    bookings.forEach(booking => {
      const dateKey = format(new Date(booking.startTime), 'yyyy-MM-dd');
      marks[dateKey] = {
        marked: true,
        dotColor: getStatusColor(booking.status),
      };
    });
    
    return marks;
  }, [bookings]);

  return (
    <Calendar
      markedDates={markedDates}
      onDayPress={onDayPress}
      theme={{
        todayTextColor: '#6366f1',
        selectedDayBackgroundColor: '#6366f1',
      }}
    />
  );
}
```

### Time Slot Picker

```tsx
export function TimeSlotPicker({ 
  slots, 
  selected, 
  onSelect 
}: TimeSlotPickerProps) {
  return (
    <FlatList
      data={slots}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => onSelect(item)}
          className={cn(
            'px-4 py-3 m-1 rounded-lg border',
            selected?.id === item.id
              ? 'bg-indigo-600 border-indigo-600'
              : 'bg-white border-gray-200'
          )}
        >
          <Text className={cn(
            'text-center',
            selected?.id === item.id ? 'text-white' : 'text-gray-900'
          )}>
            {format(item.startTime, 'h:mm a')}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
}
```

### Push Notification Setup

```tsx
import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = await Notifications.getExpoPushTokenAsync();
  
  // Save token to backend
  await savePushToken(token.data);

  return token.data;
}

// Schedule reminder
export async function scheduleReminder(booking: Booking) {
  const reminderTime = new Date(booking.startTime);
  reminderTime.setHours(reminderTime.getHours() - 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Upcoming Appointment',
      body: `Your appointment with ${booking.provider.name} is in 1 hour`,
      data: { bookingId: booking.id },
    },
    trigger: reminderTime,
  });
}
```

## 🚀 Quick Start

```bash
cp -r templates/boilerplates/products/booking-mobile ./my-booking-mobile
cd my-booking-mobile
npm install
npx expo start
```

## 📈 Extending

- **Apple/Google Wallet**: Add to wallet passes
- **Maps Integration**: Navigate to appointment
- **Video Calls**: In-app video appointments
- **Widgets**: iOS widgets for next appointment


