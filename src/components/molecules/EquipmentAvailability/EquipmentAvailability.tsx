import { Badge, StatusDot } from "@/components/atoms";

export interface EquipmentAvailabilityProps {
  equipment: AmendmentImpact["equipment"];
}

function EquipmentAvailability({ equipment }: EquipmentAvailabilityProps) {
  return (
    <section
      className="flex flex-col gap-2"
      aria-labelledby="equipment-availability-heading"
    >
      <div className="flex items-center gap-2">
        <StatusDot
          size={9}
          tone={equipment.available ? "success" : "error"}
          halo
        />
        <h3
          id="equipment-availability-heading"
          className="text-overline uppercase text-text-3"
        >
          Equipment
        </h3>
        <Badge tone={equipment.available ? "success" : "error"}>
          {equipment.available ? "Available" : "Unavailable"}
        </Badge>
      </div>

      {equipment.unavailableItems.length > 0 ? (
        <ul className="flex flex-col gap-1.5 pl-4">
          {equipment.unavailableItems.map((item) => (
            <li key={item} className="text-body-sm text-error">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-text-2-strong">
          All requested equipment is available.
        </p>
      )}
    </section>
  );
}

EquipmentAvailability.displayName = "EquipmentAvailability";

export default EquipmentAvailability;
