import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthProvider from "@/providers/AuthProvider";
import {
  assessAmendment,
  submitAmendment,
} from "@/services/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import BookingAmendmentWorkspace from "./BookingAmendmentWorkspace";

jest.mock("@/services/bookingAmendmentService", () => ({
  assessAmendment: jest.fn(),
  submitAmendment: jest.fn(),
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
const mockSubmitAmendment = jest.mocked(submitAmendment);

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
    items: [
      {
        code: "OCEAN",
        description: "Ocean freight",
        previousAmount: 4_800,
        revisedAmount: 5_100,
      },
    ],
  },
  approvals: [],
  validations: [],
  assessmentVersion: "assessment-7-voyage-001",
};

const blockingImpact: AmendmentImpact = {
  ...impact,
  schedule: { feasible: false, warnings: ["Not feasible for cut-off."] },
  validations: [
    {
      field: "voyageId",
      severity: "error",
      message: "The selected voyage does not support 40HC equipment.",
    },
  ],
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

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => isOnline,
  });
}

async function recalculateToValid(user: ReturnType<typeof userEvent.setup>) {
  mockAssessAmendment.mockResolvedValueOnce(impact);
  await user.click(screen.getByRole("button", { name: "Recalculate" }));
  await waitFor(() => {
    expect(
      screen.getByText("Assessment matches the current draft"),
    ).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeEnabled();
  });
}

describe("BookingAmendmentWorkspace", () => {
  beforeEach(() => {
    mockAssessAmendment.mockReset();
    mockSubmitAmendment.mockReset();
    setNavigatorOnline(true);
  });

  it("disables submit before assessment", () => {
    renderWorkspace();

    expect(
      screen.getByText("Not calculated — run Recalculate to assess impact"),
    ).toBeInTheDocument();
    expect(screen.getByText("No impact calculated")).toBeInTheDocument();
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
    expect(screen.getByText("Feasible")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Increase")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeEnabled();
  });

  it("keeps submit disabled when the assessment has a blocking validation", async () => {
    const user = userEvent.setup();
    mockAssessAmendment.mockResolvedValueOnce(blockingImpact);

    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "Recalculate" }));

    await waitFor(() => {
      expect(
        screen.getByText("The selected voyage does not support 40HC equipment."),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Blocking")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
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
    expect(screen.getByText("Outdated result")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
  });

  it("disables submit while offline", async () => {
    const user = userEvent.setup();

    renderWorkspace();
    await recalculateToValid(user);

    setNavigatorOnline(false);
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });

    await waitFor(() => {
      expect(
        screen.getByText("Offline — reconnect before submitting"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();

    setNavigatorOnline(true);
    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });
  });

  it("submits the command and shows the accepted amendment id", async () => {
    const user = userEvent.setup();
    mockSubmitAmendment.mockResolvedValueOnce({
      id: "submission-001",
      status: "submitted",
      idempotencyKey: "key-1",
      alreadyProcessed: false,
    });

    renderWorkspace();
    await recalculateToValid(user);

    await user.click(screen.getByRole("button", { name: "Submit amendment" }));

    await waitFor(() => {
      expect(
        screen.getByText("Amendment accepted · submission-001"),
      ).toBeInTheDocument();
    });

    expect(mockSubmitAmendment).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "booking-001",
        baseVersion: 7,
        assessmentVersion: "assessment-7-voyage-001",
        amendment: expect.objectContaining({
          voyageId: "voyage-001",
          bookingId: "booking-001",
        }),
        idempotencyKey: expect.any(String),
      }),
    );
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
    expect(
      screen.getByLabelText("Special handling instructions"),
    ).toHaveValue("Keep dry.");
  });

  it("shows rejection feedback and preserves the draft", async () => {
    const user = userEvent.setup();
    mockSubmitAmendment.mockRejectedValueOnce(
      new ApiError(
        "Cargo readiness is no longer valid.",
        422,
        ["Cargo readiness is no longer valid."],
        {
          type: "validation",
          fields: {
            cargoReadinessDate: ["Cargo readiness is no longer valid."],
          },
        },
      ),
    );

    renderWorkspace();
    await recalculateToValid(user);

    await user.click(screen.getByRole("button", { name: "Submit amendment" }));

    await waitFor(() => {
      expect(
        screen.getByText("Cargo readiness is no longer valid."),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByLabelText("Special handling instructions"),
    ).toHaveValue("Keep dry.");
  });

  it("shows conflict feedback without clearing the draft", async () => {
    const user = userEvent.setup();
    mockSubmitAmendment.mockRejectedValueOnce(
      new ApiError(
        "The booking was modified by another user.",
        409,
        ["The booking was modified by another user."],
        { type: "conflict", currentVersion: 8 },
      ),
    );

    renderWorkspace();
    await recalculateToValid(user);

    await user.click(screen.getByRole("button", { name: "Submit amendment" }));

    await waitFor(() => {
      expect(
        screen.getByText("The booking was modified by another user."),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByLabelText("Special handling instructions"),
    ).toHaveValue("Keep dry.");
  });

  it("prevents duplicate clicks while submitting and shows loading", async () => {
    const user = userEvent.setup();
    let resolveSubmit: ((value: AmendmentSubmission) => void) | undefined;
    mockSubmitAmendment.mockImplementationOnce(
      () =>
        new Promise<AmendmentSubmission>((resolve) => {
          resolveSubmit = resolve;
        }),
    );

    renderWorkspace();
    await recalculateToValid(user);

    await user.click(screen.getByRole("button", { name: "Submit amendment" }));

    expect(screen.getByText("Submitting amendment…")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Submit amendment" }),
    ).toBeDisabled();
    expect(mockSubmitAmendment).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Submit amendment" }));
    expect(mockSubmitAmendment).toHaveBeenCalledTimes(1);

    resolveSubmit?.({
      id: "submission-001",
      status: "submitted",
      idempotencyKey: "key-1",
      alreadyProcessed: false,
    });

    await waitFor(() => {
      expect(
        screen.getByText("Amendment accepted · submission-001"),
      ).toBeInTheDocument();
    });
  });
});
