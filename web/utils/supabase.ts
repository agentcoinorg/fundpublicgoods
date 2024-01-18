import { Database } from "@/supabase/dbTypes";
import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseClient = () => {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
};
