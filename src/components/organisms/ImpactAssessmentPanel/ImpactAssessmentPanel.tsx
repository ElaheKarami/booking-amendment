import { Badge } from "@/components/atoms";
import {
  ApprovalRequirements,
  ChargeDifference,
  EmptyState,
  EquipmentAvailability,
  ScheduleImpact,
  ValidationMessages,
} from "@/components/molecules";
import clsx from "@/utils/clsx";

export interface ImpactAssessmentPanelProps {
  impact: AmendmentImpact | null;
  stale?: boolean;
}

function ImpactAssessmentPanel({
  impact,
  stale = false,
}: ImpactAssessmentPanelProps) {
  if (!impact) {
    return (
      <EmptyState
        className="mt-4 border-dashed py-10"
        title="No impact calculated"
        description="Run Recalculate to review schedule, equipment, charges, approvals, and validations for the current draft."
      />
    );
  }

  return (
    <div
      className={clsx("mt-4 flex flex-col gap-5", {
        "opacity-90": stale,
      })}
      data-stale={stale ? "true" : "false"}
    >
      {stale && (
        <div
          className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2"
          role="status"
        >
          <Badge tone="warning">Outdated result</Badge>
          <p className="mt-1.5 text-body-sm text-warning">
            This assessment no longer matches the current draft. Recalculate
            before submitting.
          </p>
        </div>
      )}

      <ScheduleImpact schedule={impact.schedule} />
      <EquipmentAvailability equipment={impact.equipment} />
      <ChargeDifference charges={impact.charges} />
      <ValidationMessages validations={impact.validations} />
      <ApprovalRequirements approvals={impact.approvals} />
    </div>
  );
}

ImpactAssessmentPanel.displayName = "ImpactAssessmentPanel";

export default ImpactAssessmentPanel;
