import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { TELEMETRY_EVENTS } from "@/constants";
import { captureError, track } from "@/lib/telemetry";
import { assessAmendment } from "@/services/bookingAmendmentService/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import { useImpactAssessment } from "./useImpactAssessment";

jest.mock("@/services/bookingAmendmentService/bookingAmendmentService", () => ({
  assessAmendment: jest.fn(),
}));

jest.mock("@/lib/telemetry", () => ({
  track: jest.fn(),
  captureError: jest.fn(),
}));

const mockAssessAmendment = jest.mocked(assessAmendment);
const mockTrack = jest.mocked(track);
const mockCaptureError = jest.mocked(captureError);


const draft: BookingAmendmentDraft = {
  bookingId: "booking-001",
  baseVersion: 7,
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  cargoReadinessDate: "2026-08-18",
  containers: [{ equipmentType: "20GP", quantity: 2 }],
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useImpactAssessment", () => {
  beforeEach(() => {
    mockAssessAmendment.mockReset();
    mockTrack.mockReset();
    mockCaptureError.mockReset();
  });

  it("starts not-calculated and disables submit", () => {
    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("not-calculated");
    expect(result.current.canSubmitAssessment).toBe(false);
    expect(result.current.impact).toBeNull();
  });

  it("recalculates with booking id, base version, and the current draft", async () => {
    mockAssessAmendment.mockResolvedValueOnce(impact);

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    expect(mockAssessAmendment).toHaveBeenCalledWith(
      {
        bookingId: "booking-001",
        baseVersion: 7,
        amendment: draft,
      },
      { signal: expect.any(AbortSignal) },
    );
    expect(result.current.status).toBe("valid");
    expect(result.current.impact).toEqual(impact);
    expect(result.current.hasBlockingValidation).toBe(false);
    expect(result.current.canSubmitAssessment).toBe(true);
  });

  it("disables submit eligibility when a valid assessment has error-severity validations", async () => {
    mockAssessAmendment.mockResolvedValueOnce({
      ...impact,
      validations: [
        {
          field: "voyageId",
          severity: "error",
          message: "Voyage does not support 40HC.",
        },
      ],
    });

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    expect(result.current.status).toBe("valid");
    expect(result.current.hasBlockingValidation).toBe(true);
    expect(result.current.canSubmitAssessment).toBe(false);
  });

  it("marks a valid assessment stale when the draft changes and keeps the result", async () => {
    mockAssessAmendment.mockResolvedValueOnce(impact);

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    act(() => {
      result.current.syncDraft({
        ...draft,
        voyageId: "voyage-002",
      });
    });

    expect(result.current.status).toBe("stale");
    expect(result.current.impact).toEqual(impact);
    expect(result.current.canSubmitAssessment).toBe(false);
  });

  it("marks the retained impact stale when markStale is called", async () => {
    mockAssessAmendment.mockResolvedValueOnce(impact);

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    act(() => {
      result.current.markStale();
    });

    expect(result.current.status).toBe("stale");
    expect(result.current.impact).toEqual(impact);
    expect(result.current.canSubmitAssessment).toBe(false);

    act(() => {
      result.current.syncDraft(draft);
    });

    expect(result.current.status).toBe("stale");
  });

  it("restores valid when the draft returns to the assessed fingerprint", async () => {
    mockAssessAmendment.mockResolvedValueOnce(impact);

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    act(() => {
      result.current.syncDraft({ ...draft, voyageId: "voyage-002" });
    });
    act(() => {
      result.current.syncDraft(draft);
    });

    expect(result.current.status).toBe("valid");
    expect(result.current.canSubmitAssessment).toBe(true);
  });

  it("enters failed state with a normalised error", async () => {
    mockAssessAmendment.mockRejectedValueOnce(
      new ApiError("Assessment timed out.", 504, ["Assessment timed out."], {
        type: "network",
        retryable: true,
      }),
    );

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    expect(result.current.status).toBe("failed");
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect(result.current.canSubmitAssessment).toBe(false);
  });

  it("ignores an outdated response after a newer recalculation", async () => {
    let resolveFirst: ((value: AmendmentImpact) => void) | undefined;
    const firstImpact: AmendmentImpact = {
      ...impact,
      assessmentVersion: "assessment-old",
    };
    const secondImpact: AmendmentImpact = {
      ...impact,
      assessmentVersion: "assessment-new",
    };

    mockAssessAmendment
      .mockImplementationOnce(
        () =>
          new Promise<AmendmentImpact>((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockResolvedValueOnce(secondImpact);

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.recalculate(draft);
    });

    await waitFor(() => expect(mockAssessAmendment).toHaveBeenCalledTimes(1));

    await act(async () => {
      await result.current.recalculate({
        ...draft,
        voyageId: "voyage-002",
      });
    });

    await act(async () => {
      resolveFirst?.(firstImpact);
      await firstPromise;
    });

    expect(result.current.status).toBe("valid");
    expect(result.current.impact?.assessmentVersion).toBe("assessment-new");
  });

  it("emits assessment lifecycle telemetry without sensitive draft fields", async () => {
    mockAssessAmendment
      .mockResolvedValueOnce(impact)
      .mockRejectedValueOnce(
        new ApiError("Assessment timed out.", 504, ["Assessment timed out."], {
          type: "network",
          retryable: true,
        }),
      );

    const { result } = renderHook(() => useImpactAssessment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.recalculate(draft);
    });

    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.IMPACT_ASSESSMENT_REQUESTED,
      expect.objectContaining({
        bookingId: "booking-001",
        baseVersion: 7,
        status: "calculating",
      }),
    );
    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.IMPACT_ASSESSMENT_SUCCEEDED,
      expect.objectContaining({
        bookingId: "booking-001",
        status: "valid",
      }),
    );

    act(() => {
      result.current.syncDraft({ ...draft, voyageId: "voyage-002" });
    });

    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.BOOKING_AMENDMENT_CHANGED,
      { bookingId: "booking-001", baseVersion: 7 },
    );
    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.ASSESSMENT_BECAME_STALE,
      expect.objectContaining({
        bookingId: "booking-001",
        status: "stale",
      }),
    );

    const staleCalls = mockTrack.mock.calls.filter(
      ([event]) => event === TELEMETRY_EVENTS.ASSESSMENT_BECAME_STALE,
    );
    expect(staleCalls).toHaveLength(1);

    act(() => {
      result.current.syncDraft({ ...draft, voyageId: "voyage-003" });
    });
    expect(
      mockTrack.mock.calls.filter(
        ([event]) => event === TELEMETRY_EVENTS.ASSESSMENT_BECAME_STALE,
      ),
    ).toHaveLength(1);

    mockTrack.mockClear();
    mockCaptureError.mockClear();

    await act(async () => {
      await result.current.recalculate({ ...draft, voyageId: "voyage-003" });
    });

    expect(mockTrack).toHaveBeenCalledWith(
      TELEMETRY_EVENTS.IMPACT_ASSESSMENT_FAILED,
      expect.objectContaining({
        bookingId: "booking-001",
        status: "failed",
        httpStatus: 504,
        errorType: "network",
      }),
    );
    expect(mockCaptureError).toHaveBeenCalledWith(
      expect.any(ApiError),
      expect.objectContaining({
        bookingId: "booking-001",
        errorType: "network",
      }),
    );
    expect(JSON.stringify(mockTrack.mock.calls)).not.toContain("Keep dry.");
    expect(JSON.stringify(mockCaptureError.mock.calls)).not.toContain(
      "Keep dry.",
    );
  });
});
