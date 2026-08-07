export type ServiceWorkerCachePolicy =
  | "cache-first"
  | "network-first"
  | "network-only"
  | "precache-shell";

const STATIC_ASSET_PATTERN =
  /^\/(_next\/static\/|favicon\.ico$|.*\.(?:js|css|png|jpg|jpeg|gif|svg|webp|woff2?)$)/i;

const NETWORK_FIRST_API_PATTERN =
  /^\/api\/(bookings\/[^/]+(?:\/latest-version)?|voyages|amendment-submissions\/[^/]+\/status)(?:\?|$)/;

const NETWORK_ONLY_API_PATTERN =
  /^\/api\/bookings\/[^/]+\/amendments(?:\/assess)?(?:\?|$)/;

function toPathWithSearch(pathnameWithSearch: string): string {
  if (!pathnameWithSearch.startsWith("http")) {
    return pathnameWithSearch;
  }

  const url = new URL(pathnameWithSearch);
  return `${url.pathname}${url.search}`;
}

export function resolveServiceWorkerCachePolicy(
  pathnameWithSearch: string,
  method = "GET",
): ServiceWorkerCachePolicy {
  const normalizedMethod = method.toUpperCase();
  const path = toPathWithSearch(pathnameWithSearch);

  // Assessment and amendment submission must never be served from cache.
  if (NETWORK_ONLY_API_PATTERN.test(path)) {
    return "network-only";
  }

  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") {
    return "network-only";
  }

  if (path === "/" || path === "/index.html") {
    return "precache-shell";
  }

  if (STATIC_ASSET_PATTERN.test(path)) {
    return "cache-first";
  }

  if (NETWORK_FIRST_API_PATTERN.test(path)) {
    return "network-first";
  }

  if (path.startsWith("/api/")) {
    return "network-only";
  }

  // App-shell navigations: network first with precached shell fallback.
  return "precache-shell";
}

export const SERVICE_WORKER_CACHE_NAMES = {
  static: "booking-amendment-static-v1",
  shell: "booking-amendment-shell-v1",
  api: "booking-amendment-api-v1",
} as const;

export const SERVICE_WORKER_PRECACHE_URLS = ["/"] as const;
