import Button from "./Button";
import { StrategyTable, StrategyTableProps } from "./StrategyTable";
import TextField from "./TextField";

export default async function Strategy(props: StrategyTableProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col gap-4 justify-center w-3/5">
        <TextField label="Results for" />
        <p className="text-base">
          I&apos;ve evaluated the impact of Ethereum infrastructure projects on
          the Gitcoin project registry and Optimism Retroactive Public Funding,
          and have listed the top 10 most impactful projects below. I&apos;ve
          also allotted a weighting for each to appropriately fund each project.
        </p>
        <div className="flex flex-col gap-4 border-zinc-700 rounded-lg border-2 p-8">
          <TextField label="Total Funding Amount" />
          <div className="bg-gray-800 text-gray-300 rounded-lg shadow-md overflow-hidden">
            <StrategyTable strategy={props.strategy} />
          </div>
        </div>
        {/* <div className="absolute right-0"> */}
          <Button>Next →</Button>
        {/* </div> */}
      </div>
    </div>
  );
}
