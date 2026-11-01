import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "react-router/dom";
import { createFixtureRepository } from "../data/fixture-repository";
import { RepositoryContext } from "../data/context";
import { createWorkspaceRouter } from "../router";
import type { EngagementRepository } from "../domain/types";

beforeAll(() => {
  window.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

function open(repository: EngagementRepository, path: string) {
  const router = createWorkspaceRouter(repository, {
    embedded: true,
    initialEntries: [path],
  });
  render(
    <RepositoryContext value={repository}>
      <RouterProvider router={router} />
    </RepositoryContext>,
  );
  return router;
}

async function withFiles() {
  const repository = createFixtureRepository();
  await repository.execute(
    { type: "load-client-files", engagementId: "harbor" },
    0,
  );
  return repository;
}

describe("workspace interactions", () => {
  it("opens a cited passage and returns to the brief without a per-file review step", async () => {
    const repository = await withFiles();
    const user = userEvent.setup();
    open(repository, "/engagements/harbor/work/qualification");
    await screen.findByRole("heading", { name: "Qualification" });
    await user.click(screen.getByRole("link", { name: "S02 · Paragraph 2" }));
    await screen.findByRole("heading", {
      name: "Access and the request sample",
    });
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /mark.*review/i })).toBeNull();
    await user.click(
      screen.getByRole("link", { name: "Return to qualification" }),
    );
    await screen.findByRole("heading", { name: "Qualification" });
    await user.click(screen.getByRole("button", { name: "Save brief review" }));
    await waitFor(() =>
      expect(
        (
          screen.getByRole("button", {
            name: "Record decision",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true),
    );
    await user.type(
      screen.getByRole("textbox", { name: "Reason and next action" }),
      "The brief has been reviewed.",
    );
    expect(
      (
        screen.getByRole("button", {
          name: "Record decision",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    await expect(getConfirmed(repository)).resolves.toBe(false);
  });

  it("preserves the source list page when returning from a file", async () => {
    const repository = await withFiles();
    await repository.execute(
      { type: "load-folder", engagementId: "harbor" },
      1,
    );
    const user = userEvent.setup();
    const router = open(repository, "/engagements/harbor/sources?page=2");
    await screen.findByRole("heading", { name: "Sources" });
    await user.click(screen.getByRole("link", { name: "event-fields.csv" }));
    await screen.findByRole("heading", { name: "event-fields.csv" });
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.queryByRole("button", { name: /read|review/i })).toBeNull();
    await user.click(screen.getByRole("link", { name: "Sources" }));
    await screen.findByRole("heading", { name: "Sources" });
    expect(router.state.location.search).toBe("?page=2");
    expect(screen.getByText("Page 2 of 3")).toBeTruthy();
  });

  it("shows aliases in the switcher and navigation when client names are hidden", async () => {
    const repository = createFixtureRepository();
    await repository.execute(
      {
        type: "create",
        client: "Linden Services",
        problem: "Reduce repeat invoice checks.",
        operator: "Finance team",
        constraint: "",
      },
      0,
    );
    const user = userEvent.setup();
    open(repository, "/engagements/harbor/overview");
    await screen.findByRole("heading", { name: "Overview" });
    await user.click(screen.getByRole("button", { name: "Hide client names" }));
    await waitFor(() =>
      expect(
        screen.getByRole("banner", { name: "Engagement header" }).textContent,
      ).toContain("Engagement 01"),
    );
    expect(screen.queryByRole("button", { name: "Harbor Studio" })).toBeNull();
    expect(screen.queryByText("Linden Services", { exact: true })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Show client names" }),
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Engagement 01" }));
    await user.click(
      await screen.findByRole("option", { name: "Engagement 02" }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("banner", { name: "Engagement header" }).textContent,
      ).toContain("Engagement 02"),
    );
  });

  it("keeps edits when a stage navigation is cancelled", async () => {
    const repository = await withFiles();
    const user = userEvent.setup();
    open(repository, "/engagements/harbor/work/qualification");
    const brief = await screen.findByRole("textbox", {
      name: "Qualification brief content",
    });
    await user.type(brief, "\nA new question needs discussion.");
    await user.click(screen.getByRole("link", { name: "Overview" }));
    await screen.findByRole("alertdialog", { name: "Unsaved changes" });
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(
      (
        screen.getByRole("textbox", {
          name: "Qualification brief content",
        }) as HTMLTextAreaElement
      ).value,
    ).toContain("A new question needs discussion.");
  });
});

async function getConfirmed(repository: EngagementRepository) {
  const workspace = await repository.read();
  return workspace.engagements[0].steps[0].decision?.path === "advance";
}
