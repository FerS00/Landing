# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Añadido

- Logo de marca (F con pista de circuito y punto verde) en la navegación, con entrada, encendido del punto y halo de señal; quieto con movimiento reducido.
- Favicon SVG con el logo, alternativa ICO (16/32/48) y icono para pantalla de inicio de iOS.

### Corregido

- Paridad visual con el prototipo: titular, gradientes, espacios, secciones, tarjetas, órbita y consentimiento (PR #4, publicado en producción el 2026-10-08).
- Referencias locales de gradientes del sprite SVG.
- Nombre de presentación reducido a Fernando Morales en contacto y copyright; identificación legal conservada.

### Documentación

- Cierre temporal, checkpoint y grafo del repositorio actualizados. No se creó un nuevo tag ni release.

## [1.0.0] - 2026-10-08

### Añadido

- **Sitio y contenido:** landing personal con secciones de presentación, enfoque, proyectos, stack, FAQ y privacidad.
- **Interacción:** selector de tema, diálogos informativos, terminal interactiva, animaciones de entrada y formulario de contacto.
- **Accesibilidad:** controles con nombres accesibles, navegación por teclado, estados de foco, soporte para movimiento reducido y pruebas axe en navegador.
- **i18n:** rutas y contenido en español e inglés, selector de idioma y comprobación de paridad de claves.
- **SEO:** metadatos por idioma, canonical y hreflang, sitemap, robots, datos JSON-LD, páginas Open Graph y ruta 404 sin indexación.
- **Seguridad:** Content Security Policy, cabeceras HTTP, validación del formulario, Turnstile y protección contra origen ajeno y honeypot.
- **Analítica con consentimiento:** carga de GA4 y Clarity tras aceptación, opciones de rechazo y retirada del consentimiento.
- **Formulario:** Pages Function conectada a Resend para validar y enviar mensajes.
- **CI/CD:** workflows de CI, pruebas e2e, Lighthouse, enlaces, CodeQL, análisis de seguridad, previews de PR, despliegue a producción y smoke tests.

### Corregido

- Los enlaces de navegación llevan a las secciones correspondientes fuera de la página de inicio.
- Configuración de IDs públicos y variables del formulario en producción.
