import { now } from "next-auth/client/_utils";
import { useRef, useState } from "react";
import colors from "tailwindcss/colors";

const WeightingSlider = ({ weight }: { weight: number }) => {
  const sliderRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<number>(weight);
  // const [maxValue, setMaxValue] = useState<number>(weight);

  const handleChange = () => {
    if (sliderRef.current) {
      setValue(sliderRef.current.valueAsNumber);
    }
  };

  return (
    <input
      type='range'
      ref={sliderRef}
      className='w-full h-1.5 rounded appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-100 [&::-webkit-slider-thumb]:hover:bg-indigo-200 [&::-webkit-slider-thumb]:ring [&::-webkit-slider-thumb]:ring-indigo-300'
      onChange={handleChange}
      style={{
        background: `linear-gradient(to right, ${colors.indigo[500]} ${value}%, ${colors.indigo[200]} ${value}%)`,
      }}
    />
  );
};

export default WeightingSlider;
