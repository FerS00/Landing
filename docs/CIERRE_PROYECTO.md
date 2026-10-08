# Cierre temporal del proyecto

Fecha: 2026-10-08. Estado: **cerrado por el momento, sin desarrollo activo**. Verificación global: **Aprobado con observaciones**.

## Entrega publicada

La landing ES/EN funciona en [fextracode.com](https://fextracode.com). La release `v1.0.0` corresponde a `a19171b`; la corrección visual posterior se integró mediante el [PR #4](https://github.com/FerS00/Landing/pull/4), commit de main `2f19d013c2d20b86295f1fd451b9487480051812`. No se creó un nuevo tag para esa corrección.

El diseño recupera las proporciones del prototipo y mantiene el formulario real, consentimiento y destinos de contacto. El nombre de presentación es Fernando Morales; la identificación completa permanece en privacidad.

## Evidencias de verificación

| Comprobación | Resultado | Evidencia y límite |
|---|---|---|
| Auditoría independiente de la corrección | Aprobado | Ejecución `71ce546432604e51b93da271c828e6b3`; siete comandos terminados con código 0 |
| Lint, formato, tipos y build | Aprobado | Comprobación local y CI; 0 errores de tipos, siete páginas generadas |
| Pruebas unitarias | Aprobado | 62 pruebas en nueve archivos |
| Playwright y axe | Aprobado | 54 pruebas; el formulario usa respuestas simuladas |
| CI y Lighthouse sobre main | Aprobado | [CI 37807388509](https://github.com/FerS00/Landing/actions/runs/37807388509); todos sus jobs terminaron correctamente |
| Security / CodeQL sobre main | Aprobado | [Security](https://github.com/FerS00/Landing/actions/runs/37807389675), [CodeQL](https://github.com/FerS00/Landing/actions/runs/37807388648) |
| Despliegue de la corrección | Aprobado | [Deploy 37807711498](https://github.com/FerS00/Landing/actions/runs/37807711498) |
| Smoke sobre el dominio | Aprobado | Rutas ES/EN y privacidad, metadatos y 404 esperados |
| Presentación en producción | Aprobado | Doce combinaciones: ES/EN, oscuro/claro, 375/768/1280 px; sin overflow horizontal; nombre corto y botón del formulario a todo el ancho |
| Envío real y respuesta | Aprobado para un envío | Confirmado por el usuario antes de la corrección; no se repitió un envío real ni se copiaron datos personales al cierre |
| Search Console, GA4 DebugView, retención y enmascarado en paneles | No ejecutado en este cierre | Sin evidencia de una revisión actual de esos paneles; los procedimientos del runbook no acreditan su configuración |

## Git y recuperación

Tras la entrega de producto solo quedó `main` local/remota y el árbol quedó limpio. El PR #2 de Dependabot, que proponía tipos de Node 26 sobre un proyecto con Node 24, se cerró. Sus commits se preservaron antes de eliminar la rama mediante un bundle completo verificado en `output/recovery/dependabot-node26.bundle` (local, no versionado). El cierre documental se entrega en otro PR y su rama temporal se elimina tras el merge.

## Observaciones conservadas

- **Infraestructura:** CSP bloquea un script inline que Cloudflare inyecta con `__CF$cv$params`; los scripts propios cargaron. No se acreditó que el aviso fuese anterior a la corrección y no se cambiaron reglas de Cloudflare ni CSP.
- **Higiene local:** la revisión automática rechazó la eliminación de `dist`, `.astro` y `test-results` con `blocked by policy`. Se conservaron aproximadamente 1.8 MB de regenerables. Servidores locales de esta tarea detenidos; dependencias activas, auditoría, capturas de aceptación y respaldo conservados.
- **Mantenimiento opcional:** rate limiting por IP, revisión de paneles de analítica y política de majors de `@types/node`. No forman parte de trabajo activo ni autorizan cambios externos.

## Reanudación

Invocar `$session-resume`, leer el [checkpoint](ESTADO_TRABAJO.md), el [plan](PLAN_PROYECTO.md) y el [mapa del repositorio](GRAFOS.md); verificar Git, PRs y workflows antes de modificar archivos. Una nueva petición debe definir el alcance. No iniciar automáticamente otra fase.
