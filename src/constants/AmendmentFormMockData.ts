export const DISCHARGE_PORT_OPTIONS = [
  { value: "NLRTM", label: "NLRTM — Rotterdam" },
  { value: "DEHAM", label: "DEHAM — Hamburg" },
  { value: "BEANR", label: "BEANR — Antwerp" },
  { value: "GBFXT", label: "GBFXT — Felixstowe" },
  { value: "FRLEH", label: "FRLEH — Le Havre" },
  { value: "ESALG", label: "ESALG — Algeciras" },
  { value: "ITGOA", label: "ITGOA — Genoa" },
  { value: "GRPIR", label: "GRPIR — Piraeus" },
] as const;

export const EQUIPMENT_TYPE_OPTIONS: Array<{
  value: EquipmentType;
  label: string;
}> = [
  { value: "20GP", label: "20GP" },
  { value: "40GP", label: "40GP" },
  { value: "40HC", label: "40HC" },
];

export const SPECIAL_INSTRUCTIONS_MAX_LENGTH = 500;
