import { type HTMLAttributes, type ReactNode, type Ref } from "react";
import clsx from "@/utils/clsx";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  ref?: Ref<HTMLSpanElement>;
}

// Inline mono code chip (design.md §10.1 Tag / CodeChip).
function Tag({ className, children, ref, ...rest }: TagProps) {
  return (
    <span
      ref={ref}
      className={clsx(
        "inline-flex items-center rounded-sm bg-transparent font-mono text-label font-medium text-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

Tag.displayName = "Tag";

export default Tag;
