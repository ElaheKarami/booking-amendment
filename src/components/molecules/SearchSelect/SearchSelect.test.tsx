import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchSelect from "./SearchSelect";

const options = [{ value: "voyage-001", label: "MV Atlantic Horizon · AH026W" }];

describe("SearchSelect", () => {
  it("shows a loading state while options are loading", async () => {
    const user = userEvent.setup();
    render(
      <SearchSelect
        id="planned-voyage"
        label="Planned voyage"
        options={options}
        isLoading
        loadingMessage="Loading voyages…"
      />,
    );

    await user.click(screen.getByLabelText("Planned voyage"));

    expect(screen.getByRole("status")).toHaveTextContent("Loading voyages…");
  });

  it("shows a request error instead of stale options", async () => {
    const user = userEvent.setup();
    render(
      <SearchSelect
        id="planned-voyage"
        label="Planned voyage"
        options={options}
        loadError="Unable to load voyages."
      />,
    );

    await user.click(screen.getByLabelText("Planned voyage"));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load voyages.",
    );
    expect(
      screen.queryByRole("option", {
        name: "MV Atlantic Horizon · AH026W",
      }),
    ).not.toBeInTheDocument();
  });

  it("shows the empty message when no options match", async () => {
    const user = userEvent.setup();
    render(
      <SearchSelect
        id="planned-voyage"
        label="Planned voyage"
        options={[]}
        emptyMessage="No voyages match the current search."
      />,
    );

    await user.click(screen.getByLabelText("Planned voyage"));

    expect(
      screen.getByText("No voyages match the current search."),
    ).toBeInTheDocument();
  });
});
