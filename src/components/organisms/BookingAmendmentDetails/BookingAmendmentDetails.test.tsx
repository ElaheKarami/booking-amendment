import { render, screen } from "@testing-library/react";
import BookingAmendmentDetails from "./BookingAmendmentDetails";
import AuthProvider from "@/providers/AuthProvider";
import { useBooking } from "@/hooks";
import { ApiError } from "@/services/errorHandling";

jest.mock("@/hooks", () => ({
  useBooking: jest.fn(),
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

function renderDetails() {
  return render(
    <AuthProvider user={opsUser}>
      <BookingAmendmentDetails bookingId="booking-001" onBack={jest.fn()} />
    </AuthProvider>,
  );
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
    } as ReturnType<typeof useBooking>);

    renderDetails();

    expect(
      screen.getByLabelText("Loading booking workspace"),
    ).toBeInTheDocument();
  });

  it("renders the booking header after a successful load", async () => {
    mockUseBooking.mockReturnValue({
      data: sampleBooking,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as ReturnType<typeof useBooking>);

    renderDetails();

    expect(screen.getByText("BK-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.getByText(/v7 · updated/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("NLRTM")).toBeInTheDocument();
    expect(screen.getByDisplayValue("AH026W")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("2 × 20GP, 1 × 40HC"),
    ).toBeInTheDocument();
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
    } as ReturnType<typeof useBooking>);

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
    } as ReturnType<typeof useBooking>);

    renderDetails();

    expect(screen.getByText("Unable to load booking")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });
});
