"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getBooking } from "@/services";
import { normalizeApiError } from "@/services/errorHandling";
import { bookingQueryKey } from "./useBooking";

export function useReloadBooking() {
  const queryClient = useQueryClient();

  return useCallback(
    async (bookingId: string): Promise<Booking> => {
      try {
        return await queryClient.fetchQuery({
          queryKey: bookingQueryKey(bookingId),
          queryFn: async ({ signal }) => getBooking(bookingId, { signal }),
        });
      } catch (error) {
        throw normalizeApiError(error);
      }
    },
    [queryClient],
  );
}
