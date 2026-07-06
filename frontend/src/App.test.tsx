import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the CampusInsight foundation page", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "CampusInsight" })).toBeInTheDocument();
    expect(screen.getByText("This product is under active development.")).toBeInTheDocument();
    expect(screen.getByText("Backend status")).toBeInTheDocument();
  });
});
