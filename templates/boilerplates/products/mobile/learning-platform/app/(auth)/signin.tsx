import { Redirect } from "expo-router";

/**
 * Legacy signin route - redirects to the new signin-credentials screen
 */
export default function SignInRedirect() {
  return <Redirect href="/signin-credentials" />;
}
