#!/usr/bin/env node
/**
 * Hardcoded Color Checker
 * Scans .tsx, .ts, and .css files for hardcoded color values
 * that should be using Tailwind theme classes (primary-*, secondary-*, accent-*) instead.
 *
 * Usage: node scripts/check-hardcoded-colors.js
 */

const fs = require('fs');
const path = require('path');

// ─── Configuration ───────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const SCAN_DIRS = ['app', 'components', 'styles'];
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css'];
const IGNORE_DIRS = ['node_modules', '.next', 'dist', 'build', '__tests__', 'scripts'];
const IGNORE_FILES = ['tailwind.config.js', 'postcss.config.mjs', 'opengraph-image.tsx'];

// Hex color regex: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;

// RGB/RGBA/HSL/HSLA function regex
const COLOR_FN_REGEX = /(?:rgba?|hsla?)\(\s*[\d.,%\s\/]+\)/gi;

// Known safe colors (pure black/white, transparent, inherit, currentColor, etc.)
const SAFE_COLORS = new Set([
  '#000', '#000000', '#fff', '#ffffff',
  '#0000', '#00000000', '#fff0', '#ffffff00',
  '#333', '#333333', '#666', '#666666', '#999', '#999999',
  '#ccc', '#cccccc', '#ddd', '#dddddd', '#eee', '#eeeeee',
  '#f5f5f5', '#fafafa', '#f9fafb', '#f3f4f6', '#e5e7eb',
  '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151',
  '#1f2937', '#111827',
  // Semantic colors (not brand — intentionally hardcoded)
  '#dc2626',  // red for code highlighting
  '#f1f1f1', '#c1c1c1', '#a8a8a8', // scrollbar grays
]);

// Known theme hex values (from globals.css @theme) — these ARE the theme, so finding them
// hardcoded in components means they should use the Tailwind class instead
const THEME_COLORS = {
  // Primary Navy
  '#f0f5f9': 'primary-50',
  '#dce6ef': 'primary-100',
  '#b8cce0': 'primary-200',
  '#8badc9': 'primary-300',
  '#5a89ad': 'primary-400',
  '#2d607f': 'primary-500',
  '#1a4564': 'primary-600',
  '#153a54': 'primary-700',
  '#0f2b3c': 'primary-800',
  '#0a1e2b': 'primary-900',
  // Secondary Slate Teal
  '#f0f9f8': 'secondary-50',
  '#d5efed': 'secondary-100',
  '#acdeda': 'secondary-200',
  '#7cc5bf': 'secondary-300',
  '#4ca69f': 'secondary-400',
  '#2e8a83': 'secondary-500',
  '#236e68': 'secondary-600',
  '#1c5853': 'secondary-700',
  '#16423f': 'secondary-800',
  '#102e2c': 'secondary-900',
  // Accent Emerald
  '#ecfdf5': 'accent-50',
  '#d1fae5': 'accent-100',
  '#a7f3d0': 'accent-200',
  '#6ee7b7': 'accent-300',
  '#34d399': 'accent-400',
  '#10b981': 'accent-500',
  '#059669': 'accent-600',
  '#047857': 'accent-700',
  '#065f46': 'accent-800',
  '#064e3b': 'accent-900',
  // Old blue theme colors (should have been migrated)
  '#3b82f6': 'OLD blue-500 → primary-500',
  '#2563eb': 'OLD blue-600 → primary-600',
  '#1d4ed8': 'OLD blue-700 → primary-700',
  '#dbeafe': 'OLD blue-100 → primary-100',
  '#eff6ff': 'OLD blue-50 → primary-50',
  '#6366f1': 'OLD indigo-500 → secondary-500',
  '#4f46e5': 'OLD indigo-600 → secondary-600',
};

// ─── Scanner ─────────────────────────────────────────────────────────
let totalFiles = 0;
let filesWithIssues = 0;
let totalIssues = 0;
const results = [];

function shouldIgnore(filePath) {
  const rel = path.relative(ROOT, filePath);
  const parts = rel.split(path.sep);
  if (parts.some(p => IGNORE_DIRS.includes(p))) return true;
  if (IGNORE_FILES.includes(path.basename(filePath))) return true;
  return false;
}

