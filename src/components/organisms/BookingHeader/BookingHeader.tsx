import { Badge, Button, Card, TextItem } from "@/components/atoms";
import { formatDate } from "@/utils";
import type { BadgeTone } from "@/components/atoms";

interface BookingHeaderProps {
  booking: Booking;
  canEdit: boolean;
  onBack: () => void;
}

function statusTone(status: string): BadgeTone {
  const normalized = status.toLowerCase();

  if (normalized.includes("confirm")) return "success";
  if (normalized.includes("pending")) return "warning";
  if (normalized.includes("cancel")) return "error";

  return "info";
}

function BookingHeader({ booking, canEdit, onBack }: BookingHeaderProps) {
  return (
    <Card
      padded={false}
      className="flex flex-wrap items-start justify-between gap-4 border-border px-6 py-5"
    >
      <div className="w-full">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="w-auto"
        >
          ← Back to workspace
        </Button>
        <h1 className="text-heading-2 text-text-1 my-3">Booking Details</h1>

        <Card className="mb-4 flex w-full flex-col gap-3 lg:flex-row lg:gap-6">
          <TextItem
            title="Booking Request No."
            text={booking.bookingNumber}
          />
          <TextItem
            title="Booking Status"
            text={
              <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
            }
          />
          <TextItem title="Version" text={`v${booking.version}`} />
          <TextItem
            title="Last Updated"
            text={formatDate(booking.lastUpdated)}
          />
        </Card>
        <p className="text-body-sm text-text-2">
          Review amendment fields, recalculate impact, then submit when ready.
        </p>
      </div>
      {!canEdit && <Badge tone="warning">View only</Badge>}
    </Card>
  );
}

BookingHeader.displayName = "BookingHeader";

export default BookingHeader;
