import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ScoreIcon } from "./Icons";

export default function Score({
  rank,
  icon = true,
  onClick
}: {
  rank: number;
  icon?: boolean;
  onClick?: () => void
}) {
  return (
    <div className='flex flex-wrap gap-2 items-center justify-between'>
      <div className='flex space-x-2 items-center'>
        <ScoreIcon rank={rank} />
        <div>{(rank * 10).toFixed(1)}</div>
      </div>
      {icon && (
        <div>
          <CaretRight
            size={16}
            weight='bold'
            className='text-indigo-300 group-hover/row:text-indigo-500 cursor-pointer'
            onClick={onClick}
          />
        </div>
      )}
    </div>
  );
}
