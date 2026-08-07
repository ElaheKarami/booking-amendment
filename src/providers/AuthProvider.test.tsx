import { render, screen } from "@testing-library/react";
import AuthProvider, { useAuth } from "@/providers/AuthProvider";
import { PermissionGate } from "@/components/molecules";

const opsUser: CurrentUser = {
  id: "ops-1",
  displayName: "Ops User",
  roles: ["operations-user"],
};

const supervisor: CurrentUser = {
  id: "sup-1",
  displayName: "Supervisor",
  roles: ["operations-supervisor"],
};

function AuthProbe() {
  const { user, isAuthenticated, hasPermission, hasRole } = useAuth();

  return (
    <div>
      <span>{user.displayName}</span>
      <span>{isAuthenticated ? "authenticated" : "anonymous"}</span>
      <span>
        {hasPermission("editAmendment") ? "can-edit" : "cannot-edit"}
      </span>
      <span>
        {hasRole("operations-user") ? "is-ops" : "not-ops"}
      </span>
    </div>
  );
}

describe("AuthProvider", () => {
  it("exposes the current user and permission helpers", () => {
    render(
      <AuthProvider user={opsUser}>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByText("Ops User")).toBeInTheDocument();
    expect(screen.getByText("authenticated")).toBeInTheDocument();
    expect(screen.getByText("can-edit")).toBeInTheDocument();
    expect(screen.getByText("is-ops")).toBeInTheDocument();
  });

  it("throws when useAuth is used outside the provider", () => {
    expect(() => render(<AuthProbe />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});

describe("PermissionGate", () => {
  it("renders children when the user has permission", () => {
    render(
      <AuthProvider user={opsUser}>
        <PermissionGate permission="editAmendment">
          <button type="button">Edit amendment</button>
        </PermissionGate>
      </AuthProvider>,
    );

    expect(
      screen.getByRole("button", { name: "Edit amendment" }),
    ).toBeInTheDocument();
  });

  it("renders the forbidden fallback when permission is missing", () => {
    render(
      <AuthProvider user={supervisor}>
        <PermissionGate
          permission="editAmendment"
          fallback={<p>Forbidden — missing required role</p>}
        >
          <button type="button">Edit amendment</button>
        </PermissionGate>
      </AuthProvider>,
    );

    expect(
      screen.getByText("Forbidden — missing required role"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit amendment" }),
    ).not.toBeInTheDocument();
  });

  it("allows supervisors to view detailed charge impact", () => {
    render(
      <AuthProvider user={supervisor}>
        <PermissionGate permission="viewDetailedChargeImpact">
          <button type="button">View detailed charge impact</button>
        </PermissionGate>
      </AuthProvider>,
    );

    expect(
      screen.getByRole("button", { name: "View detailed charge impact" }),
    ).toBeInTheDocument();
  });
});
