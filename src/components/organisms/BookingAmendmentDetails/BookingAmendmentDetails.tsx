"use client";

import { Badge, Button, Card, Tag, TextField } from "@/components/atoms";
import { PermissionGate } from "@/components/molecules";
import { useAuth } from "@/providers";

interface BookingAmendmentDetailsProps {
  onBack: () => void;
}

function BookingAmendmentDetails({ onBack }: BookingAmendmentDetailsProps) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("editAmendment");
  const canSubmit = hasPermission("submitAmendment");

  return (
    <div className="flex flex-col gap-6">
      <Card
        padded={false}
        className="flex flex-wrap items-start justify-between gap-4 border-border px-6 py-5"
      >
        <div className="flex flex-col gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            ← Back to workspace
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-heading-2 text-text-1">
              Booking <Tag>BK-482193</Tag>
            </h1>
            <Badge tone="success">Confirmed</Badge>
            <span className="font-mono text-label text-text-2-strong">
              v3 · updated 2026-08-06 14:22 UTC
            </span>
          </div>
          <p className="text-body-sm text-text-2">
            Review amendment fields, recalculate impact, then submit when ready.
          </p>
        </div>
        {!canEdit && <Badge tone="warning">View only</Badge>}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card padded={false} className="border-border px-6 py-5">
          <h2 className="text-section text-text-1">Amendment details</h2>
          <p className="mt-1 text-body-sm text-text-2">
            Adjust discharge, voyage, and cargo fields before recalculating
            impact.
          </p>

          <PermissionGate
            permission="editAmendment"
            fallback={
              <p className="mt-4 text-body-sm text-text-2-strong">
                Your role can view this booking but cannot change amendment
                fields. Ask an operations user to prepare the draft.
              </p>
            }
          >
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                id="port-of-discharge"
                label="Port of discharge"
                defaultValue="NLRTM"
                disabled={!canEdit}
              />
              <TextField
                id="voyage"
                label="Planned voyage"
                defaultValue="AE7-W-2026-32"
                disabled={!canEdit}
              />
              <TextField
                id="cargo-readiness"
                label="Cargo readiness date"
                type="date"
                defaultValue="2026-08-18"
                disabled={!canEdit}
              />
              <TextField
                id="containers"
                label="Containers"
                defaultValue="2 × 40HC"
                disabled={!canEdit}
              />
              <TextField
                id="special-instructions"
                label="Special instructions"
                defaultValue="Keep reefer setpoint 2°C"
                containerClassName="sm:col-span-2"
                disabled={!canEdit}
              />
            </div>
          </PermissionGate>
        </Card>

        <Card padded={false} className="border-border px-6 py-5">
          <h2 className="text-section text-text-1">Impact assessment</h2>
          <p className="mt-1 text-body-sm text-text-2">
            High-level schedule, equipment, and charge deltas for the current
            draft.
          </p>

          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-border-card pb-3">
              <dt className="text-caption text-text-3">Schedule</dt>
              <dd className="text-body-sm text-text-1">ETA +1 day</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border-card pb-3">
              <dt className="text-caption text-text-3">Equipment</dt>
              <dd className="text-body-sm text-text-1">Available</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-border-card pb-3">
              <dt className="text-caption text-text-3">Charge difference</dt>
              <dd className="font-mono text-body-sm text-text-1">+ USD 180</dd>
            </div>
          </dl>

          <div className="mt-5 space-y-3">
            <PermissionGate
              permission="viewDetailedChargeImpact"
              fallback={
                <p className="text-body-sm text-text-2-strong">
                  Detailed charge lines are restricted to commercial reviewers
                  and operations supervisors.
                </p>
              }
            >
              <Card
                variant="table"
                padded={false}
                className="space-y-2 bg-slate-50 p-4"
              >
                <p className="text-caption font-semibold uppercase tracking-[0.06em] text-text-3">
                  Detailed charge impact
                </p>
                <p className="font-mono text-label text-text-1">
                  Ocean freight adj. · + USD 120
                </p>
                <p className="font-mono text-label text-text-1">
                  BAF · + USD 60
                </p>
              </Card>
            </PermissionGate>

            <PermissionGate permission="overrideEligibleWarning" fallback={null}>
              <Card
                variant="table"
                padded={false}
                className="flex flex-wrap items-center justify-between gap-3 border-amber-100 bg-amber-50 p-4"
              >
                <div>
                  <p className="text-body-sm font-medium text-warning">
                    Eligible warning
                  </p>
                  <p className="mt-0.5 text-caption text-text-2-strong">
                    Cut-off is within 48 hours for the selected voyage.
                  </p>
                </div>
                <Button type="button" variant="secondary" size="sm">
                  Override warning
                </Button>
              </Card>
            </PermissionGate>
          </div>
        </Card>
      </div>

      <Card
        padded={false}
        className="flex flex-wrap items-center justify-between gap-3 border-border px-6 py-4"
      >
        <p className="text-body-sm text-text-2">
          {canEdit
            ? "Unsaved changes are kept in the workspace until you submit."
            : "Toolbar actions follow your assigned roles."}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGate
            permission="editAmendment"
            fallback={
              <Button type="button" variant="secondary" disabled>
                Recalculate
              </Button>
            }
          >
            <Button type="button" variant="secondary" disabled={!canEdit}>
              Recalculate
            </Button>
          </PermissionGate>
          <PermissionGate
            permission="submitAmendment"
            fallback={
              <Button type="button" variant="primary" disabled>
                Submit amendment
              </Button>
            }
          >
            <Button type="button" variant="primary" disabled={!canSubmit}>
              Submit amendment
            </Button>
          </PermissionGate>
        </div>
      </Card>
    </div>
  );
}

BookingAmendmentDetails.displayName = "BookingAmendmentDetails";

export default BookingAmendmentDetails;
