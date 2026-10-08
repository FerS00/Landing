# Corrección visual de la landing

Fecha: 2026-10-08. Petición iniciada en Codex; el usuario excluyó a Claude de esta sesión. Codex especifica e implementa; Antigravity audita en solo lectura.

## Objetivo y alcance

Ajustar la landing al prototipo `design-system/fers00-landing/prototype.html`, conservando las funciones de producción añadidas después del prototipo. Usar Fernando Morales como nombre de presentación; mantener la identificación completa en privacidad y los destinos de contacto existentes.

Archivos permitidos: `src/styles/global.css`, `src/components/ConsentBanner.astro`, `src/components/home/{Hero,Approach,Projects,Stack,Contact,Home,LogoSprite,Terminal}.astro`, `src/i18n/{es,en}.json`, `tests/e2e/{home,sections}.spec.ts` y `docs/{PLAN_PROYECTO,ESTADO_TRABAJO,ESPECIFICACION_CORRECCION_VISUAL}.md`. Terminal se incluye porque los controles de sugerencia tenían seis píxeles menos de altura que la referencia. Ampliar esta lista solo con una causa observada dentro del mismo alcance.

## Contratos y reglas

- El prototipo original permanece como referencia. No reemplazar el formulario real por su simulación.
- Conservar rutas, modelos de proyectos, traducciones, eventos analíticos, consentimiento, CSP y contratos de Turnstile/Resend.
- Recuperar proporciones, tamaños, pesos, gradientes, separaciones, filtros, iconos y posición del aviso de consentimiento.
- Ajustar el titular por la palabra individual más ancha. Las palabras rotativas tienen una caja estable, admiten saltos de línea y se descifran dentro de esa caja.
- Corregir todas las referencias locales de los SVG al prefijar sus identificadores en el sprite.
- Mantener tokens de color, movimiento reducido, teclado y espacio reservado para estados variables.
- No copiar los borradores legales ni cargar analítica antes del consentimiento.

## Aceptación

1. Contacto y copyright muestran Fernando Morales en ES/EN; los enlaces y la identificación legal mantienen sus destinos y contenido.
2. El titular tiene gradiente, tamaño comparable al prototipo y ninguna palabra queda cortada; su rotación no modifica la altura.
3. Encabezados, secciones, tarjetas, filtros y órbita siguen el diseño de referencia a 375, 768 y 1280 px, en los dos temas e idiomas.
4. Los diez logos aparecen y todas las referencias de gradientes del sprite apuntan a identificadores existentes.
5. El aviso ocupa la esquina inferior izquierda, con controles de igual tamaño; aceptar/rechazar conservan su comportamiento.
6. El formulario conserva Turnstile/Resend y su botón ocupa el ancho disponible; los mensajes no desplazan sus campos.
7. Lint, formato, tipos, unitarias, build y e2e pasan. Codex registra la comparación real en navegador; Antigravity audita el diff y ejecuta los checks autorizados.
8. Tras auditoría aprobada, entregar mediante PR a main, comprobar CI y despliegue, y eliminar las otras ramas. Conservar en un bundle cualquier commit no integrado antes de eliminar su rama.

## Efectos autorizados

El usuario autorizó las correcciones, su publicación en main y la eliminación de las demás ramas. La entrega usa las protecciones existentes de main y conserva los cambios locales previos de documentación. No implica cambiar secretos ni configuraciones de Cloudflare.

## Resultado de cierre

Criterios 1–7 aprobados por auditoría independiente `71ce546432604e51b93da271c828e6b3`. Criterio 8 completado: PR #4 fusionado en `2f19d01`, controles de main y despliegue aprobados; otras ramas eliminadas tras verificar el respaldo de los commits de Dependabot. Producción revisada en las doce combinaciones de idioma, tema y ancho. Evidencia compacta en `docs/CIERRE_PROYECTO.md`.
