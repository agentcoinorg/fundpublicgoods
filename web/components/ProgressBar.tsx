import React from "react";
import clsx from "clsx";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  className,
}) => {

  return (
    <svg
      className={clsx("stroke-cyan-500 text-cyan-500/30", className)}
      width='100%'
      height='10'
      viewBox='0 0 100 1'
      xmlns='http://www.w3.org/2000/svg'>
      <rect x='0' y='0' width='100' height='1' stroke='currentColor' />
      <rect
        x='0'
        y='0'
        width={progress}
        height='1'
        stroke='currentStroke'
        className='transition-[width] duration-[2000ms] ease-out'
      />
    </svg>
  );
};

export default ProgressBar;
