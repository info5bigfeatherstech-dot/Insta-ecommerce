#!/usr/bin/env node

/**
 * CI/CD & Pre-commit Color Token Audit Script
 * 
 * Scans src/ for hardcoded hex colors and non-semantic fixed Tailwind colors.
 * Excludes approved design token files (globals.css, theme.js) and mock data (src/data/*).
 * 
 * Exit code 0: Clean
 * Exit code 1: Violations found
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Approved files and directories for token definitions and mock data
const EXCLUDED_PATHS = [
  path.join(SRC_DIR, 'app', 'globals.css'),
  path.join(SRC_DIR, 'styles', 'theme.js'),
  path.join(SRC_DIR, 'data'),
  path.join(SRC_DIR, 'hooks', 'use-chart-theme.js'),
  path.join(SRC_DIR, 'lib', 'utils.js'),
  path.join(SRC_DIR, 'services'),
  path.join(SRC_DIR, 'components', 'automations', 'editor', 'nodes', 'sticky-note.jsx')
];

function isExcluded(filePath) {
  const normalized = path.normalize(filePath);
  return EXCLUDED_PATHS.some((ex) => {
    const normEx = path.normalize(ex);
    return normalized === normEx || normalized.startsWith(normEx + path.sep);
  });
}

// Detection regexes
const HEX_REGEX = /#([0-9a-fA-F]{3,8})\b/g;

// Fixed Tailwind classes that bypass the semantic design token system
const FIXED_TW_REGEX = /\b((?:bg|text|border|fill|stroke)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950)))\b/g;

let totalViolations = 0;
const violationsByFile = [];

function scanFile(filePath) {
  if (isExcluded(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const fileViolations = [];

  lines.forEach((line, index) => {
    // Strip comments to prevent false positives in documentation
    const codeOnly = line.replace(/\/\/.*$/, '').replace(/\/\*[\s\S]*?\*\//g, '');

    const hexMatches = codeOnly.match(HEX_REGEX);
    if (hexMatches) {
      hexMatches.forEach((hex) => {
        fileViolations.push({
          line: index + 1,
          type: 'Hardcoded Hex',
          value: hex,
          preview: line.trim()
        });
      });
    }

    const twMatches = codeOnly.match(FIXED_TW_REGEX);
    if (twMatches) {
      twMatches.forEach((tw) => {
        fileViolations.push({
          line: index + 1,
          type: 'Fixed Tailwind Class',
          value: tw,
          preview: line.trim()
        });
      });
    }
  });

  if (fileViolations.length > 0) {
    violationsByFile.push({
      filePath: path.relative(ROOT_DIR, filePath),
      violations: fileViolations
    });
    totalViolations += fileViolations.length;
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (isExcluded(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

console.log('\n🔍 Scanning src/ for non-semantic colors and hardcoded hexes...\n');
walk(SRC_DIR);

if (totalViolations === 0) {
  console.log('✅ PASS: Zero hardcoded hexes or non-semantic color classes found in src/!\n');
  console.log('All components correctly utilize semantic design tokens (bg-background, text-foreground, border-border, bg-card, text-primary, etc.).\n');
  process.exit(0);
} else {
  console.error(`❌ FAIL: Found ${totalViolations} color token violations across ${violationsByFile.length} files:\n`);

  violationsByFile.forEach(({ filePath, violations }) => {
    console.error(`\x1b[31m${filePath}\x1b[0m:`);
    violations.forEach((v) => {
      console.error(`  Line ${v.line}: [${v.type}] "${v.value}" -> \x1b[2m${v.preview}\x1b[0m`);
    });
    console.error('');
  });

  console.error('Please replace hardcoded colors with semantic design tokens defined in globals.css.\n');
  console.error('See docs/THEMING.md for full token guidelines.\n');
  process.exit(1);
}
