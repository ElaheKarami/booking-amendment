"use client";

import dynamic from "next/dynamic";
import { Badge, Card } from "@/components/atoms";
import { ImpactAssessmentPanelSkeleton } from "@/components/skeletons";
import type { AssessmentLifecycleStatus } from "@/hooks/useImpactAssessment";
import type { WorkspaceFeedback } from "@/utils/bookingAmendmentWorkspaceFeedback";

const ImpactAssessmentPanel = dynamic(
  () => import("../ImpactAssessmentPanel/ImpactAssessmentPanel"),
  {
    loading: () => <ImpactAssessmentPanelSkeleton />,
    ssr: false,
  },
);

export interface ImpactAssessmentSectionProps {
  impact: AmendmentImpact | null;
  assessmentStatus: AssessmentLifecycleStatus;
  feedback: WorkspaceFeedback;
}

function ImpactAssessmentSection({
  impact,
  assessmentStatus,
  feedback,
}: ImpactAssessmentSectionProps) {
  return (
    <Card padded={false} className="border-border px-6 py-5">
      <h2 className="text-section text-text-1">Impact assessment</h2>
      <p className="mt-1 text-body-sm text-text-2">
        Run Recalculate to view schedule, equipment, and charge impacts for the
        current draft.
      </p>
      <div className="mt-4">
        <Badge tone={feedback.tone} aria-live="polite">
          {feedback.label}
        </Badge>
      </div>
      <ImpactAssessmentPanel
        impact={impact}
        stale={assessmentStatus === "stale"}
      />
    </Card>
  );
}

ImpactAssessmentSection.displayName = "ImpactAssessmentSection";

export default ImpactAssessmentSection;
