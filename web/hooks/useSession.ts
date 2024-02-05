import { Session } from "next-auth"
import { v4 as uuidv4 } from 'uuid';
import { signIn, useSession as useNextAuthSession } from "next-auth/react"

const X_ANON_ID_KEY_NAME = 'fpg.xanonid'

const anonSignIn = async () => {
  let currentXAnonId = localStorage.getItem(X_ANON_ID_KEY_NAME)

  if (!currentXAnonId) {
    currentXAnonId = uuidv4()
    localStorage.setItem(X_ANON_ID_KEY_NAME, currentXAnonId)
  }

  await signIn('anon-login', {
    redirect: false,
    id: currentXAnonId
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