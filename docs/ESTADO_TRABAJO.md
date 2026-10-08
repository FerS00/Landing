# ESTADO_TRABAJO — Landing fextracode

Actualizado: 2026-10-07 (rev. 4)

## Hecho

- Revisión del perfil GitHub `FerS00`, README de perfil, repos públicos y `FerS00/portfolio`.
- Decisiones: Astro + TypeScript; Cloudflare Pages desplegado desde GitHub Actions; dominio `fextracode.com` (zona en Cloudflare); repo `FerS00/Landing` público; GA4 + Microsoft Clarity con consentimiento.
- Secretos de repositorio `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` presentes (verificado con `gh secret list`, solo nombres).
- Plugin de Cloudflare para Claude Code instalado (`cloudflare@cloudflare` 1.0.1). Su MCP figura como `needs_auth`.
- Diseño v4 aprobado en lo visual: `design-system/fers00-landing/DESIGN.md` y `prototype.html` → artifact privado https://claude.ai/artifact/A9AJeffNmfvY6pBrD7JWR3
  - Órbita con logos Devicon (MIT, copias en `design-system/fers00-landing/assets/logos/`).
  - Ventanas de FAQ y de privacidad y cookies (borradores de texto).
  - Sin mención a GitHub Actions en la página; palabra "fextracode" del pie completa.
- Verificación del prototipo (navegador integrado, tema claro): sin texto recortado ni scroll horizontal en ES y EN a 375 y 1280 px; ventanas abren, cambian de idioma y se encadenan (FAQ → privacidad); comandos `faq` y `privacy` de la terminal; sin errores de consola.
- Plan rev. 4: `docs/PLAN_PROYECTO.md`.

## Fase 0 — Andamiaje (2026-10-07) · implementada y auditada, sin commit

- Rama local `chore/fase-0-andamiaje` (desde `origin/main` e9ed6ef).
- Implementación: Codex (sesión `01a118f9-9956-7563-b33d-d1532e5c0cf1`), 3 ciclos de corrección: tipos de Node (defecto de especificación), caracteres no ASCII perdidos (defecto de implementación), `reporter` de Playwright (provocado por una regla errónea del coordinador).
- El coordinador ejecutó fuera del sandbox de Codex (EPERM en la caché de npm y en Vite): instalación, `npm run build`, `npm test`, `npx playwright install chromium` y `npm run test:e2e`.
- Versiones: astro 7.3.5, typescript 6.0.3, @astrojs/check 0.9.10, @types/node 24.19.1, eslint 10.12.0, @eslint/js 10.0.1, typescript-eslint 8.71.1, eslint-plugin-astro 3.2.1, globals 17.13.0, prettier 3.9.9, prettier-plugin-astro 1.1.0, vitest 5.0.3, @playwright/test 1.64.0.
- Comprobaciones finales: `npm ci` OK · `lint` OK · `format:check` OK · `check` 0/0/0 · `npm test` 1 passed · `build` OK · `test:e2e` 1 passed.
- Auditoría Antigravity (gemini-3.8-flash-medium, medium): **APROBADO**, sin hallazgos. Run `e94b73907f65417bba650b757b25a4a5` (el primer intento `257b650b…` se cortó a los 4 min; se repitió con `--timeout 900`).
- Informativo: npm 11 avisa que el `postinstall` de `esbuild@0.28.2` no está en `allowScripts`; el build funciona.
- Entrega: el usuario decidió hacer commit, push y PR al terminar todas las fases (D-19).

## Entorno de Codex corregido (2026-10-07)

- Causa del `spawn EPERM`: el sandbox `unelevated` no permite a Node crear tuberías para procesos hijo (esbuild, Vite, Vitest). Causa del `?` en lugar de tildes: PowerShell 5.1 canaliza el texto en ASCII (`$OutputEncoding`).
- Solución: sandbox `elevated` con `writable_roots` en `C:\Users\moral\.codex-sandbox-cache` (caché de npm ~65 MB y navegadores de Playwright ~720 MB) y `$OutputEncoding` en UTF-8 al invocar a Codex. Skill `codex-delegate` actualizada (respaldo `SKILL.md.bak-2026-10-07`).
- Verificado con una tarea real de Codex: `npm ci`, `lint`, `check`, `test` y `build` pasan dentro del sandbox; un archivo de prueba con tildes se escribe y se lee sin `?`.
- Límite pendiente: las e2e con el `webServer` de Playwright se cuelgan dentro del sandbox; las ejecuta el coordinador o el CI.

