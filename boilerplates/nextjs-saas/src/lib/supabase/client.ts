import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase Browser Client
 * 
 * Use this client in Client Components.
 * Creates a single instance per browser session.
 * 
 * @stable since 1.0.0
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

