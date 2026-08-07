import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { getSubmissionStatus } from "@/services/bookingAmendmentService/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import {
  submissionStatusQueryKey,
  useSubmissionStatus,
} from "./useSubmissionStatus";

jest.mock("@/services/bookingAmendmentService/bookingAmendmentService", () => ({
  getSubmissionStatus: jest.fn(),
}));

jest.mock("@/services/errorHandling", () => {
  const actual = jest.requireActual<typeof import("@/services/errorHandling")>(
    "@/services/errorHandling",
  );
  return {
    ...actual,
    showSuccessMessage: jest.fn(),
    showWarningMessage: jest.fn(),
  };
});

const mockGetSubmissionStatus = jest.mocked(getSubmissionStatus);
const { showSuccessMessage, showWarningMessage } = jest.requireMock<
  typeof import("@/services/errorHandling")
>("@/services/errorHandling");

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

describe("useSubmissionStatus", () => {
  beforeEach(() => {
    mockGetSubmissionStatus.mockReset();
    jest.mocked(showSuccessMessage).mockReset();
    jest.mocked(showWarningMessage).mockReset();
  });

  it("uses the documented query key shape", () => {
    expect(submissionStatusQueryKey("submission-001")).toEqual([
      "amendment-submission-status",
      "submission-001",
    ]);
  });

  it("checks status by reference and reports the result", async () => {
    mockGetSubmissionStatus.mockResolvedValueOnce({
      id: "submission-001",
      status: "submitted",
    });

    const { result } = renderHook(() => useSubmissionStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.checkStatus("status-lookup-key");
    });

    expect(mockGetSubmissionStatus).toHaveBeenCalledWith("status-lookup-key");
    expect(result.current.status).toEqual({
      id: "submission-001",
      status: "submitted",
    });
    expect(showSuccessMessage).toHaveBeenCalledWith(
      "Submission submission-001 · status submitted",
    );
  });

  it("keeps the outcome unknown when status lookup fails", async () => {
    mockGetSubmissionStatus.mockRejectedValueOnce(
      new ApiError(
        "The amendment submission could not be found.",
        404,
        ["The amendment submission could not be found."],
        {
          type: "business-rule",
          code: "SUBMISSION_NOT_FOUND",
          message: "The amendment submission could not be found.",
        },
      ),
    );

    const { result } = renderHook(() => useSubmissionStatus(), {
      wrapper: createWrapper(),
    });

    let checked: AmendmentSubmissionStatus | null = null;
    await act(async () => {
      checked = await result.current.checkStatus("missing-key");
    });

    expect(checked).toBeNull();
    expect(result.current.status).toBeNull();
    expect(result.current.error?.status).toBe(404);
    expect(showWarningMessage).toHaveBeenCalledWith(
      "The amendment submission could not be found.",
    );
  });
});
