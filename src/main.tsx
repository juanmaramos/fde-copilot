import "./ui/main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { createFixtureRepository } from "./data/fixture-repository";
import { RepositoryContext } from "./data/context";
import { createWorkspaceRouter } from "./router";
import { getBrowserStorage } from "./data/browser-storage";

const repository = createFixtureRepository(getBrowserStorage());
const router = createWorkspaceRouter(
  repository,
  document.documentElement.dataset.routing === "embedded"
    ? { embedded: true }
    : undefined,
);
const root = document.getElementById("root");
if (!root) throw new Error("The workspace root is missing.");
createRoot(root).render(
  <StrictMode>
    <RepositoryContext value={repository}>
      <RouterProvider router={router} />
    </RepositoryContext>
  </StrictMode>,
);