## Fase 1 — CI mínimo (2026-10-07) · implementada y auditada

- Codex (sesión `01a11928-7d74-7fc0-86a3-4730b53e9bf9`), sin ciclos de corrección: `.github/workflows/ci.yml` (job `ci`), `codeql.yml`, `dependabot.yml`, `pull_request_template.md`. Acciones fijadas por SHA (checkout v7.0.1, setup-node v7.0.0, codeql-action v4.38.2).
- `actionlint` 1.7.7: 0 errores. Pasos del job reproducidos en local: OK.
- Antigravity: **APROBADO** (run en `C:\Users\moral\.codex\antigravity-audit\runs`), dos notas informativas: el cron de CodeQL y la ejecución real solo se verán en GitHub.
- Leve, para la Fase 4: añadir `persist-credentials: false` al checkout de `codeql.yml`.

## Fase 2 — Diseño, layout e i18n (2026-10-07) · implementada y auditada

- Codex (sesión `01a1192f-65e9-75e2-bcc5-7fcc26886f6b`), 1 ciclo de corrección: etiquetas ES/EN desbordaban (defecto de especificación), revelado circular del tema, marca, h1 que se cortaba a 375 px y e2e asíncrono.
- Fuentes autoalojadas con la API de fuentes de Astro (Fontsource). Tokens, i18n `/` y `/en/`, Base con canonical/hreflang/OG, Nav, LangSwitch, ThemeToggle, Footer.
- Coordinador: lint, format:check, check 0/0, test 10 passed, build OK, test:e2e 2 passed; en navegador sin desbordes a 375 px.
- Antigravity: **APROBADO**, sin hallazgos.
- Nota: Codex intentó por su cuenta invocar a Antigravity en el primer encargo (falló por autenticación). Los encargos ahora lo prohíben explícitamente.

## Fase 3 — Contenido y secciones · en curso

- Dividida en 3a (fondo animado, hero, terminal, marquee), 3b (demo de validación, proyectos, órbita, navegación por secciones) y 3c (contacto, FAQ, privacidad, pie).
- **3a** · implementada y auditada. Codex (sesión `01a11946-8682-76a3-b531-749ded99a77a`), 1 ciclo de corrección (falso positivo de la prueba de desbordamiento; ahora mide rangos de texto). Coordinador: lint, format:check, check 0/0, test 14, build OK, test:e2e 13 passed (altura estable 6 s y sin texto desbordado en ES/EN a 375/768/1280). Antigravity: **APROBADO** (run `89a21de272a042bfb07e6a371010cb0b`), sin hallazgos.
- **3b** · implementada y auditada. Codex (sesión `01a11958-1918-7e62-a6b8-165227ac31a2`), 3 ciclos: altura al volver a "Todos" (+380 px) y textos de la demo distintos del prototipo; spans del grid; `min-height` medida en móvil que estiraba las filas al ensanchar. Coordinador: test 17, test:e2e 20 passed, columnas correctas a 1280 px, sin desbordes a 375 px. Antigravity: **APROBADO** (run `e01a73bf54c9495ab1568c2239007ef5`); recomendación no bloqueante (`ResizeObserver`) incorporada a la 3c.
- **3c** · implementada y auditada. Codex (sesión `01a11979-a343-7bd1-9c59-f9babec7dd51`), 3 ciclos: copiar mostraba "Error" sin permisos de portapapeles; eco "$ $" en la terminal; `faq` desde la terminal abría y cerraba la ventana por la activación residual del Enter (defecto real de teclado); la tabla de `/privacidad` recortaba la última columna a 375 px. Coordinador: test 29, build OK (6 rutas), test:e2e 29 passed. Antigravity: **APROBADO** (run `151ea4f70ae849efbf90a49d0e178f60`).
- Fase 3 completa.

## Fase 4 — Puertas de calidad en CI (2026-10-07) · implementada y auditada

