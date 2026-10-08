import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sourceRoot = fileURLToPath(new URL('../../src/', import.meta.url));
const sourceExtensions = new Set(['.astro', '.css', '.ts']);
const hexColor = /#[0-9a-fA-F]{3,8}\b/;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!sourceExtensions.has(path.slice(path.lastIndexOf('.')))) return [];
    if (relative(sourceRoot, path).replaceAll('\\', '/') === 'styles/tokens.css') return [];
    return [path];
  });
}

describe('color tokens', () => {
  it('keeps hexadecimal colors in tokens.css', () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const content = readFileSync(path, 'utf8');
      return hexColor.test(content) ? [relative(sourceRoot, path)] : [];
    });

    expect(violations).toEqual([]);
  });
});
