import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    supabaseAccessToken: string
    user: {
      address?: string | null
      id: string
    } & DefaultSession["user"]
  }

  interface DefaultUser {
    id: string
    address?: string | null
  }
}