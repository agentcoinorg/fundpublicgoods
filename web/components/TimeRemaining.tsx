import React from "react";

interface TimeRemainingProps {
  time: number;
}

const TimeRemaining: React.FC<TimeRemainingProps> = ({
  time
}) => {
  const formattedTime = formatTime(time);

  return <div className='text-subdued text-[10px]'>{formattedTime}</div>;
};

function formatTime(seconds: number) {
  const roundedSeconds = Math.round(seconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const secs = roundedSeconds % 60;
  const timeRemaining = seconds ? `${minutes}:${secs.toString().padStart(2, "0")}` : "1:10" 
  return `Estimated time: ~${timeRemaining}`
}

export default TimeRemaining;
