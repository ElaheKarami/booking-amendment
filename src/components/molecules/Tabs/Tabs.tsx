"use client";

import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import clsx from "@/utils/clsx";

export interface TabItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabItem[];
  value: string;
  onValueChange: (id: string) => void;
}

// Underline tabs (design.md §10.2). Tab DOM ids come from `item.id` (no useId).
function Tabs({
  items,
  value,
  onValueChange,
  className,
  ...rest
}: TabsProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const enabled = items.filter((item) => !item.disabled);
    const currentIndex = enabled.findIndex((item) => item.id === value);
    if (currentIndex < 0) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = enabled[(currentIndex + 1) % enabled.length];
      if (next) onValueChange(next.id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev =
        enabled[(currentIndex - 1 + enabled.length) % enabled.length];
      if (prev) onValueChange(prev.id);
    }
  };

  return (
    <div
      role="tablist"
      className={clsx("flex gap-26 border-b border-border", className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {items.map((item) => {
        const selected = item.id === value;
        return (
          <TabButton
            key={item.id}
            id={item.id}
            selected={selected}
            disabled={item.disabled}
            onClick={() => onValueChange(item.id)}
          >
            {item.label}
          </TabButton>
        );
      })}
    </div>
  );
}

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
}

function TabButton({
  selected,
  className,
  children,
  ...rest
}: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className={clsx(
        "-mb-px border-b-2 pb-2 text-[13.5px] transition-colors duration-fast ease-motion-standard",
        "focus-visible:outline-none focus-visible:shadow-focus-ring",
        {
          "border-navy-500 font-semibold text-text-1": selected,
          "border-transparent font-normal text-text-2 hover:text-text-2-stronger":
            !selected,
          "cursor-not-allowed opacity-45": rest.disabled,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

Tabs.displayName = "Tabs";

export default Tabs;
