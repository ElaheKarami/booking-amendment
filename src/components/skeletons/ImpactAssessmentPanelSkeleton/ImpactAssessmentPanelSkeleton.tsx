import { Card } from "@/components/atoms";

function ImpactAssessmentPanelSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading impact assessment"
      className="mt-4 flex flex-col gap-3"
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <Card
          key={index}
          padded={false}
          className="h-16 animate-pulse rounded-btn border-border bg-slate-200"
        />
      ))}
    </div>
  );
}

ImpactAssessmentPanelSkeleton.displayName = "ImpactAssessmentPanelSkeleton";

export default ImpactAssessmentPanelSkeleton;
