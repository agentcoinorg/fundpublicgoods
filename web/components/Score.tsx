import HighScoreIcon from "@/public/high-score-icon.svg";
import Image from "next/image";

export default async function Score({ rank }: { rank: number }) {
  const Icon = rank > 0.6 ? HighScoreIcon : null;
  if (Icon) {
    return (
      <div className="flex flex-wrap pl-5 gap-2">
        <div className="flex">
          <Image alt="Sparkle" priority src={Icon} />
        </div>
        <div>{(rank * 100).toFixed(2)}</div>
      </div>
    );
  }
  return null;
}
