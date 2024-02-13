import { STEP_TIME_ESTS } from "@/utils/logs";
import { useState, useEffect } from "react";

export function useProgressTime(stepTimes: number[], currentStep: number) {
  const [state, setState] = useState({
    progress: 0,
    time: 0,
  });

  // Capture the start time when the hook is first called or when stepTimes or currentStep changes
  useEffect(() => {
    const startTime = Date.now();
    const totalTime = stepTimes.reduce((a, b) => a + b, 0);

    const calculate = () => {
      const now = Date.now();
      const elapsedTimeSinceStart = (now - startTime) / 1000; // Convert ms to seconds

      if (elapsedTimeSinceStart > Object.values(STEP_TIME_ESTS)[currentStep]) {
        return
      }

      const elapsedTimeInSteps = stepTimes
        .slice(0, currentStep)
        .reduce((a, b) => a + b, 0);
      const totalElapsedTime = elapsedTimeSinceStart + elapsedTimeInSteps;
      const timeRemaining = Math.max(totalTime - totalElapsedTime, 0); // Prevent negative time
      const progress = (totalElapsedTime / totalTime) * 100;

      setState({ progress, time: timeRemaining });
    };

    const intervalId = setInterval(calculate, 1000);

    return () => clearInterval(intervalId);
  }, [stepTimes, currentStep]);

  return state;
}
