import { Card } from "@/components/atoms";

function BookingWorkspaceSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading booking workspace"
      className="flex flex-col gap-6"
    >
      <Card
        padded={false}
        className="flex flex-wrap items-start justify-between gap-4 border-border px-6 py-5"
      >
        <div className="flex w-full flex-col gap-3">
          <div className="h-8 w-40 animate-pulse rounded-btn bg-slate-200" />
          <div className="h-9 w-72 animate-pulse rounded-btn bg-slate-200" />
          <Card className="flex flex-wrap items-center gap-3">
            <div className="flex flex-row-reverse lg:flex-col items-center justify-between lg:justify-normal lg:items-start gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded-md bg-slate-200" />
            </div>
            <div className="flex flex-row-reverse lg:flex-col items-center justify-between lg:justify-normal lg:items-start gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded-md bg-slate-200" />
            </div>
            <div className="flex flex-row-reverse lg:flex-col items-center justify-between lg:justify-normal lg:items-start gap-2">
              <div className="h-4 w-24 animate-pulse rounded-md bg-slate-200" />
              <div className="h-4 w-20 animate-pulse rounded-md bg-slate-200" />
            </div>
          </Card>
          <div className="h-5 w-full max-w-lg animate-pulse rounded-btn bg-slate-200" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card padded={false} className="border-border px-6 py-5">
          <div className="h-6 w-48 animate-pulse rounded-btn bg-slate-200" />
          <div className="mt-2 h-5 w-full max-w-md animate-pulse rounded-btn bg-slate-200" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-lg bg-slate-200"
              />
            ))}
          </div>
        </Card>

        <Card padded={false} className="border-border px-6 py-5">
          <div className="h-6 w-44 animate-pulse rounded-btn bg-slate-200" />
          <div className="mt-2 h-5 w-full max-w-sm animate-pulse rounded-btn bg-slate-200" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-10 animate-pulse rounded-btn bg-slate-200"
              />
            ))}
          </div>
        </Card>
      </div>

      <Card
        padded={false}
        className="flex flex-wrap items-center justify-between gap-3 border-border px-6 py-4"
      >
        <div className="h-5 w-64 animate-pulse rounded-btn bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-pulse rounded-btn bg-slate-200" />
          <div className="h-9 w-36 animate-pulse rounded-btn bg-slate-200" />
        </div>
      </Card>
    </div>
  );
}

BookingWorkspaceSkeleton.displayName = "BookingWorkspaceSkeleton";

export default BookingWorkspaceSkeleton;
