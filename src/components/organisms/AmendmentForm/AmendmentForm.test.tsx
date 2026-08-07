import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AmendmentForm from "./AmendmentForm";
import type { BookingAmendmentFormValues } from "@/schemas/bookingAmendmentSchema";

jest.mock("@/hooks", () => ({
  useVoyages: jest.fn(() => ({
    data: [
      {
        id: "voyage-001",
        vesselName: "MV Atlantic Horizon",
        voyageNumber: "AH026W",
        supports40HC: true,
      },
      {
        id: "voyage-002",
        vesselName: "MV Pacific Star",
        voyageNumber: "PS027W",
        supports40HC: false,
      },
    ],
    isFetching: false,
  })),
}));

const defaultValues: BookingAmendmentFormValues = {
  bookingId: "booking-001",
  baseVersion: 7,
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  cargoReadinessDate: "2026-08-18",
  containers: [
    { equipmentType: "20GP", quantity: 2 },
    { equipmentType: "40HC", quantity: 1 },
  ],
  specialInstructions: "Keep dry.",
};

function renderForm(
  props?: Partial<{
    onDirtyChange: (isDirty: boolean) => void;
    requestDiscard: (onConfirm: () => void) => void;
  }>,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AmendmentForm
        defaultValues={defaultValues}
        portOfLoading="CNSHA"
        currentVoyageLabel="MV Atlantic Horizon · AH026W"
        requestDiscard={props?.requestDiscard ?? ((onConfirm) => onConfirm())}
        onDirtyChange={props?.onDirtyChange}
      />
    </QueryClientProvider>,
  );
}

describe("AmendmentForm", () => {
  it("renders only the editable amendment fields", () => {
    renderForm();

    expect(screen.getByLabelText("Port of discharge")).toBeInTheDocument();
    expect(screen.getByLabelText("Planned voyage")).toBeInTheDocument();
    expect(screen.getByLabelText("Cargo readiness date")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Special handling instructions"),
    ).toBeInTheDocument();
    expect(screen.getByText("Container quantities")).toBeInTheDocument();
    expect(screen.queryByLabelText("Customer")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Port of loading")).not.toBeInTheDocument();
  });

  it("adds and removes container rows", async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.getAllByLabelText("Equipment type")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Add container" }));
    expect(screen.getAllByLabelText("Equipment type")).toHaveLength(3);

    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]!);
    expect(screen.getAllByLabelText("Equipment type")).toHaveLength(2);
  });

  it("marks the draft dirty after a meaningful edit and resets", async () => {
    const user = userEvent.setup();
    const onDirtyChange = jest.fn();
    renderForm({ onDirtyChange });

    expect(
      screen.getByText("No unsaved amendment changes"),
    ).toBeInTheDocument();

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    expect(
      screen.getByText("Unsaved changes in the amendment draft"),
    ).toBeInTheDocument();
    expect(onDirtyChange).toHaveBeenCalledWith(true);

    await user.click(screen.getByRole("button", { name: "Reset to original" }));

    expect(
      screen.getByText("No unsaved amendment changes"),
    ).toBeInTheDocument();
    expect(instructions).toHaveValue("Keep dry.");
    expect(onDirtyChange).toHaveBeenCalledWith(false);
  });

  it("asks requestDiscard before resetting", async () => {
    const user = userEvent.setup();
    const requestDiscard = jest.fn();
    renderForm({ requestDiscard });

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    await user.click(screen.getByRole("button", { name: "Reset to original" }));

    expect(requestDiscard).toHaveBeenCalledTimes(1);
    expect(instructions).toHaveValue("Keep dry and upright.");
  });
});