function scanFile(filePath) {
  if (shouldIgnore(filePath)) return;

  const ext = path.extname(filePath);
  if (!SCAN_EXTENSIONS.includes(ext)) return;

  totalFiles++;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileIssues = [];
  const isGlobalsCss = path.basename(filePath) === 'globals.css';
  let insideTheme = false;

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Track @theme block in globals.css — colors inside are definitions, not issues
    if (isGlobalsCss) {
      if (trimmed.startsWith('@theme')) { insideTheme = true; return; }
      if (insideTheme && trimmed === '}') { insideTheme = false; return; }
      if (insideTheme) return; // Skip lines inside @theme
    }

    // Skip comments
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

    // Check hex colors
    let match;
    HEX_REGEX.lastIndex = 0;
    while ((match = HEX_REGEX.exec(line)) !== null) {
      const hex = match[0].toLowerCase();

      // Skip safe/neutral colors
      if (SAFE_COLORS.has(hex)) continue;

      // Check if it's a theme color used inline (should use Tailwind class)
      const themeToken = THEME_COLORS[hex];
      if (themeToken) {
        fileIssues.push({
          line: lineNum,
          color: match[0],
          type: 'theme-color-hardcoded',
          suggestion: `Use Tailwind class: bg-${themeToken}, text-${themeToken}, border-${themeToken}, etc.`,
          context: trimmed.substring(0, 120),
        });
      } else {
        // Unknown color not in theme
        fileIssues.push({
          line: lineNum,
          color: match[0],
          type: 'unknown-hardcoded',
          suggestion: 'Consider adding to theme or using an existing theme token',
          context: trimmed.substring(0, 120),
        });
      }
    }

    // Check rgb/rgba/hsl/hsla functions (skip Tailwind opacity modifiers like rgb(var(--...)))
    COLOR_FN_REGEX.lastIndex = 0;
    while ((match = COLOR_FN_REGEX.exec(line)) !== null) {
      const fn = match[0];
      // Skip CSS variable usage
      if (fn.includes('var(')) continue;
      // Skip pure black/white
      if (/rgba?\(\s*0\s*,\s*0\s*,\s*0/.test(fn) || /rgba?\(\s*255\s*,\s*255\s*,\s*255/.test(fn)) continue;

      fileIssues.push({
        line: lineNum,
        color: fn,
        type: 'color-function',
        suggestion: 'Replace with Tailwind theme class',
        context: trimmed.substring(0, 120),
      });
    }
  });

  if (fileIssues.length > 0) {
    filesWithIssues++;
    totalIssues += fileIssues.length;
    results.push({
      file: path.relative(ROOT, filePath),
      issues: fileIssues,
    });
  }
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.includes(entry.name)) {
        scanDir(fullPath);
      }
    } else {
      scanFile(fullPath);
    }
  }
}

// ─── Run ─────────────────────────────────────────────────────────────
console.log('🔍 Scanning for hardcoded colors...\n');

for (const dir of SCAN_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (fs.existsSync(fullDir)) {
    scanDir(fullDir);
  }
}

// ─── Report ──────────────────────────────────────────────────────────
if (results.length === 0) {
  console.log('✅ No hardcoded colors found! All files use theme tokens.\n');
} else {
  console.log(`⚠️  Found ${totalIssues} hardcoded color(s) in ${filesWithIssues} file(s):\n`);

  // Group by type
  const themeHardcoded = [];
  const unknownHardcoded = [];
  const colorFunctions = [];

  for (const r of results) {
    for (const issue of r.issues) {
      const entry = { file: r.file, ...issue };
      if (issue.type === 'theme-color-hardcoded') themeHardcoded.push(entry);
      else if (issue.type === 'unknown-hardcoded') unknownHardcoded.push(entry);
      else colorFunctions.push(entry);
    }
  }

  if (themeHardcoded.length > 0) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🎨 THEME COLORS USED INLINE (${themeHardcoded.length}) — should use Tailwind class`);
    console.log(`${'═'.repeat(70)}`);
    for (const i of themeHardcoded) {
      console.log(`  📄 ${i.file}:${i.line}`);
      console.log(`     Color: ${i.color} → ${i.suggestion}`);
      console.log(`     Code:  ${i.context}`);
      console.log();
    }
  }

  if (unknownHardcoded.length > 0) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🔶 UNKNOWN HARDCODED COLORS (${unknownHardcoded.length}) — not in theme`);
    console.log(`${'═'.repeat(70)}`);
    for (const i of unknownHardcoded) {
      console.log(`  📄 ${i.file}:${i.line}`);
      console.log(`     Color: ${i.color}`);
      console.log(`     Code:  ${i.context}`);
      console.log();
    }
  }

  if (colorFunctions.length > 0) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🟠 COLOR FUNCTIONS (${colorFunctions.length}) — rgb()/hsl() used directly`);
    console.log(`${'═'.repeat(70)}`);
    for (const i of colorFunctions) {
      console.log(`  📄 ${i.file}:${i.line}`);
      console.log(`     Color: ${i.color}`);
      console.log(`     Code:  ${i.context}`);
      console.log();
    }
  }
}

console.log(`\n📊 Summary: Scanned ${totalFiles} files, ${totalIssues} issue(s) in ${filesWithIssues} file(s).`);
process.exit(totalIssues > 0 ? 1 : 0);
