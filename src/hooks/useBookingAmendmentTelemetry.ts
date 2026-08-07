"use client";

import { useEffect, useRef } from "react";
import { TELEMETRY_EVENTS } from "@/constants";
import { track } from "@/lib/telemetry";

/** Fires `booking_amendment_opened` once per loaded booking id. */
export function useBookingAmendmentTelemetry(bookingId: string | undefined) {
  const openedForBookingIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    if (openedForBookingIdRef.current === bookingId) return;

    openedForBookingIdRef.current = bookingId;
    track(TELEMETRY_EVENTS.BOOKING_AMENDMENT_OPENED, { bookingId });
  }, [bookingId]);
}
