import { render, screen } from "@testing-library/react";
import Tag from "./Tag";

describe("Tag", () => {
  it("renders mono accent code", () => {
    render(<Tag>CN→NL</Tag>);
    const tag = screen.getByText("CN→NL");
    expect(tag).toBeInTheDocument();
    expect(tag).toHaveClass("font-mono");
  });
});
