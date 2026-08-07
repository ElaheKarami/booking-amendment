/* Booking amendment service worker — dependency-free cache policies.
 *
 * Policies (same-origin only):
 * - Static assets: Cache First
 * - App shell (/): Precache, then Network First with shell fallback
 * - Booking / voyages / submission status GET: Network First
 * - Assessment / amendment POST: Network Only (never cached, never queued)
 */

const CACHE_NAMES = {
  static: "booking-amendment-static-v1",
  shell: "booking-amendment-shell-v1",
  api: "booking-amendment-api-v1",
};

const PRECACHE_URLS = ["/"];

const STATIC_ASSET_PATTERN =
  /^\/(_next\/static\/|favicon\.ico$|.*\.(?:js|css|png|jpg|jpeg|gif|svg|webp|woff2?)$)/i;

const NETWORK_FIRST_API_PATTERN =
  /^\/api\/(bookings\/[^/]+(?:\/latest-version)?|voyages|amendment-submissions\/[^/]+\/status)(?:\?|$)/;

const NETWORK_ONLY_API_PATTERN =
  /^\/api\/bookings\/[^/]+\/amendments(?:\/assess)?(?:\?|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.shell)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const allowed = new Set(Object.values(CACHE_NAMES));
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !allowed.has(key))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function resolvePolicy(url, method) {
  const path = `${url.pathname}${url.search}`;
  const normalizedMethod = method.toUpperCase();

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

  return "precache-shell";
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function precacheShell(request) {
  try {
    const response = await fetch(request);
    if (response.ok && request.mode === "navigate") {
      const cache = await caches.open(CACHE_NAMES.shell);
      cache.put("/", response.clone());
    }
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAMES.shell);
    const cached = await cache.match("/");
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  const policy = resolvePolicy(url, request.method);

  if (policy === "network-only") {
    // Assessment / submission: never cache, never invent a success response.
    return;
  }

  if (policy === "cache-first") {
    event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    return;
  }

  if (policy === "network-first") {
    event.respondWith(networkFirst(request, CACHE_NAMES.api));
    return;
  }

  event.respondWith(precacheShell(request));
});
