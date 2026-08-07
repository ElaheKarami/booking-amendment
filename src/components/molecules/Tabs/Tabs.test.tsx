import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import Tabs from "./Tabs";

function TabsHarness() {
  const [value, setValue] = useState("overview");
  return (
    <Tabs
      value={value}
      onValueChange={setValue}
      items={[
        { id: "overview", label: "Overview" },
        { id: "charges", label: "Charges" },
      ]}
    />
  );
}

describe("Tabs", () => {
  it("activates a tab on click", async () => {
    const user = userEvent.setup();
    render(<TabsHarness />);
    await user.click(screen.getByRole("tab", { name: "Charges" }));
    expect(screen.getByRole("tab", { name: "Charges" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
