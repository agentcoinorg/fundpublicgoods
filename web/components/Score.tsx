import HighScoreIcon from "@/public/high-score-icon.svg";
import CopyToClipboardIcon from "@/public/copy-to-clipboard.svg"
import Image from "next/image";

export default function Score({ rank }: { rank: number }) {
  // TODO: Attach medium and low icons
  const Icon = rank > 0.6 ? HighScoreIcon : null;
  if (Icon) {
    return (
      <div className="flex flex-wrap gap-2 items-center justify-center">
        <div>
          <Image alt="score" priority src={Icon} />
        </div>
        <div>{(rank * 100).toFixed(2)}</div>
        <div>
          <Image className="hover:cursor-pointer" alt="copy-clipboard" src={CopyToClipboardIcon} />
        </div>
      </div>
    );
  }
  return null;
}
