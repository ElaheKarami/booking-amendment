import { hasPermission, hasRole } from "@/lib/permissionCheck";

function userWithRoles(...roles: UserRole[]): CurrentUser {
  return {
    id: "fixture-user",
    displayName: "Fixture User",
    roles,
  };
}

describe("permissionCheck", () => {
  describe("operations-user", () => {
    const user = userWithRoles("operations-user");

    it("can edit and submit amendments", () => {
      expect(hasPermission(user, "editAmendment")).toBe(true);
      expect(hasPermission(user, "submitAmendment")).toBe(true);
    });

    it("cannot override warnings or view detailed charge impact", () => {
      expect(hasPermission(user, "overrideEligibleWarning")).toBe(false);
      expect(hasPermission(user, "viewDetailedChargeImpact")).toBe(false);
    });
  });

  describe("operations-supervisor", () => {
    const user = userWithRoles("operations-supervisor");

    it("can override eligible warnings and view detailed charge impact", () => {
      expect(hasPermission(user, "overrideEligibleWarning")).toBe(true);
      expect(hasPermission(user, "viewDetailedChargeImpact")).toBe(true);
    });

    it("cannot edit or submit amendments", () => {
      expect(hasPermission(user, "editAmendment")).toBe(false);
      expect(hasPermission(user, "submitAmendment")).toBe(false);
    });
  });

  describe("commercial-reviewer", () => {
    const user = userWithRoles("commercial-reviewer");

    it("can view detailed charge impact", () => {
      expect(hasPermission(user, "viewDetailedChargeImpact")).toBe(true);
    });

    it("cannot edit, submit, or override warnings", () => {
      expect(hasPermission(user, "editAmendment")).toBe(false);
      expect(hasPermission(user, "submitAmendment")).toBe(false);
      expect(hasPermission(user, "overrideEligibleWarning")).toBe(false);
    });
  });

  it("returns false when the user is missing", () => {
    expect(hasPermission(null, "editAmendment")).toBe(false);
    expect(hasRole(undefined, "operations-user")).toBe(false);
  });

  it("detects assigned roles", () => {
    const user = userWithRoles("commercial-reviewer");
    expect(hasRole(user, "commercial-reviewer")).toBe(true);
    expect(hasRole(user, "operations-user")).toBe(false);
  });
});
