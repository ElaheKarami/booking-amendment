import { render, screen } from "@testing-library/react";
import Badge from "./Badge";

describe("Badge", () => {
  it("renders tone content", () => {
    render(<Badge tone="success">Accepted</Badge>);
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("renders mvp variant uppercase styling class path", () => {
    const { container } = render(
      <Badge variant="mvp">MVP</Badge>,
    );
    expect(container.firstChild).toHaveClass("uppercase");
  });
});
