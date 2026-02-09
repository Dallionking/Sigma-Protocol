import "../global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { DevFAB } from '@/components/DevFAB';
import { STORAGE_KEYS } from '@/lib/storageKeys';
import { useAuthStore } from '@/stores/authStore';
import { useLearnStore } from '@/stores/learnStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useFeedStore } from '@/stores/feedStore';
import { useProfileStore } from '@/stores/profileStore';
import { useSubscriptionStore } from '@/stores/subscriptionStore';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Always start from index which redirects to splash for gate logic
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Satoshi: require('../assets/fonts/Satoshi-Variable.ttf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Variable.ttf'),
    PlusJakartaSans: require('../assets/fonts/PlusJakartaSans-Variable.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-Variable.ttf'),
    ...FontAwesome.font,
  });

  const [demoModeChecked, setDemoModeChecked] = useState(false);

  // Demo Mode: Reset all state on app launch for presentation
  useEffect(() => {
    async function checkDemoMode() {
      try {
        // DEMO PRESENTATION MODE - Always reset for fresh walkthrough
        const FORCE_DEMO_MODE = true;
        const demoMode = await AsyncStorage.getItem(STORAGE_KEYS.demoMode);
        
        if (FORCE_DEMO_MODE || demoMode === "true") {
          // Clear all user state keys (but keep demoMode itself enabled)
          await AsyncStorage.multiRemove([
            STORAGE_KEYS.hasLaunched,
            STORAGE_KEYS.onboardingComplete,
            STORAGE_KEYS.hasSession,
          ]);
          
          // Reset Zustand stores
          useAuthStore.getState().reset();
          useOnboardingStore.getState().reset();
          useLearnStore.getState().reset();
          useScheduleStore.getState().reset();
          useFeedStore.getState().reset();
          useProfileStore.getState().reset();
          useSubscriptionStore.getState().reset();
          
          console.log("[Demo Mode] State reset for fresh start");
        }
      } catch (e) {
        console.warn("[Demo Mode] Failed to check/reset:", e);
      } finally {
        setDemoModeChecked(true);
      }
    }
    
    void checkDemoMode();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && demoModeChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, demoModeChecked]);

  if (!loaded || !demoModeChecked) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        {/* Launch flow */}
        <Stack.Screen name="(launch)/splash" />
        <Stack.Screen name="(launch)/update-required" />
        <Stack.Screen name="(launch)/maintenance" />
        <Stack.Screen name="(states)/error-offline" />
        {/* Onboarding flow */}
        <Stack.Screen name="(onboarding)/welcome" />
        <Stack.Screen name="(onboarding)/goal-select" />
        <Stack.Screen name="(onboarding)/level-select" />
        <Stack.Screen name="(onboarding)/why-learn" />
        <Stack.Screen name="(onboarding)/fast-win" />
        <Stack.Screen name="(onboarding)/fast-win-success" />
        <Stack.Screen name="(onboarding)/notifications" />
        <Stack.Screen name="(onboarding)/complete" />
        {/* Auth - Signup flow */}
        <Stack.Screen name="(auth)/signup-email" />
        <Stack.Screen name="(auth)/signup-verify" />
        <Stack.Screen name="(auth)/signup-password" />
        <Stack.Screen name="(auth)/signup-name" />
        <Stack.Screen name="(auth)/signup-success" />
        {/* Auth - Signin flow */}
        <Stack.Screen name="(auth)/signin-credentials" />
        <Stack.Screen name="(auth)/signin-2fa" />
        <Stack.Screen name="(auth)/signin-success" />
        {/* Auth - Forgot password flow */}
        <Stack.Screen name="(auth)/forgot-email" />
        <Stack.Screen name="(auth)/forgot-check-email" />
        <Stack.Screen name="(auth)/forgot-reset" />
        {/* Auth - OAuth */}
        <Stack.Screen name="(auth)/oauth-callback" />
        {/* Auth - Legacy */}
        <Stack.Screen name="(auth)/signin" />
        {/* Tabs (Home, Learn, Practice, Profile) */}
        <Stack.Screen name="(tabs)" />
        {/* Modals */}
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "transparentModal",
            animation: "slide_from_bottom",
          }}
        />
        {/* Dev */}
        <Stack.Screen name="dev" options={{ presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      {/* Floating Dev Button - visible on all screens in dev mode */}
      <DevFAB />
    </ThemeProvider>
  );
}
