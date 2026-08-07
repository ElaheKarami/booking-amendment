export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading content"
      className="mx-auto w-full max-w-[1240px] p-10"
    >
      <div className="h-8 w-64 animate-pulse rounded-card bg-slate-300" />
      <div className="mt-6 h-48 animate-pulse rounded-card bg-white" />
    </main>
  );
}
