export const PERMISSION_ROLES: Record<Permission, readonly UserRole[]> = {
  editAmendment: ["operations-user"],
  submitAmendment: ["operations-user"],
  overrideEligibleWarning: ["operations-supervisor"],
  viewDetailedChargeImpact: ["operations-supervisor", "commercial-reviewer"],
} as const;

export const MOCK_CURRENT_USER: CurrentUser = {
  id: "mock-user-001",
  displayName: "Alex Morgan",
  roles: [
    "operations-user",
    // "operations-supervisor",
    // "commercial-reviewer",
  ],
};

export const ACCESS_TOKEN_COOKIE = "accessToken";
