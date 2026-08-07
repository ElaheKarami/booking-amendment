import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { getVoyages } from "@/services/bookingAmendmentService";
import { ApiError } from "@/services/errorHandling";
import { useVoyages, voyagesQueryKey } from "./useVoyages";

jest.mock("@/services/bookingAmendmentService", () => ({
  getVoyages: jest.fn(),
}));

const mockGetVoyages = jest.mocked(getVoyages);

const search: VoyageSearch = {
  portOfLoading: "CNSHA",
  portOfDischarge: "NLRTM",
  readinessDate: "2026-08-18",
  search: "",
};

const sampleVoyages: VoyageOption[] = [
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
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useVoyages", () => {
  beforeEach(() => {
    mockGetVoyages.mockReset();
  });

  it("uses the voyages query key", () => {
    expect(voyagesQueryKey(search)).toEqual(["voyages", search]);
  });

  it("loads voyages through the service layer", async () => {
    mockGetVoyages.mockResolvedValueOnce(sampleVoyages);

    const { result } = renderHook(() => useVoyages(search), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(sampleVoyages);
    expect(mockGetVoyages).toHaveBeenCalledWith(search, {
      signal: expect.any(AbortSignal),
    });
  });

  it("normalises API errors", async () => {
    mockGetVoyages.mockRejectedValueOnce(
      new ApiError("Unable to load voyages.", 500, ["Unable to load voyages."]),
    );

    const { result } = renderHook(() => useVoyages(search), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(ApiError);
  });
});
