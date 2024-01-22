import Strategy from "@/components/Strategy";
import { StrategyWithProjects } from "@/components/StrategyTable";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const workerId = params.id;
  const supabase = createSupabaseServerClient();

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
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (runs.error || !runs.data || !runs.data.length) {
    console.error(runs.error);
    throw Error(`Runs with worker_id ${workerId} not found.`);
  }

  const data = runs.data[0].strategy_entries as unknown as StrategyWithProjects;
  return <Strategy strategy={data} />;
}
