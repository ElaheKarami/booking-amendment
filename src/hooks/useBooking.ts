import { useQuery } from "@tanstack/react-query";
import { getBooking } from "@/services";
import { normalizeApiError } from "@/services/errorHandling";

export function bookingQueryKey(bookingId: string) {
  return ["booking", bookingId] as const;
}

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: bookingQueryKey(bookingId),
    queryFn: async ({ signal }) => {
      try {
        return await getBooking(bookingId, { signal });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    enabled: Boolean(bookingId),
  });
}
