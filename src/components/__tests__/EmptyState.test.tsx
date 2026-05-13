import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EmptyState from "../EmptyState";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns all SVG elements inside the given container. */
function getAllSvgs(container: HTMLElement) {
  return Array.from(container.querySelectorAll("svg"));
}

// ── aria-hidden on decorative SVGs ────────────────────────────────────────────

describe("EmptyState — decorative SVGs have aria-hidden='true'", () => {
  const variants = ["treasury", "streams", "recipient"] as const;

  variants.forEach((variant) => {
    it(`all SVGs in the ${variant} variant are aria-hidden`, () => {
      const { container } = render(
        <EmptyState variant={variant} walletConnected={false} />
      );
      const svgs = getAllSvgs(container);
      expect(svgs.length).toBeGreaterThan(0);
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute("aria-hidden", "true");
      });
    });

    it(`all SVGs in the ${variant} variant (connected) are aria-hidden`, () => {
      const { container } = render(
        <EmptyState variant={variant} walletConnected={true} />
      );
      const svgs = getAllSvgs(container);
      expect(svgs.length).toBeGreaterThan(0);
      svgs.forEach((svg) => {
        expect(svg).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  it("error banner SVG is aria-hidden", () => {
    const { container } = render(
      <EmptyState variant="treasury" walletConnected={true} error="Something went wrong" />
    );
    const svgs = getAllSvgs(container);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });
});

// ── Accessible region label ───────────────────────────────────────────────────

describe("EmptyState — accessible region labels", () => {
  it("treasury variant has correct region label", () => {
    render(<EmptyState variant="treasury" />);
    expect(screen.getByRole("region", { name: "Treasury empty state" })).toBeInTheDocument();
  });

  it("streams variant has correct region label", () => {
    render(<EmptyState variant="streams" />);
    expect(screen.getByRole("region", { name: "Streams empty state" })).toBeInTheDocument();
  });

  it("recipient variant has correct region label", () => {
    render(<EmptyState variant="recipient" />);
    expect(screen.getByRole("region", { name: "Recipient empty state" })).toBeInTheDocument();
  });
});

// ── Loading skeleton ──────────────────────────────────────────────────────────

describe("EmptyState — loading state", () => {
  it("renders loading skeleton with role=status", () => {
    render(<EmptyState variant="treasury" loading={true} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("loading skeleton has accessible label", () => {
    render(<EmptyState variant="treasury" loading={true} />);
    expect(screen.getByRole("status", { name: "Loading content" })).toBeInTheDocument();
  });
});

// ── Error banner ──────────────────────────────────────────────────────────────

describe("EmptyState — error state", () => {
  it("renders error message in an alert role", () => {
    render(<EmptyState variant="treasury" error="Network error" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("renders retry button when onRetry is provided", () => {
    const onRetry = vi.fn();
    render(<EmptyState variant="treasury" error="Oops" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /retry/i });
    expect(btn).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const onRetry = vi.fn();
    const { getByRole } = render(
      <EmptyState variant="treasury" error="Oops" onRetry={onRetry} />
    );
    getByRole("button", { name: /retry/i }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

// ── CTA button ────────────────────────────────────────────────────────────────

describe("EmptyState — CTA button", () => {
  it("renders CTA with correct aria-label when disconnected", () => {
    render(<EmptyState variant="treasury" walletConnected={false} />);
    expect(screen.getByRole("button", { name: "Connect wallet" })).toBeInTheDocument();
  });

  it("renders CTA with correct aria-label when connected (treasury)", () => {
    render(<EmptyState variant="treasury" walletConnected={true} />);
    expect(screen.getByRole("button", { name: "Create stream" })).toBeInTheDocument();
  });

  it("calls onPrimaryAction when CTA is clicked", () => {
    const onPrimaryAction = vi.fn();
    render(
      <EmptyState variant="treasury" walletConnected={true} onPrimaryAction={onPrimaryAction} />
    );
    screen.getByRole("button", { name: "Create stream" }).click();
    expect(onPrimaryAction).toHaveBeenCalledTimes(1);
  });
});
