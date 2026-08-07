import { render, screen } from "@testing-library/react";
import Tooltip from "./Tooltip";
import Button from "../Button/Button";

describe("Tooltip", () => {
  it("associates tooltip content for disabled reason pattern", () => {
    render(
      <Tooltip content="Missing permission to submit">
        <Button disabled>Submit</Button>
      </Tooltip>,
    );
    expect(
      screen.getByRole("tooltip", { name: "Missing permission to submit" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
