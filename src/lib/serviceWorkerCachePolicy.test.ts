import {
  resolveServiceWorkerCachePolicy,
  SERVICE_WORKER_PRECACHE_URLS,
} from "./serviceWorkerCachePolicy";

describe("resolveServiceWorkerCachePolicy", () => {
  it("uses cache-first for static assets", () => {
    expect(resolveServiceWorkerCachePolicy("/_next/static/chunk.js")).toBe(
      "cache-first",
    );
    expect(resolveServiceWorkerCachePolicy("/favicon.ico")).toBe("cache-first");
    expect(resolveServiceWorkerCachePolicy("/logo.svg")).toBe("cache-first");
  });

  it("precaches the app shell root", () => {
    expect(resolveServiceWorkerCachePolicy("/")).toBe("precache-shell");
    expect(SERVICE_WORKER_PRECACHE_URLS).toEqual(["/"]);
  });

  it("uses network-first for booking, voyages, and submission status", () => {
    expect(resolveServiceWorkerCachePolicy("/api/bookings/booking-001")).toBe(
      "network-first",
    );
    expect(
      resolveServiceWorkerCachePolicy("/api/bookings/booking-001/latest-version"),
    ).toBe("network-first");
    expect(
      resolveServiceWorkerCachePolicy(
        "/api/voyages?portOfLoading=CNSHA&portOfDischarge=NLRTM",
      ),
    ).toBe("network-first");
    expect(
      resolveServiceWorkerCachePolicy(
        "/api/amendment-submissions/submission-001/status",
      ),
    ).toBe("network-first");
  });

  it("forces network-only for assessment and amendment submission", () => {
    expect(
      resolveServiceWorkerCachePolicy(
        "/api/bookings/booking-001/amendments/assess",
        "POST",
      ),
    ).toBe("network-only");
    expect(
      resolveServiceWorkerCachePolicy(
        "/api/bookings/booking-001/amendments",
        "POST",
      ),
    ).toBe("network-only");
    expect(
      resolveServiceWorkerCachePolicy(
        "/api/bookings/booking-001/amendments/assess",
        "GET",
      ),
    ).toBe("network-only");
  });

  it("defaults other mutating requests to network-only", () => {
    expect(resolveServiceWorkerCachePolicy("/api/other", "PUT")).toBe(
      "network-only",
    );
  });
});
