"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Badge,
  Button,
  Select,
  TextArea,
  TextField,
} from "@/components/atoms";
import { DatePicker, SearchSelect } from "@/components/molecules";
import {
  DISCHARGE_PORT_OPTIONS,
  EQUIPMENT_TYPE_OPTIONS,
  SPECIAL_INSTRUCTIONS_MAX_LENGTH,
} from "@/constants";
import { useVoyages } from "@/hooks";
import {
  createBookingAmendmentSchema,
  type BookingAmendmentFormValues,
} from "@/schemas/bookingAmendmentSchema";

const VOYAGE_SEARCH_DEBOUNCE_MS = 300;
const EMPTY_VOYAGES: VoyageOption[] = [];

export interface AmendmentFormProps {
  defaultValues: BookingAmendmentFormValues;
  portOfLoading: string;
  currentVoyageLabel: string;
  disabled?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  requestDiscard: (onConfirm: () => void) => void;
}

function AmendmentForm({
  defaultValues,
  portOfLoading,
  currentVoyageLabel,
  disabled = false,
  onDirtyChange,
  requestDiscard,
}: AmendmentFormProps) {
  const voyagesByIdRef = useRef(new Map<string, VoyageOption>());
  const [voyageQuery, setVoyageQuery] = useState("");
  const [debouncedVoyageQuery, setDebouncedVoyageQuery] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedVoyageQuery(voyageQuery.trim());
    }, VOYAGE_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [voyageQuery]);

  const resolver = useCallback<Resolver<BookingAmendmentFormValues>>(
    async (values, context, options) =>
      zodResolver(
        createBookingAmendmentSchema([
          ...voyagesByIdRef.current.values(),
        ]),
      )(values, context, options),
    [],
  );

  const {
    control,
    register,
    reset,
    trigger,
    formState: { errors, isDirty },
  } = useForm<BookingAmendmentFormValues>({
    resolver,
    defaultValues,
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "containers",
  });

  const portOfDischarge = useWatch({ control, name: "portOfDischarge" });
  const cargoReadinessDate = useWatch({ control, name: "cargoReadinessDate" });
  const voyageId = useWatch({ control, name: "voyageId" });
  const containers = useWatch({ control, name: "containers" });
  const specialInstructions = useWatch({
    control,
    name: "specialInstructions",
  });

  // Primitive key — avoid depending on the containers array reference from useWatch,
  // which changes after trigger() and would infinite-loop revalidation effects.
  const containerEquipmentKey = useMemo(
    () =>
      (containers ?? [])
        .map((container) => container.equipmentType)
        .join("|"),
    [containers],
  );

  const voyageSearch = useMemo<VoyageSearch>(
    () => ({
      portOfLoading,
      portOfDischarge: portOfDischarge ?? "",
      readinessDate: cargoReadinessDate ?? "",
      search: debouncedVoyageQuery,
    }),
    [
      portOfLoading,
      portOfDischarge,
      cargoReadinessDate,
      debouncedVoyageQuery,
    ],
  );

  const {
    data: voyages = EMPTY_VOYAGES,
    isFetching: isFetchingVoyages,
    isError: isVoyageError,
    error: voyageError,
  } = useVoyages(voyageSearch, !disabled);

  const voyageOptionsKey = useMemo(
    () => voyages.map((voyage) => voyage.id).join("|"),
    [voyages],
  );

  useEffect(() => {
    voyages.forEach((voyage) => {
      voyagesByIdRef.current.set(voyage.id, voyage);
    });
  }, [voyages]);

  useEffect(() => {
    void trigger(["voyageId", "cargoReadinessDate"]);
  }, [
    cargoReadinessDate,
    containerEquipmentKey,
    trigger,
    voyageId,
    voyageOptionsKey,
  ]);

  const dischargeOptions = useMemo(() => {
    const options: Array<{ value: string; label: string }> =
      DISCHARGE_PORT_OPTIONS.map((port) => ({
        value: port.value,
        label: port.label,
      }));

    if (
      defaultValues.portOfDischarge &&
      !options.some((option) => option.value === defaultValues.portOfDischarge)
    ) {
      options.unshift({
        value: defaultValues.portOfDischarge,
        label: defaultValues.portOfDischarge,
      });
    }

    return options;
  }, [defaultValues.portOfDischarge]);

  const voyageOptions = useMemo(() => {
    const options = voyages.map((voyage) => ({
      value: voyage.id,
      label: `${voyage.vesselName} · ${voyage.voyageNumber}`,
    }));

    // Keep the current selection visible while a search query excludes it.
    if (
      !debouncedVoyageQuery &&
      voyageId &&
      !options.some((option) => option.value === voyageId)
    ) {
      options.unshift({
        value: voyageId,
        label:
          voyageId === defaultValues.voyageId
            ? currentVoyageLabel
            : voyageId,
      });
    }

    return options;
  }, [
    voyages,
    voyageId,
    defaultValues.voyageId,
    currentVoyageLabel,
    debouncedVoyageQuery,
  ]);

  const selectedVoyage = useMemo(() => {
    if (!voyageId) return undefined;
    return (
      voyages.find((voyage) => voyage.id === voyageId) ??
      voyagesByIdRef.current.get(voyageId)
    );
  }, [voyageId, voyages]);

  const usedEquipment = new Set(fields.map((field) => field.equipmentType));
  const nextEquipment =
    EQUIPMENT_TYPE_OPTIONS.find(
      (option) => !usedEquipment.has(option.value),
    )?.value ?? "20GP";

  const instructionsLength = specialInstructions?.length ?? 0;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <form className="mt-5 flex flex-col gap-4" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone={isDirty ? "warning" : "info"} aria-live="polite">
          {isDirty
            ? "Unsaved changes in the amendment draft"
            : "No unsaved amendment changes"}
        </Badge>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled || !isDirty}
          onClick={() => requestDiscard(() => reset(defaultValues))}
        >
          Reset to original
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="portOfDischarge"
          control={control}
          render={({ field }) => (
            <SearchSelect
              id="port-of-discharge"
              label="Port of discharge"
              options={dischargeOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Search ports…"
              emptyMessage="No ports match your search."
              disabled={disabled}
              error={errors.portOfDischarge?.message}
            />
          )}
        />

        <Controller
          name="voyageId"
          control={control}
          render={({ field }) => (
            <SearchSelect
              id="planned-voyage"
              label="Planned voyage"
              options={voyageOptions}
              value={field.value}
              onValueChange={field.onChange}
              onQueryChange={setVoyageQuery}
              placeholder={
                isFetchingVoyages ? "Loading voyages…" : "Search voyages…"
              }
              emptyMessage="No voyages match the current search, ports, and readiness date."
              isLoading={isFetchingVoyages}
              loadingMessage="Loading voyages…"
              loadError={
                isVoyageError
                  ? voyageError.message || "Unable to load voyages."
                  : undefined
              }
              filterLocally={false}
              disabled={disabled}
              error={errors.voyageId?.message}
              helperText={
                selectedVoyage
                  ? `Cut-off date: ${selectedVoyage.cutOffDate}`
                  : undefined
              }
            />
          )}
        />

        <DatePicker
          id="cargo-readiness"
          label="Cargo readiness date"
          disabled={disabled}
          error={errors.cargoReadinessDate?.message}
          {...register("cargoReadinessDate")}
        />

        <TextArea
          id="special-instructions"
          label="Special handling instructions"
          disabled={disabled}
          maxLength={SPECIAL_INSTRUCTIONS_MAX_LENGTH}
          error={errors.specialInstructions?.message}
          helperText={`${instructionsLength}/${SPECIAL_INSTRUCTIONS_MAX_LENGTH}`}
          containerClassName="sm:col-span-2"
          {...register("specialInstructions")}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-section text-text-1">Container quantities</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={
              disabled || fields.length >= EQUIPMENT_TYPE_OPTIONS.length
            }
            onClick={() =>
              append({ equipmentType: nextEquipment, quantity: 1 })
            }
          >
            Add container
          </Button>
        </div>

        {errors.containers?.message || errors.containers?.root?.message ? (
          <p className="text-caption text-error">
            {errors.containers.message ?? errors.containers.root?.message}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
            >
              <Select
                id={`container-equipment-${index}`}
                label="Equipment type"
                options={EQUIPMENT_TYPE_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
                disabled={disabled}
                error={errors.containers?.[index]?.equipmentType?.message}
                {...register(`containers.${index}.equipmentType`)}
              />
              <TextField
                id={`container-quantity-${index}`}
                label="Quantity"
                type="number"
                min={1}
                disabled={disabled}
                error={errors.containers?.[index]?.quantity?.message}
                {...register(`containers.${index}.quantity`, {
                  valueAsNumber: true,
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mb-0.5"
                disabled={disabled || fields.length <= 1}
                onClick={() => remove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

AmendmentForm.displayName = "AmendmentForm";

export default AmendmentForm;
