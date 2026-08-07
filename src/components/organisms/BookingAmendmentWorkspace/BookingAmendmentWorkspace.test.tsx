import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthProvider from "@/providers/AuthProvider";
import { assessAmendment } from "@/services/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import BookingAmendmentWorkspace from "./BookingAmendmentWorkspace";

jest.mock("@/services/bookingAmendmentService", () => ({
  assessAmendment: jest.fn(),
  getVoyages: jest.fn().mockResolvedValue([
    {
      id: "voyage-001",
      vesselName: "MV Atlantic Horizon",
      voyageNumber: "AH026W",
      portOfLoading: "CNSHA",
      portOfDischarge: "NLRTM",
      departureDate: "2026-08-24",
      cutOffDate: "2026-08-19",
      supports40HC: true,
    },
  ]),
}));

const mockAssessAmendment = jest.mocked(assessAmendment);

const opsUser: CurrentUser = {
  id: "ops-1",
  displayName: "Ops User",
  roles: ["operations-user"],
};

const booking: Booking = {
  id: "booking-001",
  bookingNumber: "BK-2026-001",
  customer: "Northstar Imports",
  status: "Confirmed",
  version: 7,
  lastUpdated: "2026-08-07T08:30:00.000Z",
  portOfLoading: "CNSHA",
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  vesselName: "MV Atlantic Horizon",
  voyageNumber: "AH026W",
  cargoReadinessDate: "2026-08-18",
  containers: [
    { equipmentType: "20GP", quantity: 2 },
    { equipmentType: "40HC", quantity: 1 },
  ],
  shipmentTerms: "FOB Shanghai",
  estimatedCharges: { total: 4_800, currency: "USD" },
  specialInstructions: "Keep dry.",
};

const impact: AmendmentImpact = {
  schedule: { feasible: true, warnings: [] },
  equipment: { available: true, unavailableItems: [] },
  charges: {
    currentTotal: 4_800,
    revisedTotal: 5_100,
    difference: 300,
    currency: "USD",
    items: [],
  },
  approvals: [],
  validations: [],
  assessmentVersion: "assessment-7-voyage-001",
};

function renderWorkspace() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider user={opsUser}>
        <BookingAmendmentWorkspace
          booking={booking}
          canEdit
          canSubmit
          requestDiscard={(onConfirm) => onConfirm()}
        />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("BookingAmendmentWorkspace", () => {
  beforeEach(() => {
    mockAssessAmendment.mockReset();
  });

  it("disables submit before assessment", () => {
    renderWorkspace();

    expect(
      screen.getByText("Not calculated — run Recalculate to assess impact"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
  });

  it("recalculates with the current draft and enables submit when valid", async () => {
    const user = userEvent.setup();
    mockAssessAmendment.mockResolvedValueOnce(impact);

    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    await waitFor(() => {
      expect(
        screen.getByText("Assessment matches the current draft"),
      ).toBeInTheDocument();
    });

    expect(mockAssessAmendment).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "booking-001",
        baseVersion: 7,
        amendment: expect.objectContaining({
          voyageId: "voyage-001",
          portOfDischarge: "NLRTM",
        }),
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeEnabled();
  });

  it("disables submit while calculating", async () => {
    const user = userEvent.setup();
    let resolveAssessment: ((value: AmendmentImpact) => void) | undefined;
    mockAssessAmendment.mockImplementationOnce(
      () =>
        new Promise<AmendmentImpact>((resolve) => {
          resolveAssessment = resolve;
        }),
    );

    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    expect(screen.getByText("Calculating impact…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Recalculate" }),
    ).toBeDisabled();

    resolveAssessment?.(impact);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Submit amendment" }),
      ).toBeEnabled();
    });
  });

  it("shows failure feedback and keeps submit disabled", async () => {
    const user = userEvent.setup();
    mockAssessAmendment.mockRejectedValueOnce(
      new ApiError("Assessment timed out.", 504, ["Assessment timed out."], {
        type: "network",
        retryable: true,
      }),
    );

    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    await waitFor(() => {
      expect(screen.getByText("Assessment timed out.")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
  });

  it("marks the assessment stale after a relevant form edit", async () => {
    const user = userEvent.setup();
    mockAssessAmendment.mockResolvedValueOnce(impact);

    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recalculate" }));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Submit amendment" }),
      ).toBeEnabled();
    });

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    await waitFor(() => {
      expect(
        screen.getByText("Draft changed — recalculate before submitting"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
  });
});
