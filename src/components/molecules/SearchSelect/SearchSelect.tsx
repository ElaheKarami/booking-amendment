"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import clsx from "@/utils/clsx";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";

export interface SearchSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  label?: string;
  emptyMessage?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  isLoading?: boolean;
  loadingMessage?: string;
  loadError?: string;
  /** When false, options are not filtered locally (server-driven search). */
  filterLocally?: boolean;
  id?: string;
  className?: string;
  containerClassName?: string;
}

// FLAG: SearchSelect is not designed in design.md — combobox scaffold.
// DOM ids come from optional `id` prop (no useId).
function SearchSelect({
  options,
  value,
  onValueChange,
  onQueryChange,
  placeholder = "Search…",
  label,
  emptyMessage = "No matches",
  error,
  helperText,
  disabled = false,
  isLoading = false,
  loadingMessage = "Loading options…",
  loadError,
  filterLocally = true,
  id = "search-select",
  className,
  containerClassName,
}: SearchSelectProps) {
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const hasError = Boolean(error);

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!filterLocally) return options;
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [options, query, filterLocally]);

  useEffect(() => {
    if (!open || disabled) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open, disabled]);

  const updateQuery = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
    onQueryChange?.(next);
  };

  const commit = (opt: SearchSelectOption) => {
    if (disabled || opt.disabled) return;
    onValueChange?.(opt.value);
    updateQuery("");
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
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

  const describedById = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  const field = (
    <div className={clsx("relative", className)}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3">
        <SearchIcon size={16} />
      </span>
      <input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={hasError || undefined}
        aria-describedby={describedById}
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listId}-${activeIndex}`
            : undefined
        }
        disabled={disabled}
        className={clsx(
          "h-8 w-full rounded-lg border bg-surface pl-8 pr-8 text-label text-text-1 placeholder:text-text-3 transition-colors duration-fast focus:outline-none",
          {
            "border-border focus:border-accent focus:shadow-focus-ring":
              !hasError,
            "border-error focus:shadow-danger-ring": hasError,
            "cursor-not-allowed bg-slate-50 opacity-45": disabled,
          },
        )}
        placeholder={selected && !open ? selected.label : placeholder}
        value={open ? query : (selected?.label ?? "")}
        onChange={(e) => {
          updateQuery(e.target.value);
          if (!open) setOpen(true);
        }}
        onFocus={() => {
          if (!disabled) {
            setOpen(true);
            updateQuery("");
          }
        }}
        onKeyDown={onKeyDown}
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3">
        <ChevronDownIcon size={16} />
      </span>

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-dropdown mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-surface py-1 shadow-elevation-3"
        >
          {isLoading ? (
            <li role="status" className="px-3 py-2 text-body-sm text-text-2">
              {loadingMessage}
            </li>
          ) : loadError ? (
            <li role="alert" className="px-3 py-2 text-body-sm text-error">
              {loadError}
            </li>
          ) : filtered.length === 0 ? (
            <li className="px-3 py-2 text-body-sm text-text-2">
              {emptyMessage}
            </li>
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
                    "cursor-not-allowed text-text-3": opt.disabled,
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
  );

  return (
    <div
      className={clsx("flex flex-col gap-1", containerClassName)}
      ref={rootRef}
    >
      {label ? (
        <label className="flex flex-col gap-1 text-caption text-text-2-stronger">
          <span>{label}</span>
          {field}
        </label>
      ) : (
        field
      )}
      {error ? (
        <span id={`${id}-error`} className="text-caption text-error">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="text-caption text-text-2">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

SearchSelect.displayName = "SearchSelect";

export default SearchSelect;
