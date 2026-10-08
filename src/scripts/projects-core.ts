export type ProjectKind = 'pub' | 'priv';

export interface ProjectSummary {
  kind: ProjectKind;
  tech: string[];
  wide: boolean;
}

export interface ProjectFilter {
  kind: ProjectKind | 'all';
  tech: string | null;
}

export function filterProjects<T extends ProjectSummary>(
  projects: T[],
  filter: ProjectFilter,
): T[] {
  return projects.filter(
    (project) =>
      (filter.kind === 'all' || project.kind === filter.kind) &&
      (!filter.tech || project.tech.includes(filter.tech)),
  );
}

export function projectColumnSpans(
  visible: ProjectSummary[],
  showOriginalLayout: boolean,
): number[] {
  const originalLayout = () => visible.map((project) => (project.wide ? 3 : 2));
  if (showOriginalLayout || visible.length === 7) return originalLayout();
  if (visible.length === 1) return [6];
  if (visible.length === 2 || visible.length === 4) return visible.map(() => 3);
  if (visible.length === 3 || visible.length === 6) return visible.map(() => 2);
  if (visible.length === 5) return [2, 2, 2, 3, 3];
  return visible.map(() => 3);
}
