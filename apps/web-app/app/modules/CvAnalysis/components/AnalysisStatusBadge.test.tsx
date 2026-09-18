import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWith } from "~/tests/test-renderers";
import { AnalysisStatusBadge } from "./AnalysisStatusBadge";
import { MatchScore } from "./MatchScore";
import { ProcessingTimeline } from "./ProcessingTimeline";

describe("AnalysisStatusBadge", () => {
  it("renders the translated status label", () => {
    renderWith().withi18n().render(<AnalysisStatusBadge status="analyzing" />);

    expect(screen.getByText("AI analysis")).toBeInTheDocument();
  });
});

describe("MatchScore", () => {
  it("shows the score and verdict", () => {
    renderWith().withi18n().render(<MatchScore score={87} verdict="strong_match" />);

    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.getByText("Strong match")).toBeInTheDocument();
  });
});

describe("ProcessingTimeline", () => {
  it("marks earlier steps as done and the current step as active", () => {
    renderWith()
      .withi18n()
      .render(<ProcessingTimeline status="analyzing" progress={55} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Claude compares the candidate with the role")).toBeInTheDocument();
    expect(screen.getByText("Results are ready")).toBeInTheDocument();
  });
});
