import { render, screen } from "@testing-library/react";
import Card from "./Card";

describe("Card", () => {
  it("renders default surface", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders inverse variant", () => {
    const { container } = render(<Card variant="inverse">Dark</Card>);
    expect(container.firstChild).toHaveClass("bg-surface-inverse");
  });
});
