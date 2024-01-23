"use client";

import clsx from "clsx";
import {
  useState,
  DetailedHTMLProps,
  ChangeEvent,
  InputHTMLAttributes,
  ReactNode,
  forwardRef,
  useEffect,
} from "react";

interface TextFieldProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
  checked?: boolean;
  leftAdornment?: ReactNode;
  leftAdornmentClassnames?: string;
  rightAdornment?: ReactNode;
  rightAdornmentClassnames?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

/* eslint-disable react/display-name */
const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      type = "input",
      leftAdornment,
      leftAdornmentClassnames,
      rightAdornment,
      rightAdornmentClassnames,
      className,
      label,
      error,
      checked,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] =
      useState<TextFieldProps["checked"]>(checked);

    useEffect(() => {
      setIsChecked(checked);
    }, [checked]);

    const handleCheck = () => {
      const newValue = !isChecked;
      setIsChecked(newValue);
      if (props.onChange) {
        const event = {
          target: {
            type: "checkbox",
            checked: newValue,
          },
        } as ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    return (
      <div className={clsx("space-y-1", { "w-full": type !== "checkbox" })}>
        {label && <label className='text-sm font-semibold'>{label}</label>}
        {type === "checkbox" ? (
          <div
            className={clsx("checkbox", { checked: isChecked }, className)}
            onClick={handleCheck}>
            <div className={clsx("checkmark", { hidden: !isChecked })} />
          </div>
        ) : (
          <div className='relative w-full'>
            {leftAdornment && (
              <div
                className={clsx(
                  "absolute left-4 top-1/2 -translate-y-1/2 transform",
                  leftAdornmentClassnames
                )}>
                {leftAdornment}
              </div>
            )}
            <input
              className={clsx(
                "focus:ring-3 w-full rounded-full border-2 shadow-xl border-indigo-500 bg-indigo-50 px-6 py-5 text-sm text-indigo-800 outline-none transition-all placeholder:text-indigo-800/50 focus:border-blue-500 focus:ring-blue-500/20",
                props.disabled
                  ? "cursor-default opacity-50"
                  : "cursor-text hover:border-indigo-600 hover:bg-white",
                { "border-red-500": error },
                { "!pl-10": leftAdornment },
                { "!pr-10": rightAdornment },
                className
              )}
              type={type}
              ref={ref}
              {...props}
            />
            {rightAdornment && (
              <div
                className={clsx(
                  "absolute right-4 top-1/2 -translate-y-1/2 transform",
                  rightAdornmentClassnames
                )}>
                {rightAdornment}
              </div>
            )}
          </div>
        )}
        {error && <div className='text-xs text-red-500'>{error}</div>}
      </div>
    );
  }
);

export default TextField;
