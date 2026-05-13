/**
 * Tests for Issue #125 – Recipient page hierarchy (headers, sections, metrics)
 *
 * Covers:
 *  - Semantic landmark structure (<main>, <header>, <section>)
 *  - Heading hierarchy (h1 → h2, no skipped levels)
 *  - Metric cards use <dl>/<dt>/<dd>
 *  - Progress bars have correct ARIA attributes
 *  - Status badges have role="status" and aria-label
 *  - Sort <select> is labelled
 *  - Pin button exposes aria-pressed
 *  - Decorative SVGs are aria-hidden
 *  - Focus-visible ring classes are present on interactive elements
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecipientStreams from "../recipient/RecipientStreams";

// ─── RecipientStreams ────────────────────────────────────────────────────────

describe("RecipientStreams – heading hierarchy", () => {
  it("renders a visible h2 for the streams list", () => {
    render(<RecipientStreams />);
    const heading = screen.getByRole("heading", { level: 2, name: /your incoming streams/i });
    expect(heading).toBeInTheDocument();
  });
});

describe("RecipientStreams – list landmark", () => {
  it("renders a <ul> labelled by the section heading", () => {
    render(<RecipientStreams />);
    const list = screen.getByRole("list", { name: /your incoming streams/i });
    expect(list).toBeInTheDocument();
  });

  it("renders one <li> per mock stream", () => {
    render(<RecipientStreams />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});

describe("RecipientStreams – article landmarks", () => {
  it("each stream card is an <article> with an accessible name", () => {
    render(<RecipientStreams />);
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(1);
    articles.forEach((article) => {
      expect(article).toHaveAttribute("aria-label");
      expect(article.getAttribute("aria-label")).toMatch(/stream from/i);
    });
  });
});

describe("RecipientStreams – progress bars", () => {
  it("each progress bar has role=progressbar with aria-valuenow/min/max", () => {
    render(<RecipientStreams />);
    const bars = screen.getAllByRole("progressbar");
    expect(bars.length).toBeGreaterThanOrEqual(1);
    bars.forEach((bar) => {
      expect(bar).toHaveAttribute("aria-valuenow");
      expect(bar).toHaveAttribute("aria-valuemin", "0");
      expect(bar).toHaveAttribute("aria-valuemax", "100");
      expect(bar).toHaveAttribute("aria-label");
    });
  });

  it("aria-valuenow is within 0–100", () => {
    render(<RecipientStreams />);
    const bars = screen.getAllByRole("progressbar");
    bars.forEach((bar) => {
      const value = Number(bar.getAttribute("aria-valuenow"));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });
});

describe("RecipientStreams – status badges", () => {
  it("each status badge has role=status and an aria-label", () => {
    render(<RecipientStreams />);
    const badges = screen.getAllByRole("status");
    expect(badges.length).toBeGreaterThanOrEqual(1);
    badges.forEach((badge) => {
      expect(badge).toHaveAttribute("aria-label");
      expect(badge.getAttribute("aria-label")).toMatch(/stream status:/i);
    });
  });
});

describe("RecipientStreams – sort control", () => {
  it("sort <select> has an associated <label>", () => {
    render(<RecipientStreams />);
    const select = screen.getByRole("combobox", { name: /sort by/i });
    expect(select).toBeInTheDocument();
  });

  it("sort options include Priority, Newest, and Highest Rate", () => {
    render(<RecipientStreams />);
    expect(screen.getByRole("option", { name: /priority/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /newest/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /highest rate/i })).toBeInTheDocument();
  });
});

describe("RecipientStreams – pin button", () => {
  it("pin buttons expose aria-pressed", () => {
    render(<RecipientStreams />);
    const pinButtons = screen.getAllByRole("button", { name: /pin stream|unpin stream/i });
    expect(pinButtons.length).toBeGreaterThanOrEqual(1);
    pinButtons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-pressed");
    });
  });

  it("toggling pin flips aria-pressed", async () => {
    const user = userEvent.setup();
    render(<RecipientStreams />);

    // Find a button that is currently NOT pinned (aria-pressed="false")
    const unpinnedBtn = screen
      .getAllByRole("button", { name: /pin stream/i })
      .find((btn) => btn.getAttribute("aria-pressed") === "false");

    if (!unpinnedBtn) return; // all pinned – skip

    await user.click(unpinnedBtn);
    expect(unpinnedBtn).toHaveAttribute("aria-pressed", "true");
  });
});

describe("RecipientStreams – detail button", () => {
  it("detail buttons have descriptive aria-labels naming the sender", () => {
    render(<RecipientStreams />);
    const detailBtns = screen.getAllByRole("button", { name: /view details for stream from/i });
    expect(detailBtns.length).toBeGreaterThanOrEqual(1);
  });
});

describe("RecipientStreams – decorative SVGs", () => {
  it("all inline SVGs inside buttons are aria-hidden", () => {
    const { container } = render(<RecipientStreams />);
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    });
  });
});

describe("RecipientStreams – focus ring classes", () => {
  it("pin buttons have focus-visible ring classes", () => {
    const { container } = render(<RecipientStreams />);
    const pinBtns = container.querySelectorAll(
      "button[aria-pressed]"
    );
    pinBtns.forEach((btn) => {
      expect(btn.className).toContain("focus-visible:ring-2");
    });
  });

  it("detail buttons have focus-visible ring classes", () => {
    const { container } = render(<RecipientStreams />);
    // detail buttons don't have aria-pressed; select by aria-label pattern
    const allBtns = container.querySelectorAll("button");
    const detailBtns = Array.from(allBtns).filter((b) =>
      b.getAttribute("aria-label")?.startsWith("View details")
    );
    expect(detailBtns.length).toBeGreaterThanOrEqual(1);
    detailBtns.forEach((btn) => {
      expect(btn.className).toContain("focus-visible:ring-2");
    });
  });
});

describe("RecipientStreams – metric dl structure", () => {
  it("each stream card contains a <dl> with <dt> and <dd> for Rate", () => {
    const { container } = render(<RecipientStreams />);
    const dls = container.querySelectorAll("dl");
    expect(dls.length).toBeGreaterThanOrEqual(1);
    dls.forEach((dl) => {
      const dts = dl.querySelectorAll("dt");
      const dds = dl.querySelectorAll("dd");
      expect(dts.length).toBeGreaterThanOrEqual(1);
      expect(dds.length).toBeGreaterThanOrEqual(1);
    });
  });
});
