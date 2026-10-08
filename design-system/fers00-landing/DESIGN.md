# fextracode — DESIGN.md

> Fuente de verdad del diseño de la landing personal de Fernando Morales (fextracode.com). Versión 3 (2026-10-07): negro y verde como colores principales, más interacción, tono descriptivo y diseño sin saltos de tamaño.

## Historial

| Versión | Cambio | Motivo |
|---|---|---|
| v1 | "Credencial firmada" | Rechazada: poco vistosa |
| v2 | "Señal viva": coral, violeta, cian | Gustó; pidió más animación |
| v3 | Negro y verde dominantes; terminal interactiva; layout estable; textos neutros | Colores favoritos del autor; las animaciones cambiaban la altura de la página; evitar afirmaciones sobre la calidad del trabajo; algunos textos en español no cabían |
| v4 | Logos en la órbita; ventanas de FAQ y de privacidad y cookies; sin mención a GitHub Actions en la página; palabra final completa | Petición del autor (2026-10-07) |

## Fuentes

- Refero: **no usado** (sin MCP conectado; dirección propia).
- Logos: [Devicon](https://devicon.dev) 2.16.0, licencia MIT, variantes `-original`; copias en `assets/logos/`. Las marcas pertenecen a sus dueños y se usan solo para nombrar la tecnología.
- ui-ux-pro-max: `MASTER.md` (insumo), dominios `landing` y `ux`, stack `astro`.
- Contenido: perfil `github.com/FerS00`, README de perfil y `FerS00/portfolio`.

## Principios

1. **Negro y verde.** Fondo negro con tinte verde, verde como acento principal; cian y violeta solo como apoyo; coral solo para marcar casos de estudio.
2. **Nada cambia de tamaño mientras se anima.** Toda animación usa `transform` u `opacity`; cada texto que cambia tiene su espacio reservado (ver "Estabilidad del layout").
3. **Interacciones con sentido.** Cada interacción enseña algo real: los comandos de la terminal, el filtro por tecnología, la demo de validación.
4. **Tono descriptivo.** Se describe qué hace el autor y con qué, sin juicios sobre la calidad ("que no fallan", "robusto", "experto"...).
5. **Accesible.** Contraste AA, teclado completo, `prefers-reduced-motion` deja todo quieto.

## Color

| Token | Oscuro (defecto) | Claro | Rol | Origen |
|---|---|---|---|---|
| `--color-bg` | `#050806` | `#F2F7F3` | Fondo (negro con tinte verde) | ajustado |
| `--color-surface` / `-2` | `#0C1410` / `#12201A` | `#FFFFFF` / `#E3EFE7` | Cards, terminal, hover | ajustado |
| `--color-fg` | `#EAF5EE` | `#0B1A12` | Texto | ajustado |
| `--color-muted-fg` | `#9DB3A6` | `#44594C` | Texto secundario | ajustado |
| `--color-green` | `#3DF58C` | `#0A7A43` | Acento principal: CTA, marca, foco, eyebrows, partículas | ajustado |
| `--color-cyan` | `#4FE3FF` | `#0B6E86` | Apoyo: código, gradiente | ajustado |
| `--color-violet` | `#A78BFF` | `#5B3FD9` | Apoyo: cadenas en terminal, gradiente | ajustado |
| `--color-coral` | `#FF7A5C` | `#B8361A` | Solo badge "Caso de estudio" | ajustado |
| `--color-on-accent` | `#050806` | `#FFFFFF` | Texto sobre verde y gradiente | ajustado |
| `--grad-loop` | verde → cian → verde → violeta → verde | ídem | Titulares destacados (bucle sin costura) | ajustado |
| `--color-border` / `-strong` | fg 16 % / `#5B7A68` | fg 12 % / `#7A9184` | Divisores / inputs y chips | ajustado |
| `--color-ring` | `#3DF58C` | `#0A7A43` | Foco | uupm |
| `--color-danger` | `#FF9B9B` | `#B42318` | Errores, rechazo en la demo | uupm |

Contraste (`check_contrast.py`, 2026-10-07):

| Par | Oscuro | Claro |
|---|---|---|
| fg / bg · surface | 18.01 · 16.73 | 16.55 · — |
| muted / bg · surface | 9.04 · 8.40 | 6.97 · 7.56 |
| green / bg · surface | 14.02 · 13.03 | 5.00 · 5.42 |
| on-accent / green · cyan · violet | 14.02 · 13.19 · 7.45 | 5.42 · 5.85 · 6.65 |
| coral / surface | 7.29 | 5.86 |
| border-strong / surface (UI) | 3.94 | 3.38 |
| danger / surface | 9.27 | 6.57 |

Partículas del fondo: 4/7 verdes, 2/7 cian, 1/7 violeta.

## Tipografía

| Rol | Familia | Uso |
|---|---|---|
| Display | Syne 700/800 | h1, h2, nombres de proyecto, marquee, palabra del pie |
| Texto | Manrope 400–700 | cuerpo, botones, formulario |
| Mono | JetBrains Mono 400/500 | terminal, eyebrows, chips, tags |

h1 `clamp(2.7rem, 7.2vw, 6rem)`, ajustado por script si la palabra más larga del idioma activo no cabe (ver abajo). Encabezados con `hyphens:auto` y `overflow-wrap:break-word`. En Astro: fuentes autoalojadas con `@fontsource`, `preload` de Syne y Manrope y `size-adjust` en las fuentes de respaldo para que el cambio de fuente no mueva el texto.

## Estabilidad del layout (obligatorio en la implementación)

| Elemento | Riesgo | Solución |
|---|---|---|
| Palabra rotativa del titular | Cada palabra mide distinto | Todas las palabras apiladas e invisibles en la misma celda; la visible se superpone con `position:absolute`. La caja mide siempre lo que la palabra más larga |
| Titular en español | "Desarrollo" y palabras largas no caben a 375 y 1280 px | `fitHeadline()`: mide cada palabra del idioma activo y reduce el `font-size` del h1 solo si alguna supera la columna. Se ejecuta al cargar, al cambiar idioma, al cargar fuentes y al redimensionar, nunca durante la animación |
| Terminal | Escribir o ejecutar comandos alargaba la caja | Altura fija (320px) con scroll interno y autoscroll al final |
| Veredicto de la demo | Texto de 1 o 2 líneas | Alto fijo de 3em |
| Errores del formulario | Aparecer empujaba los campos | Líneas de error con `min-height` siempre presentes; mensaje de éxito igual |
| Filtro de proyectos | Menos tarjetas acortaban la página bajo el lector | El grid conserva como `min-height` la altura de la lista completa |
| Botón Copiar | "Copiar" → "Copiado" | `min-width` fijo |
| Aviso de cookies | Mostrar/ocultar | `position:fixed`; no ocupa espacio |
| Palabra gigante del pie | Se recortaba a 375px y la "e" final perdía parte del trazo | `clamp(2rem, 9vw, 9rem)`, `width:fit-content` y `padding-inline:.12em` para que el gradiente cubra todo el glifo |
| Texto con gradiente (`.grad-text`) | `background-clip:text` con tracking negativo corta el último glifo | `padding-right:.08em` en todos los textos con gradiente |

Prueba de aceptación en Playwright: durante 8 s de animación la altura del documento y del hero no cambian, CLS < 0.01, y ningún texto sale de su contenedor en ES y EN a 375, 768 y 1280 px.

## Interacciones

| Interacción | Qué hace | Teclado / reducido |
|---|---|---|
| Terminal interactiva | Escribe una intro y acepta comandos: `help`, `whoami`, `projects`, `stack`, `contact`, `lang es/en`, `theme`, `matrix`, `clear`. `projects` y `contact` llevan a su sección | Input etiquetado; salida en `aria-live`; con movimiento reducido la intro aparece completa |
| Botones de sugerencia | Ejecutan `projects`, `stack`, `contact`, `matrix` | Botones reales |
| Modo matrix | Lluvia de caracteres verdes en el fondo durante 6 s | No se activa con movimiento reducido |
| Ondas en el fondo | Clic o toque en una zona vacía crea una onda verde que empuja las partículas | Decorativo |
| Campo de partículas | Fluye y se aparta del cursor | Estático |
| Botones magnéticos | Los CTA del hero se acercan al cursor | Solo con ratón; desactivado con movimiento reducido |
| Indicador de sección en la nav | Una píldora se desliza a la sección visible | `aria-current` |
| Cambio de tema | Revelado circular desde el botón (View Transitions) | Cambio instantáneo si no hay soporte |
| Órbita de logos | Diez logos (Spring Boot, FastAPI, Angular, React, Java, Python, C++, C#, MySQL, Docker) en insignias claras de 58px que giran en tres anillos; al pasar el ratón o con foco se pausa, el logo crece y aparece su nombre | Cada botón tiene `aria-label` con el nombre |
| Filtro por tecnología | Tocar un logo de la órbita o una tecnología de la lista filtra los proyectos, resalta el tag y lleva a la sección; un chip "Tecnología: X ✕" lo quita | Botones con `aria-pressed` |
| Ventanas extra | "Preguntas frecuentes" y "Privacidad y cookies" se abren como `<dialog>` modal (nav, pie, formulario, aviso de cookies y comandos `faq` / `privacy` de la terminal). Scroll interno; la página de fondo no se mueve | Esc y clic fuera cierran; foco atrapado por el `<dialog>` nativo |
| Cards | Inclinación 3D y foco de luz | Sin inclinación |
| Demo de validación | Petición válida o inválida; el paquete recorre los nodos | Cambio de estado sin desplazamiento |
| Copiar email / enviar formulario | Explosión de chispas verdes | Sin chispas |

## Contenido y tono

- El hero dice quién es y qué hace: "Hola, soy Fernando Morales. Desarrollo [backends · APIs · apps web · agentes de IA · licencias offline · apps Win32]".
- Sin calificativos sobre la calidad del trabajo ni promesas de resultado. Se describe la tecnología, el problema y el estado (por ejemplo, "En desarrollo" en RelayForge).
- Proyectos privados: se enlaza el caso de estudio, no se afirma que estén en producción.
- Contacto: "¿Tienes un proyecto? Hablemos." Tipos: Proyecto freelance y Colaboración técnica.

## Patrón de página

1. Nav flotante con indicador de sección y botón FAQ. 2. Hero + terminal. 3. Marquee. 4. "El modelo propone. El código decide." + demo + 3 temas. 5. Proyectos con filtros. 6. Stack: órbita de logos + lista clicable. 7. Contacto (con enlace a FAQ). 8. Palabra gigante y pie: copyright, "Preguntas frecuentes", "Privacidad y cookies", "Preferencias de cookies". 9. Aviso de analítica fijo abajo a la izquierda con "Más información".

El pie no menciona herramientas de construcción ni despliegue.

### Ventana de FAQ (borrador, a validar por el autor)

Siete preguntas: tipo de proyectos, cómo empezar, coste (depende del alcance; propuesta tras la primera conversación), idiomas (español e inglés), código de proyectos privados (casos de estudio; se explica la arquitectura sin mostrar código), uso de IA (herramienta de desarrollo; decisiones y verificación del autor), uso de los datos de contacto. Respuestas basadas en el README del perfil; sin promesas de plazos ni de resultados.

### Ventana de privacidad y cookies (borrador, revisar antes de producción; no es asesoría legal)

Responsable y contacto; datos tratados (Cloudflare sin cookies, GA4 y Clarity solo con consentimiento, formulario solo para responder); tabla de almacenamiento (`lang`, `theme`, `consent` locales; `_ga`, `_ga_<ID>`; `_clck`, `_clsk`, `CLID`); base legal (consentimiento) con botones para aceptar o rechazar; transferencias; derechos. Duraciones de cookies a confirmar con la documentación vigente de Google y Microsoft en la Fase 7.

## Accesibilidad

Enlace para saltar al contenido; foco visible en verde; ventanas como `<dialog>` modal con título enlazado (`aria-labelledby`) y botón Cerrar etiquetado; objetivos ≥ 44px en controles principales (las etiquetas de la órbita tienen equivalente de 44px en la lista); `lang` por idioma; canvas, brillo y marquee `aria-hidden`; aviso de cookies como `role="dialog"` con Aceptar y Rechazar igual de visibles; `prefers-reduced-motion` desactiva todas las animaciones.

## Desviaciones

| Regla | Valor uupm | Valor final | Motivo |
|---|---|---|---|
| Estilo | Brutalism | "Señal viva" negro y verde | Preferencia del autor |
| Animación | 1–2 elementos por vista | Varias capas | Petición del autor; mitigado con pausa fuera de pantalla, pausa al hover y desactivación con movimiento reducido |
| Tipografía | Inter | Syne + Manrope + JetBrains Mono | Personalidad |
| Logos de la órbita | — | Logos de marca a color (Devicon, MIT) sobre insignia clara `--color-logo-bg` `#F2F7F3` en ambos temas | Los logos oficiales tienen partes oscuras que no se verían sobre negro; Spring y FastAPI reciben su color de marca porque el SVG no lo trae |

## Do / Don't

- Do: solo tokens; ningún hex en componentes.
- Do: reservar el espacio de todo texto que cambie.
- Do: textos por idioma en archivos de traducción y prueba de desbordamiento en ambos idiomas.
- Don't: animar `width`, `height`, `top`, `left`, `margin` o `padding`.
- Don't: cargar Google Analytics antes del consentimiento.
- Don't: frases que valoren la calidad del propio trabajo.
