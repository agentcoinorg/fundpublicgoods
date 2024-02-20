import { Tables } from "@/supabase/dbTypes";
import { useState, useEffect } from "react";

export function useProgressTime(
  stepTimes: number[],
  logs: Array<Tables<"logs">>
) {
  const [startTime] = useState(Date.now());
  const [progressInformation, setProgressInformation] = useState({
    logs,
    time: 0,
    progress: 0,
  });

  // Capture the start time when the hook is first called or when stepTimes or currentStep changes
  useEffect(() => {
    const totalTime = stepTimes.reduce((a, b) => a + b, 0);

    const intervalId = setInterval(function () {
      const now = Date.now();
      let currentStep = progressInformation.logs.findIndex(
        (x) => x.status === "IN_PROGRESS"
      );

      if (currentStep === -1) {
        return;
      }

      const elapsedTimeInSteps = stepTimes
        .slice(0, currentStep + 1)
        .reduce((a, b) => a + b, 0);

      const secondsFromStart = (now - startTime) / 1000; // Convert ms to seconds
      if (secondsFromStart > elapsedTimeInSteps) {
        return;
      }

      const timeRemaining = Math.max(totalTime - secondsFromStart, 0);
      const progress = (secondsFromStart / totalTime) * 100;

      if (timeRemaining <= 1) {
        clearInterval(intervalId);
        return;
      }

      setProgressInformation((i) => ({
        ...i,
        time: timeRemaining,
        progress: progress,
      }));

      console.log(currentStep);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [stepTimes, progressInformation]);

  return progressInformation;
}
