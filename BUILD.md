# Building the Saunahuus jumbotron displays

The two TV displays are **standalone HTML files** (one HTML file = everything
needed to render, no server). Their React UI is written in **JSX**, which a
browser can't run directly. This build step precompiles the JSX into plain
JavaScript ahead of time, so the production files load with **no in-browser
Babel transformer** (faster, and no "precompile your scripts for production"
warning).

## Layout

```
src/
  sauna.html    ← editable SOURCE (JSX, Sauna display)
  baeder.html   ← editable SOURCE (JSX, Bäder display)
build/
  build.js      ← the compiler
package.json    ← npm scripts + Babel dev dependencies

Saunahuus Status Jumbotron _standalone_sauna.html    ← BUILD OUTPUT (deploy this)
Saunahuus Status Jumbotron _standalone_baeder.html   ← BUILD OUTPUT (deploy this)
```

> **Source of truth = `src/`.** The two root `…_standalone_*.html` files are
> generated — never hand-edit them, your changes get overwritten on the next
> build. Always edit `src/` and rebuild.

## Prerequisites

- [Node.js](https://nodejs.org) 18 or newer
- Install the build dependencies once:

  ```sh
  npm install
  ```

  (`node_modules/` is git-ignored — it's only needed to build, not to deploy.)

## Build

From the project root:

```sh
npm run build
```

This compiles every file in `src/` to its matching production file at the root
and prints what it wrote. Deploy the generated `…_standalone_*.html` files to
the TV displays.

## Editing

- **Changing config values** (load colour, accent, slideshow speed, API URLs,
  toggles like `showNews` / `showAufgussplan`): edit the `CONFIG` block near the
  top of the `<script>` in the relevant `src/*.html`, then `npm run build`.
  `CONFIG` is plain JavaScript — no JSX — so it stays easy to edit.

- **Changing the UI / layout** (components, JSX markup): edit the JSX in the
  `src/*.html` `<script type="text/babel">` block, then `npm run build`.

## How it works

`build/build.js`:

1. Finds the `<script type="text/babel" data-presets="react">…</script>` block
   in each source file.
2. Compiles its JSX with `@babel/preset-react` (classic runtime → uses the
   global `React`/`ReactDOM` loaded from the CDN). Comments are preserved and
   the output is **not** minified, so the `CONFIG` block stays readable.
3. Writes the production file: the compiled code is inlined into a plain
   `<script>`, and the `@babel/standalone` CDN `<script>` is removed.

React and ReactDOM are still loaded from the unpkg CDN (production builds). Only
the Babel transformer was removed. If the displays ever need to run fully
offline, vendor `react`/`react-dom` into a local folder the same way the fonts
are bundled.
