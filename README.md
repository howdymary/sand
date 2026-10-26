# From Sand to Silicon: How Etched Designs Chips

[Open the visual explorer](https://howdymary.github.io/sand/) · [Source repository](https://github.com/howdymary/sand)

A technical essay for experienced engineers paired with a sticky interactive walkthrough, following an inference chip from a server rack into architecture, microarchitecture, design verification, and physical design, then back to the finished system. Ten essay sections synchronize with ten visual chapters: scrolling the prose updates the adjacent visual, and chapter navigation jumps to the corresponding article section. On narrow screens, the prose reads above a synchronized visual panel at the bottom of the window. Hover over a component for a short explanation, or click, tap, or use the keyboard to open its details.

The experience uses a white background, restrained typography, thin rules, and concise captions, drawing on Etched's current technical publishing style. Its opening follows a continuous sequence: the rack comes into focus, a compute tray slides out and turns to an overhead view, photographed tubing and copper surfaces separate, and the real packaged chip leads into conceptual architecture. Scrolling controls the sequence directly, including reversing it; reduced-motion preferences snap between its stages.

The essay follows customer experience and requirements through the four engineering disciplines, organizational design, AI assistance, and software deployment. Views 1, 2, 3, and 10 offer a **Hardware / Diagram** switch. Hardware mode defaults to the photographic opening across the first three views and to current hardware photographs in view 10; Diagram mode illustrates engineering relationships. **View original** opens the full-resolution source photograph. The opening is an explanatory arrangement of photographed regions, rather than a documented service procedure; it depicts no invented hidden board detail.

Compact windows keep the text above a larger photographic canvas. Tight camera bounds follow the rack, extracted tray, cooling, and chip; a linked rack-bay detail uses real pixels from the same official photo. Component controls open through **Inspect** so they do not consume the default viewing area. Wide pages retain the adjacent article and sticky visual.

The implementation uses four local WebP photographs, SVG illustrations, CSS, and native JavaScript modules, with no runtime packages, external fonts, backend, or credentials. The WebP files are quality-95 delivery copies of official high-resolution originals. Image provenance, source and display dimensions, and the observed media-use statement are recorded in [`assets/hardware/README.md`](assets/hardware/README.md). No small website cutouts or older board renders are included; a standalone high-resolution photograph of the current bare board was not found in the available official material or broader coverage.

## Preview locally

For a quick look, open **`preview.html`** in a browser. This generated file contains the complete essay and walkthrough, embeds all four hardware photographs and the scroll-controlled opening, and needs no local server. Regenerate it after source changes:

```sh
node scripts/standalone.mjs
```

For development, use Python 3 to serve the source directory:

```sh
python3 -m http.server 4173
```

Open <http://localhost:4173>. Native JavaScript modules need an HTTP server when loading `index.html`. Use another port if a server is already running.

Node.js 20 or later is required for the build and integrity checks. No dependency installation is required.

## Build the publishable site

```sh
node scripts/check.mjs
node scripts/build.mjs
node scripts/check.mjs --dist
```

The build copies `index.html`, `styles.css`, `src/`, and optional local assets into `dist/`, then adds `.nojekyll`. It preserves the source files byte for byte. Documents, source notes, the README, and the standalone preview are excluded from the deployment artifact.

Checks validate local asset and module paths, chapter and component references, and the deployment artifact. They reject root-relative asset URLs and external runtime dependencies so the site can work at both an account domain and a repository subpath.

To preview the exact deployment artifact:

```sh
cd dist
python3 -m http.server 4173
```

Equivalent `npm run dev`, `npm run build`, and `npm run check` shortcuts are included; `npm install` is unnecessary.

## Publish on GitHub Pages

The included workflow builds and deploys `main` to GitHub Pages. This repository uses GitHub Actions as its Pages source. To publish a fork:

1. Place the **contents of this project directory** at your repository root, including the hidden `.github/` directory. The workflow expects `index.html`, `package.json`, and `scripts/` at the repository root.
2. Use `main` as the publishing branch, or change the branch in `.github/workflows/deploy-pages.yml` to match your repository.
3. In **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source.
4. Push the files to `main`, or run **Actions → Deploy interactive story to GitHub Pages → Run workflow** after enabling Pages.
5. Use the URL shown by the deployment step or **Settings → Pages**. A project repository normally uses `https://OWNER.github.io/REPOSITORY/`.

The workflow checks and builds the site, uploads only `dist/`, and deploys through the `github-pages` environment. It uses the repository's standard workflow token and GitHub's official Pages actions. Repository or organization deployment rules may require an administrator's action.

Keep `.github/` in the source upload. The workflow generates `dist/` on each run, so committing the build directory is unnecessary.

## Edit the visualization

| File | Purpose |
| --- | --- |
| `index.html` | Page shell, metadata, controls, and accessible structure. |
| `styles.css` | Essay and sticky visual layout, chapter navigation, typography, responsive behavior, and motion preferences. |
| `src/essay.js` | Published essay text, ten synchronized sections, and section source links. |
| `src/content.js` | Short chapter captions and component explanations. |
| `src/scene.js` | Conceptual SVG scenes and component regions. |
| `src/scene.css` | Diagram styling and animation. |
| `src/teardown.js` | Reversible scroll-controlled rack, tray, cooling, and chip sequence using photographic regions. |
| `src/teardown.css` | Photographic sequence annotations, layer styling, and motion preferences. |
| `src/app.js` | Article rendering, synchronized scroll transitions, chapter navigation, and component interactions. |
| `assets/hardware/` | Four local official hardware photographs and their source record. |
| `scripts/build.mjs` | Dependency-free build of the essay and visual walkthrough. |
| `scripts/check.mjs` | Source and deployment integrity checks. |
| `scripts/standalone.mjs` | Generates the self-contained `preview.html`. |
| `.github/workflows/deploy-pages.yml` | GitHub Pages build and deployment. |

Keep chapter IDs stable so existing fragment links continue to work. Chapter component IDs must exist in the component map, and each component's `chapter` index must refer to a valid chapter. Keep internal URLs relative, such as `./styles.css` and `./src/app.js`.

For content changes, run the integrity checks and review the affected views in a browser. For layout or interaction changes, also inspect a narrow screen, keyboard controls, reduced-motion preferences, and the complete scroll sequence. Details must remain available through click, tap, and keyboard, independent of hover.

## Scope of the diagrams

Hardware mode displays current photographs from Etched's official homepage and media kit. The opening separates visible photographed regions to explain their relationship and transitions to a separate chip photograph. It is not a documented mechanical teardown or service procedure, and hidden PCB detail is not depicted. Diagram mode contains conceptual illustrations; its layouts, component regions, and annotations do not reproduce an Etched floorplan, package internals, board connectivity, rack configuration, or benchmark. Values and animation timings are illustrative. This is an independent editorial study; the photographs do not imply Etched's affiliation or endorsement. Company-specific claims and branding need Etched's review before an official release.

The site publishes the essay from `src/essay.js` alongside the visual walkthrough. Primary references are linked within the article and available through the Sources control. Local editorial records under `docs/` remain excluded from Git and the published artifact.
