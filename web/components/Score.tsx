import { ScoreIcon } from "./Icons";
import clsx from "clsx";

export default function Score({
  rank,
  small,
  onClick,
}: {
  rank: number;
  small?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={clsx("flex items-center", small ? "space-x-1" : "space-x-2")}>
      <ScoreIcon size={small ? 12 : 20} rank={rank} />
      <div className={small ? "text-[10px]" : ""}>{(rank * 10).toFixed(1)}</div>
    </div>
  );
}
