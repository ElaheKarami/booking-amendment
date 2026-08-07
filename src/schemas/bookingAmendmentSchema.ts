import { z } from "zod";
import type {
  FieldPath,
  FieldValues,
  UseFormSetError,
} from "react-hook-form";
import { SPECIAL_INSTRUCTIONS_MAX_LENGTH } from "@/constants";

const equipmentTypeSchema = z.enum(["20GP", "40GP", "40HC"]);

const containerRequirementSchema = z.object({
  equipmentType: equipmentTypeSchema,
  quantity: z
    .number({ error: "Quantity must be a number." })
    .int("Quantity must be a whole number.")
    .gt(0, "Container quantity must be greater than zero."),
});

type VoyageConstraint = Pick<VoyageOption, "id" | "supports40HC">;

function addDuplicateEquipmentIssues(
  draft: {
    containers: Array<{ equipmentType: EquipmentType }>;
  },
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();

  draft.containers.forEach((container, index) => {
    if (seen.has(container.equipmentType)) {
      ctx.addIssue({
        code: "custom",
        path: ["containers", index, "equipmentType"],
        message: "Duplicate equipment types are not allowed.",
      });
      return;
    }

    seen.add(container.equipmentType);
  });
}

function addVoyageEquipmentIssues(
  draft: {
    voyageId: string;
    containers: Array<{ equipmentType: EquipmentType }>;
  },
  voyages: VoyageConstraint[],
  ctx: z.RefinementCtx,
) {
  const voyage = voyages.find((item) => item.id === draft.voyageId);
  if (!voyage) return;

  const requires40HC = draft.containers.some(
    (container) => container.equipmentType === "40HC",
  );

  if (requires40HC && !voyage.supports40HC) {
    ctx.addIssue({
      code: "custom",
      path: ["voyageId"],
      message: "The selected voyage does not support 40HC equipment.",
    });
  }
}

export const bookingAmendmentSchema = z
  .object({
    bookingId: z.string().min(1),
    baseVersion: z.number().int().positive(),
    portOfDischarge: z.string().min(1, "Port of discharge is required."),
    voyageId: z.string().min(1, "Select a planned voyage."),
    cargoReadinessDate: z
      .string()
      .min(1, "Cargo readiness date is required."),
    containers: z
      .array(containerRequirementSchema)
      .min(1, "Add at least one container row."),
    specialInstructions: z
      .string()
      .max(
        SPECIAL_INSTRUCTIONS_MAX_LENGTH,
        `Special instructions must be ${SPECIAL_INSTRUCTIONS_MAX_LENGTH} characters or fewer.`,
      )
      .optional(),
  })
  .superRefine((draft, ctx) => {
    addDuplicateEquipmentIssues(draft, ctx);
  });

export function createBookingAmendmentSchema(
  voyages: VoyageConstraint[] = [],
) {
  return bookingAmendmentSchema.superRefine((draft, ctx) => {
    addVoyageEquipmentIssues(draft, voyages, ctx);
  });
}

export type BookingAmendmentFormValues = z.infer<typeof bookingAmendmentSchema>;

export function mapServerValidationToFormErrors<TFieldValues extends FieldValues>(
  fields: Record<string, string[]>,
  setError: UseFormSetError<TFieldValues>,
) {
  Object.entries(fields).forEach(([path, messages]) => {
    const message = messages[0];
    if (!message) return;

    setError(path as FieldPath<TFieldValues>, {
      type: "server",
      message,
    });
  });
}
