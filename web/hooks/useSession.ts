import { Session } from "next-auth"
import { signIn, useSession as useNextAuthSession } from "next-auth/react"

const anonSignIn = async () => {
  await signIn('anon-login', {
    redirect: false
  })
}

export default function useSession(): {
  data: Session | null;
  status: "authenticated" | "loading";
} {
  const { data, status } = useNextAuthSession({
    required: true,
    onUnauthenticated: () => anonSignIn()
  })

  return {
    data,
    status
  }
}