import { Database } from "@/supabase/dbTypes";
import { createBrowserClient } from "@supabase/ssr";

export const createSupabaseBrowserClient = (supabaseAccessToken: string) => {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
      cookies: {}
    },
  );

  // https://stackoverflow.com/questions/76649583
  client.realtime.setAuth(supabaseAccessToken)
  client.functions.setAuth(supabaseAccessToken);
  (client as any).rest.headers.Authorization = `Bearer ${supabaseAccessToken}`
  return client
};
