#!/usr/bin/env node
/*
 * Build step for the Saunahuus status jumbotron displays.
 *
 * Each source file in src/ is a standalone HTML page whose React UI is written
 * in JSX inside a <script type="text/babel"> block. The browser cannot run JSX
 * directly, so this script precompiles the JSX to plain React.createElement
 * calls (via @babel/preset-react) and writes a production HTML file that needs
 * no in-browser Babel transformer.
 *
 * Run from the project root:  npm run build
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

const ROOT = path.join(__dirname, '..');

// Map each editable JSX source → the deployed production HTML file.
const TARGETS = [
  { src: 'src/sauna.html',  dist: 'Saunahuus Status Jumbotron _standalone_sauna.html'  },
  { src: 'src/baeder.html', dist: 'Saunahuus Status Jumbotron _standalone_baeder.html' },
];

// Matches the in-browser Babel script block that holds the JSX source.
const SCRIPT_RE = /<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/;
// The CDN <script> that loads the in-browser transformer (dropped in the build).
const BABEL_CDN_RE = /\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>/;

function build({ src, dist }) {
  const srcPath = path.join(ROOT, src);
  const distPath = path.join(ROOT, dist);

  const html = fs.readFileSync(srcPath, 'utf8');
  const match = html.match(SCRIPT_RE);
  if (!match) {
    throw new Error(`No <script type="text/babel"> block found in ${src}`);
  }

  const out = babel.transformSync(match[1], {
    presets: [['@babel/preset-react', { runtime: 'classic' }]],
    comments: true,   // keep the documented CONFIG block readable
    compact: false,   // keep output human-readable, not minified
    babelrc: false,
    configFile: false,
  });

  // Re-indent the compiled JS by 4 spaces to sit nicely inside the HTML.
  const compiled = '\n' + out.code.split('\n').map(l => (l ? '    ' + l : l)).join('\n') + '\n  ';

  const result = html
    .replace(BABEL_CDN_RE, '')                          // drop the in-browser transformer
    .replace(SCRIPT_RE, '<script>' + compiled + '</script>');

  fs.writeFileSync(distPath, result);
  console.log(`✓ ${src} → ${dist}`);
}

try {
  TARGETS.forEach(build);
  console.log('Build complete.');
} catch (err) {
  console.error('Build failed: ' + err.message);
  process.exit(1);
}
