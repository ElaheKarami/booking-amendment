"use client";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <main className="mx-auto w-full max-w-[1240px] p-10">
      <h1 className="text-xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-slate-800">
        {error.digest
          ? "A request could not be completed."
          : "Please try again."}
      </p>
      <button
        className="mt-5 rounded-btn bg-teal-500 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </main>
  );
}
