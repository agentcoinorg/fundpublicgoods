import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

interface ProgressBarProps {
  // seconds
  stepTimes: number[];
  curStep: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ stepTimes, curStep, className }) => {
  const [renderState, setRenderState] = useState<{
    widthPerc: number, // position (0-100)
    percPerSec: number // velocity (%/sec)
  }>({
    widthPerc: 0,
    percPerSec: 0
  });

  useEffect(() => {
    const dt = 1000 / 60; // frame delta time (in ms)
    const numSteps = stepTimes.length;
    const stepSize = 100 / numSteps;
    // avoid floating point rounding errors
    const fuzz = 0.01;

    const id = setInterval(() => {
      setRenderState((prevRenderState) => {
          // early out if current step is beyond numSteps provided
          if (curStep > numSteps) {
            return {
              widthPerc: 100,
              percPerSec: 0
            }
          }

          const prevWidthPerc = prevRenderState.widthPerc;
          const prevPercPerSec = Math.max(prevRenderState.percPerSec, 1);

          // Calculate velocity for the curStep in %/sec
          const curPercPerSec = stepSize / Math.max(stepTimes[curStep], 1);

          // What step did we render last
          const renderStep = Math.floor(
            ((prevWidthPerc + fuzz) / 100) * numSteps
          );

          // If we need to fast-forward
          if (renderStep < curStep) {
            return {
              widthPerc: stepSize * curStep,
              percPerSec: curPercPerSec
            }
          }
          // Do we need to pause?
          if (renderStep > curStep) {
            return {
              widthPerc: stepSize * (curStep + 1),
              percPerSec: 0
            }
          }
          // Integrate our velocity like normal
          return {
            widthPerc: Math.min(prevWidthPerc + ((prevPercPerSec / 1000) * dt), 100),
            percPerSec: curPercPerSec
          }
        });
      }, dt);

      return () => clearInterval(id);
    }, [stepTimes]);

  return (
    <svg
      className={clsx(
        "stroke-cyan-500 text-cyan-500/30",
        className
      )}
      width="100%"
      height="10"
      viewBox="0 0 100 1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width="100" height="1" stroke="currentColor" />
      <rect x="0" y="0" width={renderState.widthPerc} height="1" stroke="currentStroke" />
    </svg>
  );
};

export default ProgressBar;
 