import { Badge, Tag } from "@/components/atoms";
import { toTitleCase } from "@/utils";

export interface ApprovalRequirementsProps {
  approvals: AmendmentImpact["approvals"];
}

function ApprovalRequirements({ approvals }: ApprovalRequirementsProps) {
  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="approval-requirements-heading"
    >
      <div className="flex items-center gap-2">
        <h3
          id="approval-requirements-heading"
          className="text-overline uppercase text-text-3"
        >
          Approvals
        </h3>
        {approvals.length > 0 && (
          <Badge tone="warning">{approvals.length} required</Badge>
        )}
      </div>

      {approvals.length === 0 ? (
        <p className="text-body-sm text-text-2-strong">
          No additional approvals required.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {approvals.map((approval) => (
            <li
              key={approval.code}
              className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Tag>{toTitleCase(approval.code.replace(/_/g, " "))}</Tag>
                <Badge tone="warning">Approval</Badge>
              </div>
              <p className="mt-1 text-body-sm text-warning">
                {approval.reason}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

ApprovalRequirements.displayName = "ApprovalRequirements";

export default ApprovalRequirements;
