import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { ScoreIcon } from "./Icons";
import clsx from "clsx";

export default function Score({
  rank,
  icon = true,
  small,
  onClick,
}: {
  rank: number;
  icon?: boolean;
  small?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className='flex flex-wrap gap-2 items-center justify-between'>
      <div
        className={clsx(
          "flex items-center",
          small ? "space-x-1" : "space-x-2"
        )}>
        <ScoreIcon size={small ? 12 : 20} rank={rank} />
        <div className={small ? "text-[10px]" : ""}>
          {(rank * 10).toFixed(1)}
        </div>
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