- axe (`@axe-core/playwright` 4.13.0) en 4 rutas × 2 temas + ventanas; Lighthouse CI (umbral 0.95, acción `treosh/lighthouse-ci-action` 12.6.2 en CI y `npx @lhci/cli@0.15.1` en local, fuera del lockfile); jobs `e2e`, `lighthouse`, `links` en `ci.yml`; `security.yml` (gitleaks, npm audit, OSV-Scanner, enlaces externos semanales sin bloquear); `persist-credentials: false` en CodeQL.
- Codex (sesión `01a1199b-4473-7eb1-a6f3-f9d0666f949a`), 1 ciclo: axe detectó `aria-prohibited-attr` en el rotador del hero (defecto de la 3a); `@lhci/cli` metía 11 vulnerabilidades altas de desarrollo; rendimiento 0.94 en `/en/`. Corregido: nombre accesible del `h1` vía `sr-only`, CSS incrustado, partículas e intro de la terminal tras `load` + `requestIdleCallback`.
- Coordinador: test 29, test:e2e **39 passed**, `npm audit` 0 vulnerabilidades, Lighthouse móvil `/` y `/en/`: **perf 0.97 · a11y 1 · BP 1 · SEO 1**, actionlint 0 errores.
- Antigravity: **APROBADO** (run `8227082060c847299b83908d464b8535`).

## Fase 5 — Despliegue continuo (2026-10-07) · implementada y auditada (sin desplegar)

- Codex (sesión `01a119b3-a644-7cb3-844f-aeb3e80102f3`), sin ciclos: `deploy.yml` (preview por PR propio con alias `pr-<n>` y comentario; producción por `workflow_run` de CI en `main` con `environment: production`; rollback por `workflow_dispatch` con `ref` validado), `wrangler.toml`, `scripts/smoke.mjs`, `docs/RUNBOOK.md`.
- Coordinador: lint, check, test 29, build OK, actionlint 0, smoke local OK.
- Antigravity: **APROBADO** (run `a9125359decb4eb6ba80b03b771dddbe`).
- Informativo (coordinador): si el smoke falla tras desplegar a producción, la versión ya está publicada; la recuperación es el rollback del RUNBOOK.
- Pendiente de la entrega (con autorización): crear el proyecto Pages `fextracode` y comprobar el permiso del token.

## Fase 6 — SEO y endurecimiento (2026-10-07) · implementada y auditada

- Codex (sesión `01a119bc-caf3-7d81-945f-cee5d372ab0c`), 2 ciclos: selector `.icon-btn` ambiguo (botón de tema compartía clase con los de cerrar), fuentes de sistema en las imágenes OG; la 404 enlazaba a `/en/404/` y emitía canonical/hreflang.
- Sitemap i18n (sin 404), robots, OG por idioma con Syne/Manrope, JSON-LD `Person`/`WebSite`, CSP de Astro con hashes (orígenes en `src/config/csp.ts`), `_headers` (HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP, `frame-ancestors 'none'`), 404 `noindex`, RUNBOOK de dominio.
- Coordinador: test 41, test:e2e 40 passed (sin violaciones de CSP en consola), Lighthouse perf 0.97 · a11y 1 · BP 1 · SEO 1, smoke OK, `npm audit` 0.
- Antigravity: **APROBADO** (run `5f6fbf9111424128af3b64c69b02afd8`).

## Fase 7 — Analítica con consentimiento (2026-10-08) · implementada y auditada

- Política estricta: nada de Google ni Microsoft antes de "Aceptar"; Consent Mode v2 con publicidad siempre denegada; Clarity `consentv2`; retirada con `clarity('consent', false)` y borrado de `_ga`/`_ga_*`; eventos sin datos personales; sin IDs (local/preview) no hay aviso ni orígenes en la CSP.
- Codex (sesión `01a119de-abca-7280-9cc2-33f129ce7711`), 1 ciclo: `aside role="dialog"` no permitido → `div role="dialog"`; el selector de idioma no incluía el texto visible en su nombre accesible (WCAG 2.5.3; defecto introducido en la corrección de la Fase 2) → "EN · English".
- Coordinador: test 51, test:e2e 46 passed (sin peticiones a proveedores antes de aceptar ni tras rechazar), Lighthouse con el aviso visible perf 0.97 · a11y 1 · BP 1 · SEO 1. Revisión manual del borrado de cookies y de las guardas de doble carga.
- Antigravity: **APROBADO** (run `26e31b962680438ca4da7a1365439828`).
- Nota: las e2e usan el puerto 4322 e IDs ficticios; el `dist/` local puede quedar con esos IDs tras las pruebas (irrelevante: producción se construye en CI).

