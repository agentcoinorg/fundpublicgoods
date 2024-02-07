import Disclaimer from "@/components/Disclaimer";
import RealtimeLogs from "@/components/RealtimeLogs";
import Strategy from "@/components/Strategy";
import { StrategyWithProjects } from "@/components/StrategyTable";
import TextField from "@/components/TextField";
import { Tables } from "@/supabase/dbTypes";
import { checkIfFinished } from "@/utils/logs";
import { createSupabaseServerClientWithSession } from "@/utils/supabase-server";

export default async function StrategyPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createSupabaseServerClientWithSession();

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
      ),
      logs(
        id,
        run_id,
        created_at,
        value,
        ended_at,
        status,
        step_name
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (run.error || !run.data) {
    console.error(run.error);
    throw Error(`Runs with id ${params.id} not found.`);
  }

  const strategyCreated = checkIfFinished(run.data.logs);
  if (!strategyCreated) {
    return (
      <div className='w-full flex flex-col items-center justify-between h-full pt-16 pb-8 px-16'>
        <div className='w-full max-w-sm space-y-8'>
          <div className='flex flex-col gap-2'>
            <TextField label='Results for' value={run.data.prompt} readOnly />
          </div>
          <RealtimeLogs
            logs={run.data.logs}
            run={{ id: params.id, prompt: run.data.prompt }}
          />
        </div>
        <Disclaimer />
      </div>
    );
  }

  const data = run.data.strategy_entries as unknown as StrategyWithProjects;

  const strategy = data
    .map((s) => {
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
          defaultWeight: s.weight as number,
        };
      }
      return {
        ...s,
        selected: run.data.funding_entries.length === 0,
        defaultWeight: s.weight as number,
      };
    })
    .sort((a, b) => (b.impact || 0) - (a.impact || 0));

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
