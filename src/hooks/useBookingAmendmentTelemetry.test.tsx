import { renderHook } from "@testing-library/react";
import { TELEMETRY_EVENTS } from "@/constants";
import { track } from "@/lib/telemetry";
import { useBookingAmendmentTelemetry } from "./useBookingAmendmentTelemetry";

jest.mock("@/lib/telemetry", () => ({
  track: jest.fn(),
  captureError: jest.fn(),
}));

const mockTrack = jest.mocked(track);

describe("useBookingAmendmentTelemetry", () => {
  beforeEach(() => {
    mockTrack.mockReset();
  });

  it("tracks booking_amendment_opened once when a booking id becomes available", () => {
    const { rerender } = renderHook(
      ({ bookingId }: { bookingId: string | undefined }) =>
        useBookingAmendmentTelemetry(bookingId),
      { initialProps: { bookingId: undefined as string | undefined } },
    );

    expect(mockTrack).not.toHaveBeenCalled();

    rerender({ bookingId: "booking-001" });

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.BOOKING_AMENDMENT_OPENED,
      { bookingId: "booking-001" },
    );

    rerender({ bookingId: "booking-001" });
    expect(mockTrack).toHaveBeenCalledTimes(1);
  });

  it("tracks again when a different booking id is opened", () => {
    const { rerender } = renderHook(
      ({ bookingId }: { bookingId: string }) =>
        useBookingAmendmentTelemetry(bookingId),
      { initialProps: { bookingId: "booking-001" } },
    );

    expect(mockTrack).toHaveBeenCalledTimes(1);

    rerender({ bookingId: "booking-002" });

    expect(mockTrack).toHaveBeenCalledTimes(2);
    expect(mockTrack).toHaveBeenLastCalledWith(
      TELEMETRY_EVENTS.BOOKING_AMENDMENT_OPENED,
      { bookingId: "booking-002" },
    );
  });
});
