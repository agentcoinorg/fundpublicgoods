import Strategy from "@/components/Strategy";
import { Project } from "@/components/StrategyTable";
import { createSupabaseServerClient } from "@/utils/supabase-server";

export default async function StrategyPage({ params }: { params: { id: string } }) {
  const workerId = params.id;
  const supabase = createSupabaseServerClient();

  // Fetch the runs for this worker
  const runs = await supabase
    .from("runs")
    .select(`
      id,
      worker_id,
      created_at,
      prompt
    `)
    .eq("worker_id", workerId)
    .order("created_at", { ascending: false });

  if (runs.error || !runs.data || !runs.data.length) {
    console.error(runs.error);
    throw Error(`Runs with worker_id ${workerId} not found.`);
  }

  // Get the latest run
  const latestRun = runs.data[runs.data.length - 1];

  // Fetch the strategy for the latest Run
  const strategy = await supabase
    .from("strategy_entries")
    .select(`
      id,
      run_id,
      project_id,
      created_at,
      reasoning,
      impact,
      interest,
      weight,
      projects (
        id,
        title,
        recipient,
        description,
        website
      )`
    )
    .eq("run_id", latestRun.id)
    .order("impact", { ascending: false });

  if (strategy.error || !strategy.data) {
    console.log(strategy.error);
    throw new Error(`Strategy with run_id '${latestRun.id}' not found`);
  }

  const strategyEntries = strategy.data.map((x) => {
    if (x.projects.length < 1) {
      throw new Error(`Project for strategy_entry ${x.id} not found`);
    }
    return {
      ...x,
      project: Array.isArray(x.projects) ? x.projects[0] : x.projects as Project
    };
  });

  return (
    <Strategy strategy={strategyEntries} />
  );
}
