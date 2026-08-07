import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
} from "@/components/icons";
import { Badge } from "@/components/atoms";
import clsx from "@/utils/clsx";

export interface ValidationMessagesProps {
  validations: AmendmentImpact["validations"];
}

const SEVERITY_ORDER: Record<
  AmendmentImpact["validations"][number]["severity"],
  number
> = {
  error: 0,
  warning: 1,
  info: 2,
};

function severityIcon(
  severity: AmendmentImpact["validations"][number]["severity"],
) {
  switch (severity) {
    case "error":
      return <AlertCircleIcon size={16} className="text-error" />;
    case "warning":
      return <AlertTriangleIcon size={16} className="text-warning" />;
    case "info":
    default:
      return <InfoIcon size={16} className="text-info" />;
  }
}

function ValidationMessages({ validations }: ValidationMessagesProps) {
  const sorted = [...validations].sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
  );

  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="validation-messages-heading"
    >
      <div className="flex items-center gap-2">
        <h3
          id="validation-messages-heading"
          className="text-overline uppercase text-text-3"
        >
          Validations
        </h3>
        {sorted.some((item) => item.severity === "error") && (
          <Badge tone="error">Blocking</Badge>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="text-body-sm text-text-2-strong">
          No validation messages.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((item, index) => (
            <li
              key={`${item.severity}-${item.field ?? "general"}-${item.message}-${index}`}
              className={clsx(
                "flex items-start gap-2 rounded-lg border px-3 py-2",
                {
                  "border-rust-50 bg-rust-50": item.severity === "error",
                  "border-amber-100 bg-amber-50": item.severity === "warning",
                  "border-blue-100 bg-blue-50": item.severity === "info",
                },
              )}
            >
              <span className="mt-0.5 shrink-0">
                {severityIcon(item.severity)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    tone={
                      item.severity === "error"
                        ? "error"
                        : item.severity === "warning"
                          ? "warning"
                          : "info"
                    }
                  >
                    {item.severity}
                  </Badge>
                  {item.field && (
                    <span className="font-mono text-caption text-text-2-strong">
                      {item.field}
                    </span>
                  )}
                </div>
                <p
                  className={clsx("mt-1 text-body-sm", {
                    "text-error": item.severity === "error",
                    "text-warning": item.severity === "warning",
                    "text-text-1": item.severity === "info",
                  })}
                >
                  {item.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

ValidationMessages.displayName = "ValidationMessages";

export default ValidationMessages;
