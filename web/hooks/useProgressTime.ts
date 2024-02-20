import { Tables } from "@/supabase/dbTypes";
import { COMPLETED_TEXTS } from "@/utils/logs";
import { useState, useEffect } from "react";

export function useProgressTime(
  stepTimes: number[],
  logs: Array<Tables<"logs">>,
  prompt: string,
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
      const secondsFromStart = (now - startTime) / 1000; // Convert ms to seconds
      let currentStep = progressInformation.logs.findIndex(
        (x) => x.status === "IN_PROGRESS"
      );
      const elapsedTimeInSteps = stepTimes
        .slice(0, currentStep + 1)
        .reduce((a, b) => a + b, 0);

      const timeRemaining = Math.max(totalTime - secondsFromStart, 0);

      const progress = (secondsFromStart / totalTime) * 100;
      if (timeRemaining <= 1) {
        clearInterval(intervalId);
        return;
      }

      if (
        secondsFromStart > elapsedTimeInSteps &&
        stepTimes.length > currentStep &&
        currentStep !== -1
      ) {
        setProgressInformation(({ logs }) => {
          const newLogs = [...logs];
          newLogs[currentStep].status = "COMPLETED";
          newLogs[currentStep].value = COMPLETED_TEXTS[newLogs[currentStep].step_name]
          if (currentStep === 0) {
            newLogs[currentStep].value += " to " + prompt
          }

          if (stepTimes.length > currentStep + 1) {
            newLogs[currentStep + 1].status = "IN_PROGRESS";
          }
          return {
            time: timeRemaining,
            progress: progress,
            logs: newLogs,
          };
        });
        return;
      }

      setProgressInformation((i) => ({
        ...i,
        time: timeRemaining,
        progress: progress,
      }));
    }, 1000);
    return () => clearInterval(intervalId);
  }, [stepTimes]);

  return progressInformation;
}
