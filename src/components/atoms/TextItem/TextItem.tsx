import React, { HTMLAttributes } from "react";
import clsx from "@/utils/clsx";

export interface TextItemProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  text: string | React.ReactNode;
  title: string | React.ReactNode;
  textClassName?: string;
  titleClassName?: string;
  titleNoShrink?: boolean;
  className?: string;
}

function TextItem({
  text,
  title,
  textClassName = "text-sm text-text font-bold whitespace-nowrap",
  titleNoShrink = true,
  titleClassName = "text-text-2 text-xs font-light whitespace-nowrap",
  className,
}: TextItemProps) {
  return (
    <div
      className={clsx(
        "flex flex-row-reverse lg:flex-col items-center justify-between lg:justify-normal lg:items-start gap-2",
        className,
      )}
    >
      <div className={textClassName}>{text}</div>
      <div className={clsx({ "shrink-0": titleNoShrink }, titleClassName)}>
        {title}
      </div>
    </div>
  );
}

TextItem.displayName = "TextItem";

export default TextItem;
