# Graph Report - LandingPage  (2026-10-08)

## Corpus Check
- 90 files · ~64,369 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 422 nodes · 501 edges · 37 communities (34 shown, 3 thin omitted)
- Extraction labels: 500 EXTRACTED · 1 INFERRED relations. See graph.json for individual evidence.
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2f19d013`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Base.astro
- devDependencies
- contact.ts
- fextracode — DESIGN.md
- scripts
- 6. Fases
- analytics.ts
- Despliegue en Cloudflare Pages
- projects.test.ts
- Design System Master File
- seo.ts
- Estado de trabajo
- tsconfig.json
- og.mjs
- i18n.test.ts
- terminal-core.ts
- privacy.en.md
- privacy.es.md
- Instrucciones del proyecto
- [1.0.0] - 2026-10-08
- Corrección visual de la landing
- .prettierrc.json
- a11y.spec.ts
- pull_request_template.md
- content.test.ts
- no-hex-outside-tokens.test.ts
- playwright.config.ts
- home.spec.ts

## God Nodes (most connected - your core abstractions)
1. `Lang` - 14 edges
2. `Estado de trabajo` - 14 edges
3. `scripts` - 13 edges
4. `fextracode — DESIGN.md` - 13 edges
5. `Despliegue en Cloudflare Pages` - 13 edges
6. `PLAN_PROYECTO — Landing personal FerS00` - 11 edges
7. `6. Fases` - 11 edges
8. `onRequestPost()` - 7 edges
9. `fextracode` - 7 edges
10. `setConsent()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `onRequestPost()` --calls--> `validateContact()`  [EXTRACTED]
  functions/api/contact.ts → src/scripts/contact-core.ts
- `ContactSubmission` --inherits--> `ContactData`  [EXTRACTED]
  src/scripts/contact-submit.ts → src/scripts/contact-core.ts

## Import Cycles
- None detected.

## Communities (37 total, 3 thin omitted)

### Community 0 - "Base.astro"
Cohesion: 0.06
Nodes (23): { lang }, symbols, enHref, esHref, { lang }, t, getAlternatePath(), Lang (+15 more)

### Community 1 - "devDependencies"
Cohesion: 0.07
Nodes (27): @astrojs/check, @axe-core/playwright, eslint, @eslint/js, eslint-plugin-astro, globals, devDependencies, @astrojs/check (+19 more)

### Community 2 - "contact.ts"
Cohesion: 0.12
Nodes (17): allowedOrigin(), badMethod(), ContactRequest, Env, isContactRequest(), json(), onRequest(), onRequestPost() (+9 more)

### Community 3 - "fextracode — DESIGN.md"
Cohesion: 0.12
Nodes (15): Accesibilidad, Color, Contenido y tono, Desviaciones, Do / Don't, Estabilidad del layout (obligatorio en la implementación), fextracode — DESIGN.md, Fuentes (+7 more)

### Community 4 - "scripts"
Cohesion: 0.08
Nodes (23): astro, @astrojs/sitemap, dependencies, astro, @astrojs/sitemap, engines, node, name (+15 more)

### Community 5 - "6. Fases"
Cohesion: 0.09
Nodes (23): 1. Objetivo, 2. Decisiones tomadas, 3. Estado de las decisiones iniciales, 4. Arquitectura, 5. Pipeline CI/CD, 6. Fases, 7. Riesgos, 8. Entregables de diseño ya disponibles (+15 more)

### Community 6 - "analytics.ts"
Cohesion: 0.17
Nodes (16): AnalyticsEventName, AnalyticsWindow, ConsentRecord, ConsentValue, expireGoogleCookies(), filterAnalyticsEvent(), hasAnalytics, knownCommands (+8 more)

### Community 7 - "Despliegue en Cloudflare Pages"
Cohesion: 0.10
Nodes (21): Activar Cloudflare Web Analytics, Analítica, Cabeceras y CSP, Comprobar GA4 y Clarity, Comprobar un despliegue, Configuración de Resend y Pages, Crear el proyecto una vez, Despliegue en Cloudflare Pages (+13 more)

