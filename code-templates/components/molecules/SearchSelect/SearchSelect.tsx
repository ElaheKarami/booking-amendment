"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import clsx from "@erp/utils/clsx";
import { SearchIcon, ChevronDownIcon } from "../../icons";

export interface SearchSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
  className?: string;
  containerClassName?: string;
}

// Filterable combobox (design.md §10.2): TextField + listbox. Full combobox a11y:
// role=combobox/listbox/option, aria-expanded/activedescendant, keyboard nav.
export default function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Search…",
  label,
  emptyMessage = "No matches",
  className,
  containerClassName,
}: SearchSelectProps) {
  const listId = useId();
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const commit = (opt: SearchSelectOption) => {
    if (opt.disabled) return;
    onValueChange?.(opt.value);
    setQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) commit(opt);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className={clsx("flex flex-col gap-1", containerClassName)} ref={rootRef}>
      {label && (
        <label htmlFor={fieldId} className="text-caption text-text-2-stronger">
          {label}
        </label>
      )}
      <div className={clsx("relative", className)}>
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3">
          <SearchIcon size={16} />
        </span>
        <input
          id={fieldId}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && filtered[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          className="w-full h-8 rounded-lg border border-border bg-surface pl-8 pr-8 text-label text-text-1 placeholder:text-text-3 transition-colors duration-fast focus:outline-none focus:border-accent focus:shadow-focus-ring"
          placeholder={selected ? selected.label : placeholder}
          value={open ? query : selected?.label ?? ""}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3">
          <ChevronDownIcon size={16} />
        </span>

        {open && (
          <ul
            id={listId}
            role="listbox"
            className="absolute z-dropdown mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-elevation-3"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-body-sm text-text-2">{emptyMessage}</li>
            ) : (
              filtered.map((opt, index) => {
                const isActive = index === activeIndex;
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(opt);
                    }}
                    className={clsx("cursor-pointer px-3 py-2 text-body-sm", {
                      "bg-slate-75": isActive && !opt.disabled,
                      "text-text-1": !opt.disabled,
                      "text-text-3 cursor-not-allowed": opt.disabled,
                      "font-semibold": isSelected,
                    })}
                  >
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

SearchSelect.displayName = "SearchSelect";
