import { Badge, StatusDot } from "@/components/atoms";

export interface ScheduleImpactProps {
  schedule: AmendmentImpact["schedule"];
}

function ScheduleImpact({ schedule }: ScheduleImpactProps) {
  return (
    <section className="flex flex-col gap-2" aria-labelledby="schedule-impact-heading">
      <div className="flex items-center gap-2">
        <StatusDot
          size={9}
          tone={schedule.feasible ? "success" : "error"}
          halo
        />
        <h3
          id="schedule-impact-heading"
          className="text-overline uppercase text-text-3"
        >
          Schedule
        </h3>
        <Badge tone={schedule.feasible ? "success" : "error"}>
          {schedule.feasible ? "Feasible" : "Not feasible"}
        </Badge>
      </div>

      {schedule.warnings.length > 0 ? (
        <ul className="flex flex-col gap-1.5 pl-4">
          {schedule.warnings.map((warning) => (
            <li key={warning} className="text-body-sm text-warning">
              {warning}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-text-2-strong">No schedule warnings.</p>
      )}
    </section>
  );
}

ScheduleImpact.displayName = "ScheduleImpact";

export default ScheduleImpact;
