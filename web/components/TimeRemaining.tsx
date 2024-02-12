import React, { useState, useEffect } from "react";
import { useProgressTime } from "@/hooks/useProgressTime";

interface TimeRemainingProps {
  stepTimes: number[];
  curStep: number;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  stepTimes,
  curStep,
}) => {
  const [timerStarted, setTimerStarted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(120);
  const { time } = useProgressTime(stepTimes, curStep);

  useEffect(() => {
    setRemainingTime(time);
  }, [time]);

  useEffect(() => {
    setTimerStarted(true);
  });

  const formattedTime = formatTime(remainingTime, curStep);

  return <div className='text-subdued text-[10px]'>{formattedTime}</div>;
};

function formatTime(seconds: number, curStep: number) {
  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  return seconds
    ? `~${minutes}:${secs.toString().padStart(2, "0")} remaining`
    : curStep > 0
    ? "Loading strategies..."
    : `~2:00 remaining`;
}

export default TimeRemaining;
