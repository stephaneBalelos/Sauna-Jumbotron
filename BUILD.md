# Building the Saunahuus jumbotron displays

The two TV displays are driven by React UIs written in **JSX**, which a browser
can't run directly. This build step precompiles the JSX into plain JavaScript
ahead of time, so the production output loads with **no in-browser Babel
transformer** (faster, and no "precompile your scripts for production" warning).

There are two output modes:

| Mode | Command | Output | Use when |
|------|---------|--------|----------|
| **inline** | `pnpm build` | one self-contained HTML file per display | you want a single file to drop on the display |
| **split** | `pnpm build:s` | slim HTML + a separate `.js` file | the JS is hosted remotely and the HTML just links to it |

## Layout

```
src/
  sauna.html    ← editable SOURCE (JSX, Sauna display)
  baeder.html   ← editable SOURCE (JSX, Bäder display)
build/
  build.js      ← the compiler (both modes)
package.json    ← pnpm scripts + Babel dev dependencies

# inline build output (committed, deploy these):
Saunahuus Status Jumbotron _standalone_sauna.html
Saunahuus Status Jumbotron _standalone_baeder.html

# split build output (git-ignored, regenerable):
dist/
  sauna.html   + sauna.js
  baeder.html  + baeder.js
```

> **Source of truth = `src/`.** Every file outside `src/` here is generated —
> never hand-edit the `…_standalone_*.html` files or anything in `dist/`, your
> changes get overwritten on the next build. Always edit `src/` and rebuild.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer and [pnpm](https://pnpm.io)
- Install the build dependencies once:

  ```sh
  pnpm install
  ```

  (`node_modules/` is git-ignored — it's only needed to build, not to deploy.)

## Inline build (single file)

```sh
pnpm build
```

Compiles each `src/` file and inlines the result, producing the self-contained
`…_standalone_*.html` files at the project root. Deploy those files as-is.

## Split build (HTML + remote JS)

```sh
pnpm build:s
```

Writes, for each display, into `dist/`:

- `<name>.js` — the compiled JavaScript (upload this to wherever you host it)
- `<name>.html` — a slim page that loads `<name>.js` via `<script src>`

By default the `<script src>` is a **relative** path (`sauna.js`), i.e. the JS
sits next to the HTML. If the JS is hosted somewhere else, set `REMOTE_BASE` to
prefix the URL:

```sh
REMOTE_BASE="https://cdn.example.com/jumbotron/" pnpm build:s
# → <script src="https://cdn.example.com/jumbotron/sauna.js"></script>
```

React and ReactDOM are still loaded from the unpkg CDN in both modes; only the
compiled app JS is split out.

## Editing

- **Changing config values** (load colour, accent, slideshow speed, API URLs,
  toggles like `showNews` / `showAufgussplan`): edit the `CONFIG` block near the
  top of the `<script>` in the relevant `src/*.html`, then rebuild. `CONFIG` is
  plain JavaScript — no JSX — so it stays easy to edit.

- **Changing the UI / layout** (components, JSX markup): edit the JSX in the
  `src/*.html` `<script type="text/babel">` block, then rebuild.

## How it works

`build/build.js`:

1. Finds the `<script type="text/babel" data-presets="react">…</script>` block
   in each source file.
2. Compiles its JSX with `@babel/preset-react` (classic runtime → uses the
   global `React`/`ReactDOM` loaded from the CDN). Comments are preserved and
   the output is **not** minified, so the `CONFIG` block stays readable.
3. Emits the output for the chosen mode (inline `<script>` or external
   `<script src>` + `.js`), and removes the `@babel/standalone` CDN `<script>`.

If the displays ever need to run fully offline, vendor `react`/`react-dom` into
a local folder the same way the fonts are bundled.
