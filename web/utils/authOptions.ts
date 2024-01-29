import jwt from "jsonwebtoken";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { createSupabaseAdminClient } from "./supabase-admin";
import { SiweMessage } from "siwe";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: "anon-login",
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
    CredentialsProvider({
      id: "siwe",
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );

          if (!process.env.NEXTAUTH_URL) {
            throw new Error(`NEXTAUTH_URL env missing`);
          }

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          // https://stackoverflow.com/questions/77074980
          const nonce = cookies()
            .get("next-auth.csrf-token")
            ?.value.split("|")[0];

          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce,
          });

          if (result.success) {
            const supabase = createSupabaseAdminClient(cookies());
            const { data: existingUser } = await supabase
              .from("users")
              .select("id, address")
              .eq("address", siwe.address)
              .limit(1)
              .single();

            if (existingUser) {
              return existingUser;
            }

            const { data: newUser, error } = await supabase
              .from("users")
              .insert({
                address: siwe.address,
                is_anon: false,
              })
              .select("id, address, is_anon")
              .limit(1)
              .single();

            if (error) {
              console.log(error);
              throw new Error(
                `Could not insert new user with address: ${siwe.address}`
              );
            }

            return newUser;
          }
          return null;
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