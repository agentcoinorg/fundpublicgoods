import { Database } from "@/supabase/dbTypes";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "./authOptions";

export const createSupabaseServerClient = (
  cookieStore: ReturnType<typeof cookies>,
  supabaseAccessToken?: string
) => {
  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: supabaseAccessToken ? {
          Authorization: `Bearer ${supabaseAccessToken}`,
        }: {},
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  if (supabaseAccessToken) {
    // https://stackoverflow.com/questions/76649583
    client.realtime.setAuth(supabaseAccessToken)
    client.functions.setAuth(supabaseAccessToken);
    (client as any).rest.headers.Authorization = `Bearer ${supabaseAccessToken}`
  }

  return client
};

export const createSupabaseServerClientWithSession = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error(`User needs to have a session`)
  }

  return createSupabaseServerClient(cookies(), session.supabaseAccessToken)
}
