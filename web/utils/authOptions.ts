import jwt from "jsonwebtoken";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "./supabase-admin";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Anon",
      credentials: {},
      async authorize() {
        try {
          const supabase = createSupabaseAdminClient(cookies())
          const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert({
            is_anon: true
          })
          .select("id")

          if (insertError) {
            console.log(insertError)
            throw new Error("Error inserting user")
          }

          if (insertData && insertData[0]) {
            return {
              id: insertData[0].id,
              is_anon: true
            }
          }

          return null
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  }) as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  callbacks: {
    async session({ session, token }) {
      const signingSecret = process.env.SUPABASE_JWT_SECRET;

      if (!signingSecret) {
        throw new Error("SUPABASE_JWT_SECRET env not set");
      }

      const payload = {
        aud: "authenticated",
        exp: Math.floor(new Date(session.expires).getTime() / 1000),
        sub: token.sub,
        role: "authenticated",
      };

      if (!token.sub) {
        throw new Error("No token.sub");
      }

      session.user = {
        ...session.user,
        id: token.sub,
      };

      session.supabaseAccessToken = jwt.sign(payload, signingSecret);

      return session;
    },
  },
};