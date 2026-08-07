import { Badge, Card, Tag } from "@/components/atoms";
import PermissionGate from "../PermissionGate/PermissionGate";
import { formatPrice } from "@/utils";

export interface ChargeDifferenceProps {
  charges: AmendmentImpact["charges"];
}

function ChargeDifference({ charges }: ChargeDifferenceProps) {
  const differenceTone =
    charges.difference > 0
      ? "warning"
      : charges.difference < 0
        ? "success"
        : "info";

  return (
    <section className="flex flex-col gap-3" aria-labelledby="charge-impact-heading">
      <div className="flex items-center gap-2">
        <h3
          id="charge-impact-heading"
          className="text-overline uppercase text-text-3"
        >
          Charges
        </h3>
        <Badge tone={differenceTone}>
          {charges.difference === 0
            ? "No change"
            : charges.difference > 0
              ? "Increase"
              : "Decrease"}
        </Badge>
      </div>

      <Card variant="inverse" padded={false} className="px-4 py-3">
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-micro text-onnavy-3">Current</dt>
            <dd className="mt-1 font-mono text-body font-medium text-onnavy-1">
              {formatPrice(charges.currentTotal, { currency: charges.currency })}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-onnavy-3">Revised</dt>
            <dd className="mt-1 font-mono text-body font-medium text-onnavy-1">
              {formatPrice(charges.revisedTotal, { currency: charges.currency })}
            </dd>
          </div>
          <div>
            <dt className="text-micro text-onnavy-3">Difference</dt>
            <dd className="mt-1 font-mono text-body font-medium text-teal-300">
              {formatPrice(charges.difference, { currency: charges.currency })}
            </dd>
          </div>
        </dl>
      </Card>

      <PermissionGate
        permission="viewDetailedChargeImpact"
        fallback={
          <p className="text-caption text-text-2-strong">
            Detailed charge lines require a Commercial Reviewer or Operations
            Supervisor role.
          </p>
        }
      >
        {charges.items.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {charges.items.map((item) => (
              <li
                key={item.code}
                className="flex flex-col gap-1 border-t border-border pt-2 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Tag>{item.code}</Tag>
                  <span className="text-body-sm text-text-1">
                    {item.description}
                  </span>
                </div>
                <p className="font-mono text-caption text-text-2-strong">
                  {formatPrice(item.previousAmount, {
                    currency: charges.currency,
                  })}{" "}
                  →{" "}
                  {formatPrice(item.revisedAmount, {
                    currency: charges.currency,
                  })}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-text-2-strong">
            No charge line items returned.
          </p>
        )}
      </PermissionGate>
    </section>
  );
}

ChargeDifference.displayName = "ChargeDifference";

export default ChargeDifference;
