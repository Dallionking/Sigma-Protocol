import { Redirect } from "expo-router";

/**
 * Index Route
 * 
 * Redirects to onboarding or tabs based on auth/first-run state.
 * 
 * @module root
 */
export default function Index() {
  // TODO: Check if user has completed onboarding
  const hasCompletedOnboarding = false;
  
  // TODO: Check if user is authenticated
  const isAuthenticated = false;

  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

