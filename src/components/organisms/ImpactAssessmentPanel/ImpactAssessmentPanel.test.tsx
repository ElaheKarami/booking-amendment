import { render, screen } from "@testing-library/react";
import AuthProvider from "@/providers/AuthProvider";
import ImpactAssessmentPanel from "./ImpactAssessmentPanel";
import type { ImpactAssessmentPanelProps } from "./ImpactAssessmentPanel";

const impact: AmendmentImpact = {
  schedule: {
    feasible: false,
    warnings: ["Cut-off conflict with readiness date."],
  },
  equipment: {
    available: false,
    unavailableItems: ["40HC at CNSHA"],
  },
  charges: {
    currentTotal: 4_800,
    revisedTotal: 5_250,
    difference: 450,
    currency: "USD",
    items: [
      {
        code: "OCEAN",
        description: "Ocean freight",
        previousAmount: 4_800,
        revisedAmount: 5_250,
      },
    ],
  },
  approvals: [
    {
      code: "COMMERCIAL_REVIEW",
      reason: "Charge increase exceeds threshold.",
    },
  ],
  validations: [
    {
      field: "voyageId",
      severity: "error",
      message: "Voyage does not support 40HC.",
    },
    {
      severity: "warning",
      message: "Transit time may increase.",
    },
    {
      severity: "info",
      message: "Tariff version 2026-Q3 applied.",
    },
  ],
  assessmentVersion: "assessment-7-voyage-002",
};

const opsUser: CurrentUser = {
  id: "ops-1",
  displayName: "Ops User",
  roles: ["operations-user"],
};

const supervisorUser: CurrentUser = {
  id: "sup-1",
  displayName: "Supervisor",
  roles: ["operations-supervisor"],
};

function renderPanel(
  user: CurrentUser,
  props: Partial<ImpactAssessmentPanelProps> = {},
) {
  return render(
    <AuthProvider user={user}>
      <ImpactAssessmentPanel impact={impact} {...props} />
    </AuthProvider>,
  );
}

describe("ImpactAssessmentPanel", () => {
  it("shows an empty state when no assessment exists", () => {
    render(
      <AuthProvider user={opsUser}>
        <ImpactAssessmentPanel impact={null} />
      </AuthProvider>,
    );

    expect(screen.getByText("No impact calculated")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Run Recalculate to review schedule, equipment, charges, approvals, and validations for the current draft.",
      ),
    ).toBeInTheDocument();
  });

  it("renders each impact category with distinguishable validation severities", () => {
    renderPanel(opsUser);

    expect(screen.getByText("Not feasible")).toBeInTheDocument();
    expect(
      screen.getByText("Cut-off conflict with readiness date."),
    ).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(screen.getByText("40HC at CNSHA")).toBeInTheDocument();
    expect(screen.getByText("Increase")).toBeInTheDocument();
    expect(screen.getByText("Commercial Review")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByText("warning")).toBeInTheDocument();
    expect(screen.getByText("info")).toBeInTheDocument();
    expect(screen.getByText("Voyage does not support 40HC.")).toBeInTheDocument();
    expect(screen.getByText("Blocking")).toBeInTheDocument();
  });

  it("marks stale results as outdated while keeping prior content", () => {
    renderPanel(opsUser, { stale: true });

    expect(screen.getByText("Outdated result")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This assessment no longer matches the current draft. Recalculate before submitting.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Not feasible")).toBeInTheDocument();
  });

  it("shows charge totals to all users but gates line items by role", () => {
    const { unmount } = renderPanel(opsUser);

    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(screen.getByText("Revised")).toBeInTheDocument();
    expect(screen.getByText("Difference")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Detailed charge lines require a Commercial Reviewer or Operations Supervisor role.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ocean freight")).not.toBeInTheDocument();

    unmount();
    renderPanel(supervisorUser);

    expect(screen.getByText("Ocean freight")).toBeInTheDocument();
    expect(screen.getByText("OCEAN")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Detailed charge lines require a Commercial Reviewer or Operations Supervisor role.",
      ),
    ).not.toBeInTheDocument();
  });
});
