"use client";

import { useEffect } from "react";

function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    // Skip registration during Jest / non-secure local tooling without SW support.
    if (process.env.NODE_ENV === "test") {
      return;
    }

    void navigator.serviceWorker
      .register("/service-worker.js")
      .catch(() => {
        // Registration failure must not break the workspace; network status
        // and mutation safety still apply without a worker.
      });
  }, []);

  return null;
}

ServiceWorkerRegistration.displayName = "ServiceWorkerRegistration";

export default ServiceWorkerRegistration;
