export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onVisibilityResume(callback: () => void): () => void {
  const runWhenVisible = () => {
    if (!document.hidden) callback();
  };

  document.addEventListener('visibilitychange', runWhenVisible);
  runWhenVisible();

  return () => document.removeEventListener('visibilitychange', runWhenVisible);
}

type FxEventName = `fx:${string}`;

export function emit(name: FxEventName, detail?: unknown): void {
  if (!name.startsWith('fx:')) throw new Error('Page events must use the fx: prefix.');
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<T = unknown>(name: FxEventName, callback: (detail: T) => void): () => void {
  if (!name.startsWith('fx:')) throw new Error('Page events must use the fx: prefix.');
  const listener = (event: Event) => callback((event as CustomEvent<T>).detail);
  document.addEventListener(name, listener);
  return () => document.removeEventListener(name, listener);
}
