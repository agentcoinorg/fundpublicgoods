import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { calculateProgressAndTime } from "@/app/lib/utils/timeUtils";
import { useProgressTime } from "@/hooks/useProgressTime";

interface ProgressBarProps {
  // seconds
  stepTimes: number[];
  curStep: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  stepTimes,
  curStep,
  className,
}) => {
  const [widthPerc, setWidthPerc] = useState(0);
  const { progress } = useProgressTime(stepTimes, curStep);

  useEffect(() => {
    if (curStep > stepTimes.length) {
      setWidthPerc(100);
    } else {
      setWidthPerc(progress);
    }
  }, [progress, stepTimes, curStep]);

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
        width={widthPerc}
        height='1'
        stroke='currentStroke'
        className='transition-[width] duration-[2000ms] ease-out'
      />
    </svg>
  );
};

export default ProgressBar;
