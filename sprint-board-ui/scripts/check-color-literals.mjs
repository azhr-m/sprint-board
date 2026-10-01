#!/usr/bin/env node
// Fails when a component or global style hard-codes a color instead of using var(--token).
// Token files (src/styles/_tokens*.scss) are the only place color literals may live.
//
// Checked: *.scss / *.css under src/, inline `styles:` in *.ts, and style="" / <style> in *.html.
// Escape hatch for a deliberate exception (e.g. per-user avatar hues):
//   add `color-literal-ok` in a comment on the same line.
//
// Usage: node scripts/check-color-literals.mjs   (exit 1 on violations)

import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SRC = join(ROOT, 'src');
const ALLOWED = [/^src\/styles\/_tokens[^/]*\.scss$/];

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;
const FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/gi;

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

/** Blank out comments but keep line breaks so line numbers stay correct. */
function stripComments(css) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return css.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:])\/\/[^\n]*/g, (m, p) => p + blank(m.slice(p.length)));
}

/** Return [offset, text] chunks of a file that contain styles. */
function styleChunks(file, text) {
  if (/\.(s?css)$/.test(file)) return [[0, text]];
  const chunks = [];
  if (file.endsWith('.ts')) {
    for (const m of text.matchAll(/styles\s*:\s*\[?\s*`([\s\S]*?)`/g)) chunks.push([m.index + m[0].indexOf('`') + 1, m[1]]);
  }
  if (file.endsWith('.html')) {
    for (const m of text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) chunks.push([m.index + m[0].indexOf('>') + 1, m[1]]);
    for (const m of text.matchAll(/\sstyle\s*=\s*"([^"]*)"/gi)) chunks.push([m.index + m[0].indexOf('"') + 1, m[1]]);
  }
  return chunks;
}

const violations = [];

for (const file of walk(SRC)) {
  if (!/\.(scss|css|ts|html)$/.test(file) || file.endsWith('.spec.ts')) continue;
  const rel = relative(ROOT, file).split(sep).join('/');
  if (ALLOWED.some((re) => re.test(rel))) continue;

  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');

  for (const [offset, chunk] of styleChunks(file, text)) {
    const clean = stripComments(chunk);
    for (const re of [HEX, FN]) {
      for (const m of clean.matchAll(re)) {
        const line = text.slice(0, offset + m.index).split('\n').length;
        if (lines[line - 1].includes('color-literal-ok')) continue;
        violations.push(`${rel}:${line}  ${m[0].trim()}  →  use a var(--…) token`);
      }
    }
  }
}

if (violations.length) {
  console.error(`Color literals found outside src/styles/_tokens*.scss (${violations.length}):\n`);
  console.error(violations.map((v) => '  ' + v).join('\n'));
  process.exit(1);
}
console.log('check-color-literals: OK, no hard-coded colors in component styles.');
