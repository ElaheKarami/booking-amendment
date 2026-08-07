import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "./Checkbox";

describe("Checkbox", () => {
  it("toggles controlled state via click", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Checkbox label="Override" checked={false} onChange={onChange} />,
    );
    await user.click(screen.getByLabelText("Override"));
    expect(onChange).toHaveBeenCalled();
  });
});
