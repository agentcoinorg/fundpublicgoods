import { Tooltip as NextTooltip, TooltipProps } from "@nextui-org/react";
import clsx from "clsx";

export const Tooltip = ({
  content,
  showArrow = true,
  ...props
}: TooltipProps) => {
  return (
    <NextTooltip
      color='foreground'
      variant='flat'
      content={content}
      className={clsx(
        "bg-indigo-50 px-3 py-2 text-xs rounded-2xl relative shadow-lg shadow-primary-shadow/10",
        props.className
      )}
      showArrow={showArrow}
      {...props}
    />
  );
};
