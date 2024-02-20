import { Tables } from "@/supabase/dbTypes";
import { useState, useEffect } from "react";

export function useProgressTime(
  stepTimes: number[],
  logs: Array<Tables<"logs">>
) {
  const [startTime, setStartTime] = useState(Date.now());
  const [progressInformation, setProgressInformation] = useState({
    time: 0,
    progress: 0,
  });

  const totalTime = stepTimes.reduce((a, b) => a + b, 0);
  let currentStep = logs.findIndex(
    (x) => x.status === "IN_PROGRESS"
  );

  useEffect(() => {
    setStartTime(Date.now())
  }, [currentStep])

  useEffect(() => {
    const intervalId = setInterval(function () {
      const now = Date.now();
      const elapsedTimeSinceStart = (now - startTime) / 1000; // Convert ms to seconds

      if (elapsedTimeSinceStart > stepTimes[currentStep]) {
        return
      }

      const elapsedTimeInSteps = stepTimes
        .slice(0, currentStep)
        .reduce((a, b) => a + b, 0);

      const totalElapsedTime = elapsedTimeSinceStart + elapsedTimeInSteps;

      const timeRemaining = Math.max(totalTime - totalElapsedTime, 0); // Prevent negative time
      const progress = (totalElapsedTime / totalTime) * 100;

      if (timeRemaining < 1) {
        return
      }

      setProgressInformation((i) => ({
        ...i,
        time: timeRemaining,
        progress: progress,
      }));

    }, 1000);
    return () => clearInterval(intervalId);
  }, [stepTimes, currentStep]);

  return progressInformation;
}
