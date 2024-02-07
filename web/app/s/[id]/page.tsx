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
        <div className='px-6 fixed bottom-16 left-1/2 transform -translate-x-1/2 max-w-screen-lg w-full z-10'>
          <div className='p-6 bg-indigo-25 rounded-2xl border-2 border-indigo-200 space-y-1 shadow-md shadow-primary-shadow/20'>
            <div className='font-bold text-sm'>
              This AI agent is experimental:
            </div>
            <div className='text-[10px]'>
              The agent is doing its best to evaluate project relevance, impact,
              and funding needs based on publicly available data from Gitcoin,
              but we cannot guarantee that it will be completely accurate. The
              agent will also provide the recipient addresses of each project
              based on data in their Gitcoin applications, but we cannot
              guarantee that each project is still in control of its address, so
              please do not send large amounts.
            </div>
          </div>
        </div>
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
