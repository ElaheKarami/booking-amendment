import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ToastViewport from "./ToastViewport";
import {
  clearMessages,
  dismissMessage,
  getToasts,
  showMessage,
} from "./showMessage";

describe("ToastBanner / showMessage", () => {
  afterEach(() => {
    act(() => {
      clearMessages();
    });
  });

  it("renders a toast from showMessage and dismisses it", async () => {
    const user = userEvent.setup();
    render(<ToastViewport />);

    act(() => {
      showMessage("error", "Something failed");
    });

    expect(await screen.findByText("Something failed")).toBeInTheDocument();
    expect(getToasts()).toHaveLength(1);

    await user.click(
      screen.getByRole("button", { name: "Dismiss notification" }),
    );
    expect(screen.queryByText("Something failed")).not.toBeInTheDocument();
  });

  it("dismissMessage removes by id", () => {
    let id = "";
    act(() => {
      id = showMessage("success", "Saved");
    });
    expect(getToasts()).toHaveLength(1);
    act(() => {
      dismissMessage(id);
    });
    expect(getToasts()).toHaveLength(0);
  });
});
