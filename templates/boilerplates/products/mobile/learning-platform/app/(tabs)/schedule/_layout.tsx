import React from "react";
import { Stack } from "expo-router";

export default function ScheduleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      {/* Main schedule screens */}
      <Stack.Screen name="index" />
      <Stack.Screen name="calendar" />
      
      {/* Booking flow */}
      <Stack.Screen 
        name="slot-select" 
        options={{ 
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }} 
      />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="success" />
      
      {/* Session management */}
      <Stack.Screen name="upcoming" />
      <Stack.Screen name="past-sessions" />
      <Stack.Screen name="session-detail" />
      
      {/* Video room flow */}
      <Stack.Screen 
        name="video-room" 
        options={{ 
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen name="video-ended" />
    </Stack>
  );
}

