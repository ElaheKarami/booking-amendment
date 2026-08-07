import {
  assessmentFeedback,
  submissionFeedback,
} from "./bookingAmendmentWorkspaceFeedback";

describe("assessmentFeedback", () => {
  it("maps calculating status", () => {
    expect(assessmentFeedback("calculating", undefined)).toEqual({
      tone: "info",
      label: "Calculating impact…",
    });
  });

  it("maps valid status", () => {
    expect(assessmentFeedback("valid", undefined)).toEqual({
      tone: "success",
      label: "Assessment matches the current draft",
    });
  });

  it("maps stale status", () => {
    expect(assessmentFeedback("stale", undefined)).toEqual({
      tone: "warning",
      label: "Draft changed — recalculate before submitting",
    });
  });

  it("maps failed status with a provided message", () => {
    expect(assessmentFeedback("failed", "Cut-off passed")).toEqual({
      tone: "error",
      label: "Cut-off passed",
    });
  });

  it("maps failed status with a fallback message", () => {
    expect(assessmentFeedback("failed", undefined)).toEqual({
      tone: "error",
      label: "Assessment failed. Try recalculating.",
    });
  });

  it("maps not-calculated status", () => {
    expect(assessmentFeedback("not-calculated", undefined)).toEqual({
      tone: "info",
      label: "Not calculated — run Recalculate to assess impact",
    });
  });
});

describe("submissionFeedback", () => {
  const submission: AmendmentSubmission = {
    id: "sub-001",
    status: "submitted",
    idempotencyKey: "idem-001",
    alreadyProcessed: false,
  };

  it("returns null for idle", () => {
    expect(submissionFeedback("idle", null, undefined, null)).toBeNull();
  });

  it("maps submitting status", () => {
    expect(submissionFeedback("submitting", null, undefined, null)).toEqual({
      tone: "info",
      label: "Submitting amendment…",
    });
  });

  it("maps succeeded status with a submission id", () => {
    expect(
      submissionFeedback("succeeded", submission, undefined, null),
    ).toEqual({
      tone: "success",
      label: "Amendment accepted · sub-001",
    });
  });

  it("maps succeeded status without a submission id", () => {
    expect(submissionFeedback("succeeded", null, undefined, null)).toEqual({
      tone: "success",
      label: "Amendment accepted",
    });
  });

  it("maps rejected status with a provided message", () => {
    expect(
      submissionFeedback("rejected", null, "Validation failed", null),
    ).toEqual({
      tone: "error",
      label: "Validation failed",
    });
  });

  it("maps rejected status with a fallback message", () => {
    expect(submissionFeedback("rejected", null, undefined, null)).toEqual({
      tone: "error",
      label: "Amendment rejected. The draft was preserved.",
    });
  });

  it("maps conflict status with a fallback message", () => {
    expect(submissionFeedback("conflict", null, undefined, null)).toEqual({
      tone: "warning",
      label:
        "Booking changed by another user. Draft preserved — load latest and recalculate before retrying.",
    });
  });

  it("maps unknown status with an idempotency key", () => {
    expect(
      submissionFeedback("unknown", null, undefined, "idem-123"),
    ).toEqual({
      tone: "warning",
      label: "Submission status unknown · reference idem-123",
    });
  });

  it("maps unknown status without an idempotency key", () => {
    expect(submissionFeedback("unknown", null, undefined, null)).toEqual({
      tone: "warning",
      label: "Submission status unknown. Do not assume failure.",
    });
  });
});
