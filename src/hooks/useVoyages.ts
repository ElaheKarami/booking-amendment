import { useQuery } from "@tanstack/react-query";
import { getVoyages } from "@/services/bookingAmendmentService";
import { normalizeApiError } from "@/services/errorHandling";

export function voyagesQueryKey(search: VoyageSearch) {
  return ["voyages", search] as const;
}

export function useVoyages(search: VoyageSearch, enabled = true) {
  const canSearch = Boolean(
    search.portOfLoading &&
      search.portOfDischarge &&
      search.readinessDate,
  );

  return useQuery({
    queryKey: voyagesQueryKey(search),
    queryFn: async ({ signal }) => {
      try {
        return await getVoyages(search, { signal });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    enabled: enabled && canSearch,
  });
}
