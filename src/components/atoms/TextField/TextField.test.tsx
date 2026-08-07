import { render, screen } from "@testing-library/react";
import TextField from "./TextField";

describe("TextField", () => {
  it("associates label with input", () => {
    render(<TextField label="Booking ref" />);
    expect(screen.getByLabelText("Booking ref")).toBeInTheDocument();
  });

  it("marks invalid when error is set", () => {
    render(<TextField label="Email" error="Required" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
