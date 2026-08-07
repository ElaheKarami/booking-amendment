import { act, renderHook } from "@testing-library/react";
import { useUnsavedChangesProtection } from "./useUnsavedChangesProtection";

describe("useUnsavedChangesProtection", () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, "addEventListener");
    removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("registers beforeunload only while dirty", () => {
    const { rerender, unmount } = renderHook(
      ({ isDirty }) => useUnsavedChangesProtection(isDirty),
      { initialProps: { isDirty: false } },
    );

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    rerender({ isDirty: true });

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function),
    );
  });

  it("runs the action immediately when clean", () => {
    const { result } = renderHook(() => useUnsavedChangesProtection(false));
    const onConfirm = jest.fn();

    act(() => {
      result.current.requestDiscard(onConfirm);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it("opens confirmation when dirty and runs the action only after confirm", () => {
    const { result } = renderHook(() => useUnsavedChangesProtection(true));
    const onConfirm = jest.fn();

    act(() => {
      result.current.requestDiscard(onConfirm);
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.isConfirmOpen).toBe(true);

    act(() => {
      result.current.confirmDiscard();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it("cancels without running the pending action", () => {
    const { result } = renderHook(() => useUnsavedChangesProtection(true));
    const onConfirm = jest.fn();

    act(() => {
      result.current.requestDiscard(onConfirm);
    });

    act(() => {
      result.current.cancelDiscard();
    });

    expect(onConfirm).not.toHaveBeenCalled();
    expect(result.current.isConfirmOpen).toBe(false);
  });
});
