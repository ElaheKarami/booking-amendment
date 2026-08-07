import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BookingAmendmentDetails from "./BookingAmendmentDetails";
import AuthProvider from "@/providers/AuthProvider";
import { useBooking } from "@/hooks";
import { ApiError } from "@/services/errorHandling";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  useBooking: jest.fn(),
  useVoyages: jest.fn(() => ({
    data: [
      {
        id: "voyage-001",
        vesselName: "MV Atlantic Horizon",
        voyageNumber: "AH026W",
        supports40HC: true,
      },
    ],
    isFetching: false,
  })),
}));

const mockUseBooking = jest.mocked(useBooking);

const opsUser: CurrentUser = {
  id: "ops-1",
  displayName: "Ops User",
  roles: ["operations-user"],
};

const sampleBooking: Booking = {
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

function renderDetails(onBack = jest.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    onBack,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider user={opsUser}>
          <BookingAmendmentDetails bookingId="booking-001" onBack={onBack} />
        </AuthProvider>
      </QueryClientProvider>,
    ),
  };
}

describe("BookingAmendmentDetails", () => {
  beforeEach(() => {
    mockUseBooking.mockReset();
  });

  it("shows the workspace skeleton while loading", () => {
    mockUseBooking.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    renderDetails();

    expect(
      screen.getByLabelText("Loading booking workspace"),
    ).toBeInTheDocument();
  });

  it("renders the booking header and editable amendment form after load", () => {
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    renderDetails();

    expect(screen.getByText("BK-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText("v7")).toBeInTheDocument();
    expect(screen.getByText(/UTC/)).toBeInTheDocument();
    expect(screen.getByLabelText("Port of discharge")).toHaveValue(
      "NLRTM — Rotterdam",
    );
    expect(screen.getByLabelText("Cargo readiness date")).toHaveValue(
      "2026-08-18",
    );
    expect(
      screen.getByLabelText("Special handling instructions"),
    ).toHaveValue("Keep dry.");
    expect(screen.getAllByLabelText("Equipment type")).toHaveLength(2);
    expect(screen.queryByLabelText("Customer")).not.toBeInTheDocument();
  });

  it("shows a not-found state for missing bookings", () => {
    mockUseBooking.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError("The requested booking could not be found.", 404, [
        "The requested booking could not be found.",
      ]),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    renderDetails();

    expect(screen.getByText("Booking not found")).toBeInTheDocument();
    expect(
      screen.getByText("The requested booking could not be found."),
    ).toBeInTheDocument();
  });

  it("shows a retryable error state for other API failures", () => {
    mockUseBooking.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiError("Unable to load the booking.", 500, [
        "Unable to load the booking.",
      ]),
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    renderDetails();

    expect(screen.getByText("Unable to load booking")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("leaves without a warning when the draft is clean", async () => {
    const user = userEvent.setup();
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    const { onBack } = renderDetails();

    await user.click(
      screen.getByRole("button", { name: "← Back to workspace" }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("confirms before leaving a dirty draft and keeps it on cancel", async () => {
    const user = userEvent.setup();
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    const { onBack } = renderDetails();

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    await user.click(
      screen.getByRole("button", { name: "← Back to workspace" }),
    );

    expect(onBack).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(onBack).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(instructions).toHaveValue("Keep dry and upright.");
  });

  it("discards and leaves after confirmation when dirty", async () => {
    const user = userEvent.setup();
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    const { onBack } = renderDetails();

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    await user.click(
      screen.getByRole("button", { name: "← Back to workspace" }),
    );
    await user.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("confirms before resetting a dirty draft", async () => {
    const user = userEvent.setup();
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as unknown as ReturnType<typeof useBooking>);

    renderDetails();

    const instructions = screen.getByLabelText(
      "Special handling instructions",
    );
    await user.clear(instructions);
    await user.type(instructions, "Keep dry and upright.");

    await user.click(screen.getByRole("button", { name: "Reset to original" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(instructions).toHaveValue("Keep dry and upright.");

    await user.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(instructions).toHaveValue("Keep dry.");
    expect(
      screen.getByText("No unsaved amendment changes"),
    ).toBeInTheDocument();
  });
});
