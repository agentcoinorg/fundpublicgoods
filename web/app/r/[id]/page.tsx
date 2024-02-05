import Strategy from "@/components/Strategy";
import { StrategyWithProjects } from "@/components/StrategyTable";
import { createSupabaseServerClientWithSession } from "@/utils/supabase-server";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClientWithSession()

  const run = await supabase
    .from("runs")
    .select(
      `
      id,
      created_at,
      prompt,
      strategy_entries(
        *,
        project:projects(*)
      ),
      funding_entries(
        amount,
        token,
        weight,
        project_id
      )
    `
    )
    .eq("id", params.id)
    .order("created_at", { ascending: false })
    .single();

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Runs with id ${params.id} not found.`);
  }

  const data = run.data.strategy_entries as unknown as StrategyWithProjects;

  const strategy = data.map((s) => {
    if (run.data.funding_entries.length) {
      const selected = run.data.funding_entries.find(
        ({ project_id }) => s.project_id === project_id
      );
      const weight = selected?.weight || s.weight || 0;
      return {
        ...s,
        selected: !!selected,
        amount: selected?.amount,
        weight,
        defaultWeight: s.weight as number
      };
    }
    return {
      ...s,
      selected: run.data.funding_entries.length === 0,
      defaultWeight: s.weight as number
    };
  });

  const amount = run.data.funding_entries.reduce((acc, x) => {
    return acc + Number(x.amount);
  }, 0);

  return (
    <Strategy
      strategy={strategy}
      prompt={run.data.prompt}
      runId={run.data.id}
      amount={amount.toString()}
    />
  );
}
