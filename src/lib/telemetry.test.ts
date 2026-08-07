import {
  captureError,
  sanitizeTelemetryProperties,
  track,
} from "./telemetry";

type MutableNodeEnv = { NODE_ENV?: string };

function setNodeEnv(value: string | undefined) {
  (process.env as MutableNodeEnv).NODE_ENV = value;
}

describe("telemetry", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    setNodeEnv(originalEnv);
    jest.restoreAllMocks();
  });

  it("keeps only allowlisted property keys", () => {
    const sanitized = sanitizeTelemetryProperties({
      bookingId: "booking-001",
      baseVersion: 7,
      status: "stale",
      httpStatus: 504,
      errorType: "network",
      customer: "Acme Shipping",
      bookingNumber: "BK-001",
      specialInstructions: "Keep dry.",
    });

    expect(sanitized).toEqual({
      bookingId: "booking-001",
      baseVersion: 7,
      status: "stale",
      httpStatus: 504,
      errorType: "network",
    });
  });

  it("tracks events through the development console sink", () => {
    setNodeEnv("development");
    const info = jest.spyOn(console, "info").mockImplementation(() => undefined);

    track("booking_amendment_opened", {
      bookingId: "booking-001",
      // Sanitizer strips unknown keys passed via object spread at call sites.
      ...({ customer: "Acme Shipping" } as TelemetryProperties),
    });

    expect(info).toHaveBeenCalledWith(
      "[telemetry]",
      "booking_amendment_opened",
      { bookingId: "booking-001" },
    );
  });

  it("captures errors without logging the raw payload in development", () => {
    setNodeEnv("development");
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    captureError(new TypeError("boom"), {
      bookingId: "booking-001",
      errorType: "network",
      httpStatus: 504,
    });

    expect(errorSpy).toHaveBeenCalledWith(
      "[telemetry:error]",
      "TypeError",
      {
        bookingId: "booking-001",
        errorType: "network",
        httpStatus: 504,
      },
    );
  });

  it("is a no-op outside development", () => {
    setNodeEnv("test");
    const info = jest.spyOn(console, "info").mockImplementation(() => undefined);
    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    track("booking_amendment_opened", { bookingId: "booking-001" });
    captureError(new Error("boom"), { bookingId: "booking-001" });

    expect(info).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
