import { Button } from "@/components/atoms";
import { EmptyState } from "@/components/molecules";
import { establishMockSession } from "@/lib/mockSession";

function AuthenticationBoundary() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background p-8">
      <EmptyState
        className="w-full max-w-md"
        title="Session expired or unavailable"
        description="We could not verify an active session for this workspace. Restore the assessment session to continue amending the booking. Tokens stay on the server (HttpOnly cookie) and are never stored in the browser."
        action={
          <form action={establishMockSession}>
            <Button type="submit" variant="primary">
              Restore session
            </Button>
          </form>
        }
      />
    </main>
  );
}

AuthenticationBoundary.displayName = "AuthenticationBoundary";

export default AuthenticationBoundary;