## Fase 8 — Formulario de contacto (2026-10-08) · implementada y auditada (sin activar)

- Decisión del autor: **Cloudflare Email Service** + Turnstile. Pages Functions no admite el binding `send_email`; `functions/api/contact.ts` usa la API REST `POST /accounts/{id}/email/sending/send` con token propio (permiso *Email Sending: Edit*). Envíos a destino verificado gratuitos.
- Codex (sesión `01a11a05-f2d4-7f20-848c-b429d7108a2c`). Coordinador: test 61, test:e2e 50 passed, Lighthouse perf 0.97 · a11y 1 · BP 1 · SEO 1, `npm audit` 0, prueba real con `wrangler pages dev` (GET 405, origen ajeno 403, trampa 200, inválido 400, flujo completo con token falso 502; sin PII en logs).
- Antigravity: **RECHAZADO** (run `503d3ef6…`: `.wrangler/` no ignorado rompía lint/format tras la prueba del coordinador) → corregido → **APROBADO** (run `64f5c749a5704e959c79a992459f051c`).
- Informativo: sin rate limiting por IP (Turnstile mitiga; regla opcional de Cloudflare en la entrega).
- **Cambio de proveedor (2026-10-08):** el autor pasó a **Resend** (Cloudflare Email Service tenía coste). Función adaptada (`POST https://api.resend.com/emails`), tests 62, e2e 50, prueba con `wrangler pages dev` y clave falsa → 502. Secretos de Pages en producción configurados por el autor: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`; el coordinador añadió `CONTACT_TO` y `CONTACT_FROM` (texto plano). Las previews no tienen secretos → `not-configured`.

## Fase 9 — Entrega (2026-10-08)

- PR #1 (`feat/landing-v1`): CI completo en GitHub. Falló `links` por un defecto real (enlaces de la barra fuera de la home) y por la resolución de directorios de lychee; corregido en `6f2500f` (auditado). Todos los checks en verde; squash merge `b9d2d9f` en `main`; rama borrada (remota y local).
- Ruleset `main-protection` (id 24707360): PR obligatorio, sin force-push ni borrado, checks requeridos `ci`, `e2e`, `lighthouse`, `links`, `Analyze`, `gitleaks`, `npm audit` (estrictos).
- Despliegue a producción tras CI en `main`: OK, smoke OK en `https://fextracode.pages.dev`. Vista previa del PR verificada (`pr-1.fextracode.pages.dev`), cabeceras de seguridad reales correctas.
- Defectos detectados en producción y corregidos en `fix/production-config` (auditado): los IDs públicos estaban como **secretos** de GitHub y el workflow leía `vars` (build sin GA/Clarity/Turnstile); `CONTACT_TO`/`CONTACT_FROM` del panel de Pages se ignoraban porque `wrangler.toml` es la fuente de verdad (ahora en `[vars]`).
- **Bloqueado (acción del usuario):** la regla de redirección de la zona "Redirect from root to WWW [Template]" usa la expresión `true` y genera un bucle 301 en `fextracode.com` y `www`. Modificarla requiere permiso del usuario (el modo automático bloquea cambios de DNS/dominio). Corrección: limitarla a `http.host eq "www.fextracode.com"` con destino `https://fextracode.com/${1}` (ver RUNBOOK › Dominio).
- Pendiente: tag `v1.0.0` y release tras desplegar la corrección y resolver el dominio.

## Pendiente del usuario

- Hecho: variables `PUBLIC_GA_ID` y `PUBLIC_CLARITY_ID` creadas en el repo (verificado con `gh variable list`, solo nombres).
- Hecho: MCP de Cloudflare conectado.
- Revisar los textos de la FAQ y de la política de privacidad (A-11) antes de la Fase 7.

## Siguiente paso

Fase 9 (entrega). Commit, push, PR y acciones en Cloudflare/GitHub requieren autorización explícita (D-19).

## Notas

- La carpeta ya es un repositorio Git que sigue a `origin/main`; `design-system/` y `docs/` entran en el commit de entrega.
- No hay commits ni pushes realizados (decisión D-19).
