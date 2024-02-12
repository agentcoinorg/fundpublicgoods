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
  MouseEventHandler,
} from "react";

export interface TextFieldProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
  checked?: boolean;
  indeterminate?: boolean;
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
      indeterminate,
      ...props
    },
    ref
  ) => {
    const getCheckStatus = (checked?: boolean, indeterminate?: boolean) =>
      checked ? "checked" : indeterminate ? "indeterminate" : undefined;

    const [checkStatus, setCheckStatus] = useState<
      "checked" | "indeterminate" | undefined
    >(getCheckStatus(checked, indeterminate));

    useEffect(() => {
      setCheckStatus(getCheckStatus(checked, indeterminate));
    }, [checked, indeterminate]);

    const handleCheck = () => {
      const newValue = getCheckStatus(!checked);
      setCheckStatus(newValue);
      if (props.onChange) {
        const event = {
          target: {
            type: "checkbox",
            checked: newValue === "checked",
            indeterminate: newValue === "indeterminate",
          },
        } as ChangeEvent<HTMLInputElement>;
        props.onChange(event);
      }
    };

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className={clsx("space-y-px", { "w-full": type !== "checkbox" })}>
        {label && (
          <label className='text-xs text-subdued font-medium leading-none'>
            {label}
          </label>
        )}
        {type === "checkbox" ? (
          <div
            className={clsx(
              "checkbox",
              props.disabled ? "cursor-not-allowed" : "cursor-pointer",
              { checked: !props.disabled && checkStatus === "checked" },
              { indeterminate: checkStatus === "indeterminate" },
              className
            )}
            onClick={handleCheck}>
            <div
              className={clsx("checkmark", {
                hidden: checkStatus !== "checked",
              })}
            />
            <div
              className={clsx("check-indeterminate", {
                hidden: checkStatus !== "indeterminate",
              })}
            />
          </div>
        ) : (
          <div className='relative w-full group'>
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
                "w-full rounded-xl border-2 border-indigo-200 group-hover:border-indigo-500 focus:bg-indigo-50 bg-indigo-white px-4 py-3 text-sm text-indigo-800 outline-none transition-all duration-500 ease-in-out placeholder:text-indigo-800/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
                props.disabled
                  ? "cursor-default opacity-50"
                  : "cursor-text group-hover:border-indigo-600 group-hover:bg-indigo-50",
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
                  "absolute right-2 top-1/2 -translate-y-1/2 transform",
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
