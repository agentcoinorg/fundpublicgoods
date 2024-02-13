import React from "react";
import { useProgressTime } from "@/hooks/useProgressTime";

interface TimeRemainingProps {
  stepTimes: number[];
  curStep: number;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  stepTimes,
  curStep,
}) => {
  const { time } = useProgressTime(stepTimes, curStep);
  const formattedTime = formatTime(time, curStep);

  return <div className='text-subdued text-[10px]'>{formattedTime}</div>;
};

function formatTime(seconds: number, curStep: number) {
  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  const timeRemaining = seconds ? `${minutes}:${secs.toString().padStart(2, "0")}` : "1:00" 
  return `Estimated time: ~${timeRemaining}`
}

export default TimeRemaining;
