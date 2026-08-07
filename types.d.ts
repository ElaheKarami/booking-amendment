export {};

declare global {
  type AsyncStatus = "idle" | "loading" | "success" | "error";

  type UserRole =
    | "operations-user"
    | "operations-supervisor"
    | "commercial-reviewer";

  type CurrentUser = {
    id: string;
    displayName: string;
    roles: UserRole[];
  };

  type Permission =
    | "editAmendment"
    | "submitAmendment"
    | "overrideEligibleWarning"
    | "viewDetailedChargeImpact";
}
