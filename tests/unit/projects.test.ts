import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { projectSchema } from '../../src/content/project-schema';
import {
  filterProjects,
  projectColumnSpans,
  type ProjectSummary,
} from '../../src/scripts/projects-core';

const projectsDirectory = fileURLToPath(new URL('../../src/content/projects/', import.meta.url));
const projectFiles = readdirSync(projectsDirectory)
  .filter((file) => file.endsWith('.json'))
  .sort();
const projects = projectFiles.map((file) =>
  projectSchema.parse(JSON.parse(readFileSync(join(projectsDirectory, file), 'utf8'))),
);

describe('project collection', () => {
  it('validates all seven records with unique order and HTTPS URLs', () => {
    expect(projects).toHaveLength(7);
    expect(new Set(projects.map((project) => project.order)).size).toBe(7);
    expect(projects.every((project) => project.url.startsWith('https://'))).toBe(true);
    expect(projects.filter((project) => project.kind === 'pub')).toHaveLength(4);
    expect(projects.filter((project) => project.kind === 'priv')).toHaveLength(3);
  });
});

describe('project filtering and column layout', () => {
  const sample: ProjectSummary[] = projects;

  it('filters by kind and technology together', () => {
    expect(filterProjects(sample, { kind: 'pub', tech: null })).toHaveLength(4);
    expect(filterProjects(sample, { kind: 'priv', tech: null })).toHaveLength(3);
    expect(filterProjects(sample, { kind: 'all', tech: 'Java' })).toHaveLength(2);
    expect(filterProjects(sample, { kind: 'all', tech: 'C++' })).toHaveLength(2);
  });

  it('keeps the prototype layout spans for the visible count', () => {
    const visible = (count: number) => sample.slice(0, count);
    const originalSpans = [3, 3, 2, 2, 2, 3, 3];
    expect(projectColumnSpans(visible(7), true)).toEqual(originalSpans);
    expect(projectColumnSpans(visible(7), false)).toEqual(originalSpans);
    expect(projectColumnSpans(visible(1), false)).toEqual([6]);
    expect(projectColumnSpans(visible(2), false)).toEqual([3, 3]);
    expect(projectColumnSpans(visible(3), false)).toEqual([2, 2, 2]);
    expect(projectColumnSpans(visible(4), false)).toEqual([3, 3, 3, 3]);
    expect(projectColumnSpans(visible(5), false)).toEqual([2, 2, 2, 3, 3]);
    expect(projectColumnSpans(visible(6), false)).toEqual([2, 2, 2, 2, 2, 2]);
  });
});
