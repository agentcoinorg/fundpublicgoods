"use server"

import { createSupabaseServerClient } from "@/utils/supabase-server";
import RealtimeLogs from "./RealtimeLogs";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export default async function Logs(props: { runId: string }) {
  const session = await getServerSession()

  if (!session) {
    throw new Error(`User needs to be signed in`)
  }
  
  const supabase = createSupabaseServerClient(cookies(), session.supabaseAccessToken)

  const { data: run } = await supabase.from('runs').select(`
    id,
    prompt,
    logs(
      id,
      run_id,
      created_at,
      value,
      ended_at,
      status,
      step_name
    )
  `).eq("id", props.runId).single()

  if (!run) {
    throw new Error(`Run with ID '${props.runId}' not found`)
  }

  return (
    <RealtimeLogs logs={run.logs} run={run} />
  )
}