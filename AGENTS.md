# Instrucciones del proyecto

## Fuentes de verdad

- `docs/PLAN_PROYECTO.md`: plan y fases.
- `docs/ESTADO_TRABAJO.md`: estado actual.
- `design-system/fers00-landing/DESIGN.md`: dirección de diseño.
- `design-system/fers00-landing/prototype.html`: prototipo de referencia.

## Flujo de trabajo

- Claude especifica, Codex implementa solo los archivos aprobados y Antigravity audita en solo lectura.
- Una fase por PR. No avances de fase sin aprobación.
- No hagas commit, push, merge, despliegue, cambios de secretos o variables ni escrituras externas sin autorización explícita.
- Nunca expongas `.env`, tokens ni los valores de `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `PUBLIC_GA_ID` o `PUBLIC_CLARITY_ID`.

## Reglas de producto

- Guarda textos en `src/i18n/{es,en}.json` y conserva la paridad de claves.
- Usa colores solo mediante tokens de `src/styles/tokens.css`.
- Anima solo `transform` y `opacity`. Nada puede cambiar de tamaño mientras se anima; consulta «Estabilidad del layout» en `DESIGN.md`.
- Respeta `prefers-reduced-motion`.
- Usa tono descriptivo, sin afirmaciones sobre la calidad del trabajo.
- No cargues analítica antes del consentimiento.
- La página no menciona herramientas de build ni despliegue.

## Comandos

```sh
npm ci
npm run lint
npm run format:check
npm run check
npm test
npm run build
npm run test:e2e
```

Usa commits convencionales. No añadas atribución a IA en commits ni PRs.
