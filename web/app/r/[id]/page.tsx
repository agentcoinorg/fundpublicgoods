import Strategy from "@/components/Strategy";
import { StrategyWithProjects } from "@/components/StrategyTable";
import { authOptions } from "@/utils/authOptions";
import { createSupabaseServerClient } from "@/utils/supabase-server";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error(`User needs to have a session`)
  }

  const supabase = createSupabaseServerClient(cookies(), session.supabaseAccessToken);

  // // Fetch the runs for this worker
  const runs = await supabase
    .from("runs")
    .select(
      `
      id,
      worker_id,
      created_at,
      prompt,
      strategy_entries(
        *,
        project:projects(*)
      )
    `
    )
    .eq("id", params.id)
    .order("created_at", { ascending: false })
    .single();

  if (runs.error || !runs.data) {
    console.error(runs.error);
    throw Error(`Runs with id ${params.id} not found.`);
  }

  const data = runs.data.strategy_entries as unknown as StrategyWithProjects;

  return (
    <Strategy
      strategy={data.map((s) => ({
        ...s,
        selected: true,
      }))}
      prompt={runs.data.prompt}
    />
  );
}
