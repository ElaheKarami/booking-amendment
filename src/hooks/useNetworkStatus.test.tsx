import { act, renderHook } from "@testing-library/react";
import { useNetworkStatus } from "./useNetworkStatus";

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => isOnline,
  });
}

describe("useNetworkStatus", () => {
  beforeEach(() => {
    setNavigatorOnline(true);
  });

  it("starts online when navigator reports online", () => {
    const { result } = renderHook(() => useNetworkStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectivity).toBe("online");
    expect(result.current.justReconnected).toBe(false);
  });

  it("tracks offline and reconnected transitions", () => {
    const { result } = renderHook(() => useNetworkStatus());

    setNavigatorOnline(false);
    act(() => {
      window.dispatchEvent(new Event("offline"));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.connectivity).toBe("offline");
    expect(result.current.justReconnected).toBe(false);

    setNavigatorOnline(true);
    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.connectivity).toBe("reconnected");
    expect(result.current.justReconnected).toBe(true);

    act(() => {
      result.current.acknowledgeReconnect();
    });

    expect(result.current.connectivity).toBe("online");
    expect(result.current.justReconnected).toBe(false);
  });
});
