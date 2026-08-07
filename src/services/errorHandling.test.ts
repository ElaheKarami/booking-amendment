import {
  clearMessages,
  getToasts,
} from "@/components/atoms/ToastBanner/showMessage";
import {
  notify,
  normalizeApiError,
  reportApiError,
  showErrorMessage,
  showSuccessMessage,
  showWarningMessage,
} from "./errorHandling";

describe("errorHandling toast wire-up", () => {
  afterEach(() => {
    clearMessages();
  });

  it("shows error, success, and warning toasts", () => {
    showErrorMessage("Boom", { forceShow: true });
    showSuccessMessage("Saved");
    showWarningMessage("Check voyage");
    const types = getToasts().map((t) => t.type);
    expect(types).toEqual(
      expect.arrayContaining(["error", "success", "warning"]),
    );
  });

  it("dedupes repeated errors within the debounce window", () => {
    expect(showErrorMessage("Dup")).not.toBeNull();
    expect(showErrorMessage("Dup")).toBeNull();
    expect(getToasts()).toHaveLength(1);
  });

  it("reportApiError surfaces message via toast", () => {
    reportApiError(new Error("Network down"), { forceShow: true });
    expect(getToasts()[0]?.type).toBe("error");
  });

  it("notify accepts typed channels", () => {
    notify("success", "Ok");
    expect(getToasts()[0]?.type).toBe("success");
  });

  it("preserves typed application errors from API responses", () => {
    const error = normalizeApiError({
      isAxiosError: true,
      message: "Request failed with status code 422",
      response: {
        status: 422,
        data: {
          type: "validation",
          fields: { voyageId: ["Select a compatible voyage."] },
        },
      },
    });

    expect(error.applicationError).toEqual({
      type: "validation",
      fields: { voyageId: ["Select a compatible voyage."] },
    });
    expect(error.reasons).toEqual(["Select a compatible voyage."]);
  });
});
