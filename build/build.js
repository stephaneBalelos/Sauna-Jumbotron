#!/usr/bin/env node
/*
 * Build step for the Saunahuus status jumbotron displays.
 *
 * Each source file in src/ is a standalone HTML page whose React UI is written
 * in JSX inside a <script type="text/babel"> block. The browser cannot run JSX
 * directly, so this script precompiles the JSX to plain React.createElement
 * calls (via @babel/preset-react) so the production output needs no in-browser
 * Babel transformer.
 *
 * Two output modes:
 *
 *   inline (default) — `pnpm build`
 *     The compiled JS is inlined back into the page. Result is a single,
 *     fully self-contained HTML file (good for "drop one file on the display").
 *     Output: the root "…_standalone_*.html" files.
 *
 *   split — `pnpm build:s`
 *     The compiled JS is written to its own .js file and the HTML references it
 *     with <script src>. Keeps the HTML small; the .js is meant to be hosted
 *     remotely. Set the REMOTE_BASE env var to prefix the script URL, e.g.
 *       REMOTE_BASE="https://cdn.example.com/jumbotron/" pnpm build:s
 *     Output: dist/<name>.html + dist/<name>.js
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');
const SPLIT = process.argv.includes('--split');
// Prefix for the external <script src> in split mode (where the .js is hosted).
// Empty → relative path (script sits next to the HTML).
const REMOTE_BASE = process.env.REMOTE_BASE || '';

const TARGETS = [
  { src: 'src/sauna.html',  name: 'sauna',  inlineDist: 'Saunahuus Status Jumbotron _standalone_sauna.html'  },
  { src: 'src/baeder.html', name: 'baeder', inlineDist: 'Saunahuus Status Jumbotron _standalone_baeder.html' },
];

// Matches the in-browser Babel script block that holds the JSX source.
const SCRIPT_RE = /<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/;
// The CDN <script> that loads the in-browser transformer (dropped in the build).
const BABEL_CDN_RE = /\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>/;

function compile(jsx) {
  return babel.transformSync(jsx, {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    comments: true,   // keep the documented CONFIG block readable
    compact: false,   // keep output human-readable, not minified
    babelrc: false,
    configFile: false,
  }).code;
}

function readSource({ src }) {
  const html = fs.readFileSync(path.join(ROOT, src), 'utf8');
  const match = html.match(SCRIPT_RE);
  if (!match) throw new Error(`No <script type="text/babel"> block found in ${src}`);
  return { html, jsx: match[1] };
}

function buildInline(target) {
  const { html, jsx } = readSource(target);
  // Re-indent the compiled JS by 4 spaces to sit nicely inside the HTML.
  const code = '\n' + compile(jsx).split('\n').map(l => (l ? '    ' + l : l)).join('\n') + '\n  ';
  const result = html
    .replace(BABEL_CDN_RE, '')
    .replace(SCRIPT_RE, '<script>' + code + '</script>');
  fs.writeFileSync(path.join(ROOT, target.inlineDist), result);
  console.log(`✓ ${target.src} → ${target.inlineDist}`);
}

function buildSplit(target) {
  const { html, jsx } = readSource(target);
  const jsFile = `${target.name}.js`;
  const scriptSrc = `${REMOTE_BASE}${jsFile}`;

  // Write the compiled JS to its own file.
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'dist', jsFile), compile(jsx) + '\n');

  // Slim HTML: external <script src> instead of the inlined code.
  const result = html
    .replace(BABEL_CDN_RE, '')
    .replace(SCRIPT_RE, `<script src="${scriptSrc}"></script>`);
  fs.writeFileSync(path.join(ROOT, 'dist', `${target.name}.html`), result);
  console.log(`✓ ${target.src} → dist/${target.name}.html + dist/${jsFile}  (src="${scriptSrc}")`);
}

try {
  const build = SPLIT ? buildSplit : buildInline;
  TARGETS.forEach(build);
  console.log(`Build complete (${SPLIT ? 'split' : 'inline'}).`);
} catch (err) {
  console.error('Build failed: ' + err.message);
  process.exit(1);
}