### Community 8 - "projects.test.ts"
Cohesion: 0.15
Nodes (13): collections, faq, legal, projects, projectSchema, filterProjects(), projectColumnSpans(), ProjectFilter (+5 more)

### Community 9 - "Design System Master File"
Cohesion: 0.12
Nodes (16): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, Color Palette, Component Specs, Design System Master File, Global Rules (+8 more)

### Community 10 - "seo.ts"
Cohesion: 0.19
Nodes (12): analyticsConfigured, cspDirectives, cspScriptResources, cspSources, createStructuredData(), localizedAlternates, serializeSitemapItem(), serializeStructuredData() (+4 more)

### Community 11 - "Estado de trabajo"
Cohesion: 0.06
Nodes (30): Cierre temporal del proyecto, Entrega publicada, Evidencias de verificación, Git y recuperación, Observaciones conservadas, Reanudación, Archivos relevantes, Autorizaciones pendientes (+22 more)

### Community 12 - "tsconfig.json"
Cohesion: 0.15
Nodes (12): **/*, astro/tsconfigs/strictest, .astro/types.d.ts, design-system, dist, docs, node, compilerOptions (+4 more)

### Community 13 - "og.mjs"
Cohesion: 0.20
Nodes (8): builtHtmlPath, distPath, fontFaceRules, manrope, outputPath, root, syne, templatePath

### Community 14 - "i18n.test.ts"
Cohesion: 0.27
Nodes (6): getAlternatePath(), getLangFromPathname(), getLangFromUrl(), Lang, en, es

### Community 15 - "terminal-core.ts"
Cohesion: 0.31
Nodes (8): colored(), escapeHtml(), interpretCommand(), TerminalAction, TerminalMessageKey, TerminalMessages, TerminalResult, messages

### Community 16 - "privacy.en.md"
Cohesion: 0.29
Nodes (6): Cookies and local storage, Legal basis and changing your choice, Transfers, What data is processed, Who is responsible, Your rights

### Community 17 - "privacy.es.md"
Cohesion: 0.29
Nodes (6): Base legal y cómo cambiar de opinión, Cookies y almacenamiento local, Quién es el responsable, Qué datos se tratan, Transferencias, Tus derechos

### Community 18 - "Instrucciones del proyecto"
Cohesion: 0.33
Nodes (5): Comandos, Flujo de trabajo, Fuentes de verdad, Instrucciones del proyecto, Reglas de producto

### Community 19 - "[1.0.0] - 2026-10-08"
Cohesion: 0.25
Nodes (7): [1.0.0] - 2026-10-08, Añadido, Changelog, Corregido, Corregido, Documentación, [Unreleased]

### Community 20 - "Corrección visual de la landing"
Cohesion: 0.29
Nodes (6): Aceptación, Contratos y reglas, Corrección visual de la landing, Efectos autorizados, Objetivo y alcance, Resultado de cierre

### Community 21 - ".prettierrc.json"
Cohesion: 0.33
Nodes (5): overrides, plugins, printWidth, singleQuote, prettier-plugin-astro

### Community 22 - "a11y.spec.ts"
Cohesion: 0.33
Nodes (3): axeTags, routes, themes

### Community 23 - "pull_request_template.md"
Cohesion: 0.40
Nodes (4): Cómo se probó, Fase del plan, Lista de comprobación, Resumen

### Community 24 - "content.test.ts"
Cohesion: 0.40
Nodes (4): faqEn, faqEs, privacyEn, privacyEs

## Knowledge Gaps
- **235 isolated node(s):** `prettier-plugin-astro`, `singleQuote`, `printWidth`, `overrides`, `Env` (+230 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PLAN_PROYECTO — Landing personal FerS00` connect `6. Fases` to `Estado de trabajo`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `Despliegue en Cloudflare Pages` connect `Despliegue en Cloudflare Pages` to `Estado de trabajo`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `prettier-plugin-astro`, `singleQuote`, `printWidth` to the rest of the system?**
  _235 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Base.astro` be split into smaller, more focused modules?**
  _Cohesion score 0.06291591046581972 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `contact.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11692307692307692 - nodes in this community are weakly interconnected._
- **Should `fextracode — DESIGN.md` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._
