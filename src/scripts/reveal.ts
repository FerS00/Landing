const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  document.querySelectorAll<HTMLElement>('.reveal').forEach((element) => {
    if (element.getBoundingClientRect().top > window.innerHeight) observer.observe(element);
  });
}
