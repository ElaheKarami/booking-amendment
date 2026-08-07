"use client";

import { useState } from "react";
import { Button, Card } from "@/components/atoms";
import { BookingAmendmentDetails } from "@/components/templates";
import { PermissionGate } from "@/components/molecules";
import { DEFAULT_BOOKING_ID } from "@/constants";
import { clearMockSession } from "@/lib/mockSession";
import { useAuth } from "@/providers";
import { toTitleCase } from "@/utils";

const GATED_ACTIONS: Array<{
  permission: Permission;
  label: string;
  description: string;
  onClick?: () => void;
}> = [
  {
    permission: "editAmendment",
    label: "View booking details",
    description: "Operations user — edit fields, recalculate, and submit",
  },
  {
    permission: "overrideEligibleWarning",
    label: "Override eligible warning",
    description: "Operations supervisor",
  },
  {
    permission: "viewDetailedChargeImpact",
    label: "View detailed charge impact",
    description: "Commercial reviewer or operations supervisor",
  },
];

function ProtectedWorkspaceShell() {
  const { user, hasPermission } = useAuth();
  const [showBookingDetails, setShowBookingDetails] = useState(false);

  const handleActionClick = (permission: Permission) => {
    if (permission === "editAmendment") {
      setShowBookingDetails(true);
    }
  };

  return (
    <main className="min-h-full flex-1 bg-background p-8">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6">
        {showBookingDetails ? (
          <BookingAmendmentDetails
            bookingId={DEFAULT_BOOKING_ID}
            onBack={() => setShowBookingDetails(false)}
          />
        ) : (
          <>
            <Card
              padded={false}
              className="flex flex-wrap items-start justify-between gap-4 border-border px-6 py-5"
            >
              <div className="flex flex-col gap-1">
                <p className="text-overline uppercase text-accent">
                  Booking amendment workspace
                </p>
                <h1 className="text-heading-2 text-text-1">
                  {user.displayName}
                </h1>
                <p className="font-mono text-label text-text-2-strong">
                  {user.id} ·{" "}
                  {toTitleCase(user.roles.join(", ")).replace(/-/g, " ")}
                </p>
              </div>
              <form action={clearMockSession}>
                <Button type="submit" variant="secondary">
                  End session
                </Button>
              </form>
            </Card>

            <Card padded={false} className="border-border px-6 py-5">
              <h2 className="text-section text-text-1">Available actions</h2>
              <p className="mt-1 text-body-sm text-text-2">
                Actions shown depend on your role. The API enforces
                authorisation independently.
              </p>
              <ul className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {GATED_ACTIONS.map((action) => (
                  <li key={action.permission}>
                    <Card
                      variant="table"
                      padded={false}
                      className="p-4 h-full flex flex-col justify-between gap-6"
                    >
                      <p className="text-caption font-semibold uppercase tracking-[0.06em] text-text-3">
                        {action.description}
                      </p>
                      <PermissionGate
                        permission={action.permission}
                        fallback={
                          <Button type="button" variant="secondary" disabled>
                            Not available for your role
                          </Button>
                        }
                      >
                        <Button
                          type="button"
                          variant="primary-emphasis"
                          className="mt-3"
                          disabled={!hasPermission(action.permission)}
                          onClick={() => handleActionClick(action.permission)}
                        >
                          {action.label}
                        </Button>
                      </PermissionGate>
                    </Card>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}

ProtectedWorkspaceShell.displayName = "ProtectedWorkspaceShell";

export default ProtectedWorkspaceShell;
