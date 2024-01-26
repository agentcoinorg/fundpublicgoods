import { Info } from "@phosphor-icons/react/dist/ssr";
import { ScoreIcon } from "./Icons";

export default function Score({ rank }: { rank: number }) {
  return (
    <div className='flex flex-wrap gap-2 items-center justify-between'>
      <div className='flex space-x-2 items-center'>
        <ScoreIcon rank={rank} />
        <div>{(rank * 10).toFixed(1)}</div>
      </div>
      <div>
        <Info size={20} className='text-indigo-300 hover:text-indigo-500' />
      </div>
    </div>
  );
}
