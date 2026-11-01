# Consume the UI library

## Decision

Use the published `@openai/apps-sdk-ui` package. Keep FDE Copilot's scaffolding and product components in this repository. Do not fork the library or port its standard controls into local code.

The audited baseline is **0.2.2**, upstream commit [`0f00143c7a639906f1621fe58e1b6be7b5bea46d`](https://github.com/openai/apps-sdk-ui/tree/0f00143c7a639906f1621fe58e1b6be7b5bea46d). It supports React 18/19 and Tailwind 4; use React 19 and TypeScript for the first UI implementation. The package is MIT licensed. These are verified compatibility facts, not a claim that dependencies are installed here.

When the UI runtime is added, pin the dependency and commit the generated lockfile:

```sh
npm install --save-exact @openai/apps-sdk-ui@0.2.2
```

Install compatible React, React DOM and Tailwind versions in that same implementation change. Review the resolved dependency graph and advisories before choosing the lockfile baseline.

## Imports

Use public component entrypoints directly:

```tsx
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Input } from "@openai/apps-sdk-ui/components/Input";
```

The UI's global stylesheet must load the foundations before component rendering. For a stylesheet at `src/ui/main.css` with dependencies at the repository root:

```css
@import "tailwindcss";
@import "@openai/apps-sdk-ui/css";
@source "../../node_modules/@openai/apps-sdk-ui";
```

Import that stylesheet first in the UI entrypoint. Adjust `@source` if its location changes. `AppsSDKUIProvider` is optional routing configuration, not the MCP connection; add it only when router-aware links need it. Follow the [upstream setup](https://github.com/openai/apps-sdk-ui/blob/0f00143c7a639906f1621fe58e1b6be7b5bea46d/README.md).

## What belongs here

| Use upstream directly | Compose in FDE Copilot |
| --- | --- |
| Buttons, inputs, badges, menus, tooltips, popovers, alerts and loading indicators | Source index and passage viewer |
| Typography, spacing, surfaces, color and control tokens | Cited brief, proposed changes and client questions |
| Accessible control behavior | Evidence requirements and an explicit stage decision |

The complete library stays available through its public exports. Do not copy every component into our repository or wrap controls just to rename them. Build semantic lists, tables and disclosure sections where appropriate; the audited package has no `Table`, `Accordion` or `Drawer` component entrypoint.

## Tokens and meaning

Use SDK semantic tokens for all standard foundations. Add a small FDE alias only when the application gives it a useful meaning. For example, confirmed status can refer to `--color-text-success-soft`; its audited light value is `#008635`, with a different dark-theme value. Do not freeze that hex as the theme-independent definition.

Success means a supported confirmation, passed check or scoped approval. Missing information and blocked work warrant attention. Importing, reading or saving is not a success decision. Processing state is automatic and normally stays out of the user's way.

If another tool later needs token exchange, export our additional tokens in DTCG JSON and generate its target format. Do not maintain a second canonical copy of the SDK's token catalogue. React components remain TSX consumed from the package; JSON cannot replace their behavior.

## Packaging and maintenance

Compile UI dependencies and styles at build time into the MCP App resource. The installed plugin should not need an npm install, localhost server or CDN to show its interface. Respect host theme changes through the host adapter; verify light and dark themes, keyboard access and narrow panels.

Use Apps SDK UI as the control styling foundation. Do not add the MCP Extensions SDK's alternative control stylesheet by default; that is another styling option, not a requirement to layer both.

Upgrade the dependency deliberately: review upstream changes, regenerate the lockfile, run component and real-host checks, then review the diff. A temporary patch is appropriate for a demonstrated blocking bug with a tracked upstream issue. A maintained fork requires a separate decision explaining the incompatibility, owner and update strategy. [Official UI guidance](https://developers.openai.com/plugins/concepts/ui-guidelines#design-system) makes the library optional; our choice to standardize on it is a project decision.
