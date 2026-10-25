import fs from 'node:fs';
import path from 'node:path';

/**
 * Audit code cleanliness for PasokMataram production code.
 * Enforces zero raw emojis and zero non-JSDoc comments.
 */

const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;

const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  'out',
  'coverage',
  '.turbo',
  '.git',
]);

const SCANNED_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.jsx']);

/**
 * Recursively find production code files.
 */
function collectProductionFiles(dir) {
  const collected = [];
  if (!fs.existsSync(dir)) return collected;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      collected.push(...collectProductionFiles(fullPath));
    } else if (entry.isFile()) {
      if (entry.name.endsWith('.d.ts')) continue;
      if (entry.name.includes('.test.') || entry.name.includes('.spec.')) continue;
      const ext = path.extname(entry.name);
      if (SCANNED_EXTS.has(ext)) {
        collected.push(fullPath);
      }
    }
  }
  return collected;
}

/**
 * Scan a single file for raw emojis and forbidden comments.
 */
function inspectFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations = [];
  const lines = content.split('\n');

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    if (EMOJI_REGEX.test(line)) {
      violations.push({
        line: idx + 1,
        type: 'RAW_EMOJI',
        text: line.trim(),
      });
    }
  }

  let pos = 0;
  let lineNum = 1;
  const len = content.length;
  let prevNonWs = '';

  while (pos < len) {
    const char = content[pos];

    if (char === '\n') {
      lineNum++;
      pos++;
      continue;
    }

    if (/\s/.test(char)) {
      pos++;
      continue;
    }

    if (char === "'") {
      pos++;
      while (pos < len && content[pos] !== "'") {
        if (content[pos] === '\\') pos++;
        if (content[pos] === '\n') lineNum++;
        pos++;
      }
      pos++;
      prevNonWs = "'";
      continue;
    }

    if (char === '"') {
      pos++;
      while (pos < len && content[pos] !== '"') {
        if (content[pos] === '\\') pos++;
        if (content[pos] === '\n') lineNum++;
        pos++;
      }
      pos++;
      prevNonWs = '"';
      continue;
    }

    if (char === '`') {
      pos++;
      while (pos < len && content[pos] !== '`') {
        if (content[pos] === '\\') pos++;
        if (content[pos] === '\n') lineNum++;
        pos++;
      }
      pos++;
      prevNonWs = '`';
      continue;
    }

    if (char === '/' && pos + 1 < len) {
      const nextChar = content[pos + 1];

      if (nextChar === '/') {
        const lineContent = lines[lineNum - 1] || '';
        violations.push({
          line: lineNum,
          type: 'SINGLE_LINE_COMMENT',
          text: lineContent.trim(),
        });
        while (pos < len && content[pos] !== '\n') pos++;
        continue;
      }

      if (nextChar === '*') {
        const isJsDoc = pos + 2 < len && content[pos + 2] === '*' && (pos + 3 >= len || content[pos + 3] !== '/');
        if (!isJsDoc) {
          const lineContent = lines[lineNum - 1] || '';
          violations.push({
            line: lineNum,
            type: 'NON_JSDOC_BLOCK_COMMENT',
            text: lineContent.trim(),
          });
        }
        pos += 2;
        while (pos < len - 1 && !(content[pos] === '*' && content[pos + 1] === '/')) {
          if (content[pos] === '\n') lineNum++;
          pos++;
        }
        pos += 2;
        prevNonWs = '/';
        continue;
      }

      if (/[(=:;,!&|?~^{}[*]/.test(prevNonWs) || !prevNonWs) {
        pos++;
        let inCharClass = false;
        while (pos < len && (content[pos] !== '/' || inCharClass)) {
          if (content[pos] === '\\') {
            pos++;
          } else if (content[pos] === '[') {
            inCharClass = true;
          } else if (content[pos] === ']') {
            inCharClass = false;
          }
          if (content[pos] === '\n') lineNum++;
          pos++;
        }
        pos++;
        while (pos < len && /[a-z]/i.test(content[pos])) pos++;
        prevNonWs = '/';
        continue;
      }
    }

    prevNonWs = char;
    pos++;
  }

  return violations;
}

/**
 * Execute cleanliness audit over specified target directories.
 */
function runAudit() {
  const targetDirs = ['apps', 'packages', 'services'];
  const allFiles = targetDirs.flatMap((d) => collectProductionFiles(d));

  let totalViolations = 0;
  for (const file of allFiles) {
    const fileViolations = inspectFile(file);
    if (fileViolations.length > 0) {
      totalViolations += fileViolations.length;
      console.error(`[AUDIT FAILED] ${file}`);
      for (const v of fileViolations) {
        console.error(`  Line ${v.line} [${v.type}]: ${v.text}`);
      }
    }
  }

  if (totalViolations > 0) {
    console.error(`Cleanliness audit failed with ${totalViolations} violation(s).`);
    process.exit(1);
  }

  console.log(`Cleanliness audit passed: ${allFiles.length} files verified with 0 violations.`);
  process.exit(0);
}

runAudit();
