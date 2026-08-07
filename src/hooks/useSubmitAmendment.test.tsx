import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { submitAmendment } from "@/services/bookingAmendmentService";
import {
  ApiError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
} from "@/services/errorHandling";
import { useSubmitAmendment } from "./useSubmitAmendment";

jest.mock("@/services/bookingAmendmentService", () => ({
  submitAmendment: jest.fn(),
}));

jest.mock("@/services/errorHandling", () => {
  const actual = jest.requireActual<typeof import("@/services/errorHandling")>(
    "@/services/errorHandling",
  );
  return {
    ...actual,
    showSuccessMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
  };
});

const mockSubmitAmendment = jest.mocked(submitAmendment);
const mockShowSuccessMessage = jest.mocked(showSuccessMessage);
const mockShowErrorMessage = jest.mocked(showErrorMessage);
const mockShowWarningMessage = jest.mocked(showWarningMessage);

const draft: BookingAmendmentDraft = {
  bookingId: "booking-001",
  baseVersion: 7,
  portOfDischarge: "NLRTM",
  voyageId: "voyage-001",
  cargoReadinessDate: "2026-08-18",
  containers: [{ equipmentType: "20GP", quantity: 2 }],
  specialInstructions: "Keep dry.",
};

const assessmentVersion = "assessment-7-voyage-001";

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

describe("useSubmitAmendment", () => {
  beforeEach(() => {
    mockSubmitAmendment.mockReset();
    mockShowSuccessMessage.mockReset();
    mockShowErrorMessage.mockReset();
    mockShowWarningMessage.mockReset();
  });

  it("starts idle with no submission", () => {
    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    expect(result.current.status).toBe("idle");
    expect(result.current.submission).toBeNull();
    expect(result.current.idempotencyKey).toBeNull();
    expect(result.current.isSubmitting).toBe(false);
  });

  it("submits the full command including an idempotency key", async () => {
    mockSubmitAmendment.mockResolvedValueOnce({
      id: "submission-001",
      status: "submitted",
      idempotencyKey: "ignored-by-client",
      alreadyProcessed: false,
    });

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(mockSubmitAmendment).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "booking-001",
        baseVersion: 7,
        assessmentVersion,
        amendment: draft,
        idempotencyKey: expect.any(String),
      }),
    );
    expect(result.current.status).toBe("succeeded");
    expect(result.current.submission?.id).toBe("submission-001");
    expect(result.current.idempotencyKey).toEqual(
      expect.stringMatching(/./),
    );
    expect(mockShowSuccessMessage).toHaveBeenCalledWith(
      "Amendment accepted · submission-001",
    );
  });

  it("ignores a second submit while a request is in flight", async () => {
    let resolveFirst:
      | ((value: AmendmentSubmission) => void)
      | undefined;
    mockSubmitAmendment.mockImplementationOnce(
      () =>
        new Promise<AmendmentSubmission>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.submit({ draft, assessmentVersion });
    });

    await waitFor(() => expect(mockSubmitAmendment).toHaveBeenCalledTimes(1));
    expect(result.current.status).toBe("submitting");

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(mockSubmitAmendment).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst?.({
        id: "submission-001",
        status: "submitted",
        idempotencyKey: result.current.idempotencyKey ?? "key",
        alreadyProcessed: false,
      });
      await firstPromise;
    });

    expect(result.current.status).toBe("succeeded");
  });

  it("reuses the same idempotency key for a safe retry after unknown", async () => {
    mockSubmitAmendment
      .mockRejectedValueOnce(
        new ApiError(
          "The amendment may have been submitted. Check its status.",
          504,
          ["The amendment may have been submitted. Check its status."],
          {
            type: "unknown",
            message: "The amendment may have been submitted. Check its status.",
          },
        ),
      )
      .mockResolvedValueOnce({
        id: "submission-001",
        status: "submitted",
        idempotencyKey: "retry-key",
        alreadyProcessed: true,
      });

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(result.current.status).toBe("unknown");
    const firstKey = result.current.idempotencyKey;
    expect(firstKey).toEqual(expect.any(String));
    expect(mockShowWarningMessage).toHaveBeenCalledWith(
      `Submission status unknown · reference ${firstKey}`,
    );

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(mockSubmitAmendment).toHaveBeenCalledTimes(2);
    expect(mockSubmitAmendment.mock.calls[0][0].idempotencyKey).toBe(firstKey);
    expect(mockSubmitAmendment.mock.calls[1][0].idempotencyKey).toBe(firstKey);
    expect(result.current.status).toBe("succeeded");
  });

  it("maps validation failures to rejected and keeps the error message", async () => {
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

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(result.current.status).toBe("rejected");
    expect(result.current.error?.reasons[0]).toBe(
      "Cargo readiness is no longer valid.",
    );
    expect(result.current.submission).toBeNull();
    expect(mockShowErrorMessage).toHaveBeenCalledWith(
      "Cargo readiness is no longer valid.",
      { forceShow: true },
    );
  });

  it("maps booking version conflicts to conflict", async () => {
    mockSubmitAmendment.mockRejectedValueOnce(
      new ApiError(
        "The booking was modified by another user.",
        409,
        ["The booking was modified by another user."],
        { type: "conflict", currentVersion: 8 },
      ),
    );

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(result.current.status).toBe("conflict");
    expect(result.current.error?.applicationError).toEqual({
      type: "conflict",
      currentVersion: 8,
    });
    expect(mockShowWarningMessage).toHaveBeenCalledWith(
      "The booking was modified by another user.",
    );
  });

  it("maps network timeouts after send to unknown", async () => {
    mockSubmitAmendment.mockRejectedValueOnce(
      new ApiError("A network error occurred. Please try again.", 504, [
        "A network error occurred. Please try again.",
      ], {
        type: "network",
        retryable: true,
      }),
    );

    const { result } = renderHook(() => useSubmitAmendment(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.submit({ draft, assessmentVersion });
    });

    expect(result.current.status).toBe("unknown");
    expect(mockShowWarningMessage).toHaveBeenCalledWith(
      expect.stringMatching(/^Submission status unknown · reference /),
    );
  });
});
