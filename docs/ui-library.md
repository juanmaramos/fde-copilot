# Consume the UI library

## Decision

Use the published `@openai/apps-sdk-ui` package. Keep fde studio's scaffolding and product components in this repository. Do not fork the library or port its standard controls into local code.

The audited baseline is **0.2.2**, upstream commit [`0f00143c7a639906f1621fe58e1b6be7b5bea46d`](https://github.com/openai/apps-sdk-ui/tree/0f00143c7a639906f1621fe58e1b6be7b5bea46d). It supports React 18/19 and Tailwind 4. The frontend uses React 19, TypeScript and Tailwind 4; exact installed versions live in `package-lock.json`. The package is MIT licensed.

Pin the dependency and commit the generated lockfile:

```sh
npm install --save-exact @openai/apps-sdk-ui@0.2.2
```

Review the resolved dependency graph and advisories when changing the lockfile. Use `npm ci --ignore-scripts` to install the reviewed baseline.

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

| Use upstream directly                                                             | Compose in fde studio                                |
| --------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Buttons, inputs, badges, menus, tooltips, popovers, alerts and loading indicators | Source index and passage viewer                      |
| Typography, spacing, surfaces, color and control tokens                           | Cited brief, proposed changes and client questions   |
| Accessible control behavior                                                       | Evidence requirements and an explicit stage decision |

The complete library stays available through its public exports. Do not copy every component into our repository or wrap controls just to rename them. Build semantic lists, tables and disclosure sections where appropriate; the audited package has no `Table`, `Accordion` or `Drawer` component entrypoint.

## Navigation

Place hierarchical navigation at the start of the content header, above the title. Keep it inside our app, below any host chrome. Use the same destination names in navigation, headings and breadcrumbs.

For a source detail page, the hierarchy is `Harbor Studio → Sources → intake-sop.md`. Parent items are links; the current item is text. The Sources link restores the list's filters, page, scroll and selection. It does not mean browser history back, and a folder path is document metadata unless folders are actual navigable views.

In narrow panels, replace a long trail with `← Sources` in that same header position and use the document title below it. Do not also render a second Back to sources control. In a wide list/detail layout, keep the list visible and omit the return control.

Breadcrumbs describe hierarchy. A contextual Return to qualification link may coexist when a source was opened from the brief, because that destination differs from the parent list. Show it only when that return context exists. Keep review/save actions separate from navigation.

On a source detail page, list counts, search and location filters belong to the list view. Do not repeat them above the document and push its navigation down the panel. Top-level pages, inline previews and dialogs do not need artificial breadcrumb levels.

Use semantic links and a labelled navigation landmark. Decorative separators stay out of accessible names. Follow the [WAI breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/); build this small composition from semantic HTML and SDK TextLink rather than inventing an SDK Breadcrumb component.

## Working density and privacy

Source headers show type and any known attribution or source date as quiet labeled facts. Omit unknown attribution and dates from the header; show the gaps under `Source details`, alongside location, source version and the application's record revision. A source can remain useful without an identified person. Import adapters should use email headers, document properties or explicit source statements, keeping inferred attribution reviewable and separate from who uploaded the file and when. Filenames, filesystem owners and names mentioned in the body do not establish authorship. The preview uses prepared values; metadata corrections through chat belong to the future import flow. Stage decisions still require a named authority.

Use a leading SDK icon in source-list rows for email, presentations, spreadsheets and documents, with a generic file fallback. Keep the text type available and the icon decorative. The open record uses its text type without repeating the icon.

Use 20px page titles in narrow panels and 24px in wide views, 16px section headings and 14px working copy. Avoid large introductory text and repeated client-name headings. Keep spacing sufficient for reading and controls, with more detail available on demand. Use SDK icons beside navigation labels; icon-only actions require an accessible name and a tooltip.

The engagement switcher shows the current item while closed and supports search. Hide client names substitutes stable engagement aliases in the picker, navigation, breadcrumbs and document title. It does not redact source text, people, filenames or other document contents, and is not an access-control mechanism. State that limitation at the control.

Verify the page at sidebar widths as well as fullscreen. Filters must wrap rather than force the panel wider, tables may scroll inside their own labelled region, and source details must retain a single parent-navigation control.

Below the sidebar breakpoint, keep Overview, Work, Sources and Delivery in a compact floating bottom capsule. Retain labels and 44px tab targets, account for the bottom safe area, and reserve scroll space below the final control. The bar stays inside our app surface. Wider views use the left sidebar instead. Compact views combine the engagement controls in the header and omit the repeated client-name strip.

### Navigation geometry and composition

Apple publishes one [official iOS and iPadOS 27 Figma kit](https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27), linked from [Apple Design Resources](https://developer.apple.com/design/resources/). The public Figma preview requires sign-in for layer inspection. Geometry was verified on 1 November 2026 in Apple's public Sketch kit, revision 36 dated 27 October, rather than inferred from a screenshot or a third-party recreation.

| Reference                                                                                                                               | Verified geometry                                                                  | Application mapping                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Four-tab iPhone capsule](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/B8B0B866-1C91-4C3E-8B20-2AED1FBE5209#Inspect) | 346 × 62; maximum-radius outer shape; 8px horizontal stack insets                  | Maximum width 346px; height 62px; radius 31px; fluid width in narrower panels |
| Active selection in the same component                                                                                                  | Height 54px; radius 27px; 4px vertical inset; 4px horizontal outset beyond its tab | A decorative selection behind the route link; link remains a 54px target      |
| [Sidebar selected row](https://www.sketch.com/s/04c24d8b-38fb-4afb-8836-36617e022f02/f/4BC6FD76-55E2-4E51-A9AA-3C783BB4FD52#Inspector)  | Height 44px; radius 22px                                                           | 44px minimum row with a 22px selection radius                                 |

The kit marks the outer shape and sidebar corners as Apple smooth 60%; the active tab selection is rounded. Standard CSS capsules preserve the measured radii and spacing, but do not reproduce Apple's continuous-corner algorithm or Liquid Glass renderer. Keep SDK colors, typography, icons and focus tokens; do not copy Apple's assets, fonts or multilayer shader approximation into the plugin. The 21px example screen inset supplies the minimum web offset, increased when the host exposes a larger safe area. Reserve content space from the same height and offset tokens.

`WorkspaceNavigation` owns one set of route links in both layouts, including active state and counts. `WorkspaceSidebar` composes the fixed header, scrollable navigation region and footer. This follows the [shadcn sidebar composition](https://ui.shadcn.com/docs/components/base/sidebar) without importing shadcn, Radix or Base UI, or adding unused collapse providers and drawer controls. Apps SDK UI remains the design system. The app-specific geometry tokens are in `src/ui/main.css`; component layout is in `WorkspaceNavigation.module.css`.

## Tokens and meaning

Use SDK semantic tokens for all standard foundations. Add a small FDE alias only when the application gives it a useful meaning. For example, confirmed status can refer to `--color-text-success-soft`; its audited light value is `#008635`, with a different dark-theme value. Do not freeze that hex as the theme-independent definition.

Success means a supported confirmation, passed check or scoped approval. Missing information and blocked work warrant attention. Importing, reading or saving is not a success decision. Processing state is automatic and normally stays out of the user's way.

If another tool later needs token exchange, export our additional tokens in DTCG JSON and generate its target format. Do not maintain a second canonical copy of the SDK's token catalogue. React components remain TSX consumed from the package; JSON cannot replace their behavior.

## Packaging and maintenance

Compile UI dependencies and styles at build time into the MCP App resource. The installed plugin should not need an npm install, localhost server or CDN to show its interface. Respect host theme changes through the host adapter; verify light and dark themes, keyboard access and narrow panels.

Use Apps SDK UI as the control styling foundation. Do not add the MCP Extensions SDK's alternative control stylesheet by default; that is another styling option, not a requirement to layer both.

Upgrade the dependency deliberately: review upstream changes, regenerate the lockfile, run component and real-host checks, then review the diff. A temporary patch is appropriate for a demonstrated blocking bug with a tracked upstream issue. A maintained fork requires a separate decision explaining the incompatibility, owner and update strategy. [Official UI guidance](https://developers.openai.com/plugins/concepts/ui-guidelines#design-system) makes the library optional; our choice to standardize on it is a project decision.
