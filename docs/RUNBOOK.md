# Despliegue en Cloudflare Pages

## Estado operativo de referencia

Cierre temporal del 2026-10-08: producción verificada en `2f19d01`, Deploy exitoso y smoke del dominio aprobado. El [cierre](CIERRE_PROYECTO.md) reúne evidencias y observaciones; el [checkpoint](ESTADO_TRABAJO.md) indica cómo reanudar. Estas instrucciones son procedimientos de operación y no acreditan que se haya ejecutado cada acción de un panel externo.

## Requisitos

En GitHub, configura los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`. El token debe tener el permiso **Cloudflare Pages: Edit** en la cuenta correcta. Los IDs públicos `PUBLIC_GA_ID`, `PUBLIC_CLARITY_ID` y `PUBLIC_TURNSTILE_SITE_KEY` pueden configurarse como secretos o variables de repositorio; el workflow prefiere el secreto y usa la variable como respaldo. GA y Clarity solo se inyectan en el build de producción; Turnstile también se inyecta en previews. `PRODUCTION_URL` es opcional y puede ser un secreto o una variable; si está configurada, el pipeline también prueba esa URL.

## Crear el proyecto una vez

Con autorización para administrar la cuenta, crea el proyecto Pages en modo Direct Upload:

```sh
npx wrangler@4.136.3 pages project create fextracode --production-branch=main
```

No conectes el proyecto a GitHub. GitHub Actions envía el directorio `dist` con Wrangler.

## Previews y producción

Los PR hacia `main` desde ramas del mismo repositorio generan una preview en la rama `pr-<número>` y publican su URL en un comentario. Las previews se construyen sin `PUBLIC_GA_ID` ni `PUBLIC_CLARITY_ID`. Los PR desde forks no reciben secretos ni despliegue.

Después de que el workflow `CI` termine correctamente para un `push` a `main`, `deploy.yml` construye el sitio con las variables de analítica y despliega a la rama `main` bajo el Environment `production`. El pipeline comprueba tanto la URL del despliegue como `PRODUCTION_URL`, si está configurada.

## Comprobar un despliegue

```sh
npm run smoke -- https://url-del-despliegue
```

El smoke test valida rutas, idioma, título, `hreflang`, canonical y la respuesta 404 de una ruta inexistente. En el pipeline reintenta hasta cinco veces, con esperas crecientes desde 3 segundos.

## Rollback

En Cloudflare Pages abre **Deployments** y selecciona **Rollback**, o ejecuta el workflow `Deploy` con `workflow_dispatch` e indica un tag `v*` o un SHA de 7 a 40 caracteres hexadecimales. El workflow reconstruye esa referencia y la despliega a producción.

## Rotar el token

Revoca el token anterior en Cloudflare, crea uno nuevo con el permiso **Cloudflare Pages: Edit** y actualiza `CLOUDFLARE_API_TOKEN` en los secretos del repositorio. No lo guardes en archivos del proyecto ni en los logs.

## Si falla el smoke test

Revisa la URL de despliegue y el log del paso fallido. Si la publicación es reciente, la propagación puede requerir los reintentos del script. Si el dominio continúa sirviendo contenido incorrecto, usa **Rollback** en Cloudflare Pages o despliega de nuevo un tag/SHA conocido; corrige el problema y vuelve a ejecutar el flujo.

## Dominio

En el proyecto Pages `fextracode`, añade `fextracode.com` y `www.fextracode.com` como dominios personalizados. Configura una redirección permanente (301) de `www.fextracode.com` a `fextracode.com`, conservando el path y la query string. Limita la regla con la expresión `http.host eq "www.fextracode.com"`; una regla con expresión `true` también redirige el apex y provoca un bucle. Activa **Always Use HTTPS** para forzar HTTPS. Configura `PRODUCTION_URL` con `https://fextracode.com` como secreto o variable de repositorio.

## Cabeceras y CSP

`public/_headers` define las cabeceras de Cloudflare Pages. La meta CSP y los hashes de scripts y estilos se generan desde `security.csp` en `astro.config.mjs`. Los orígenes de analítica están en `src/config/csp.ts`; `script-src` y `style-src-elem` permanecen sin `unsafe-inline`. `style-src-attr 'unsafe-inline'` se limita a atributos `style` existentes.

### Script de detección inyectado por Cloudflare

En la comprobación de producción se observó un script inline añadido por Cloudflare con `__CF$cv$params`, bloqueado por la CSP. Los scripts propios cargaron y la navegación comprobada funcionó. No se determinó si esa observación existía antes de la corrección. Para investigarla, distinguir el HTML generado por Astro del HTML servido por Cloudflare y revisar la configuración de la zona con autorización propia. No habilitar `unsafe-inline` para silenciar la consola.

## Analítica

### Ver los datos

- **Google Analytics 4:** abre el recurso GA4 de `fextracode.com` y revisa **Reports → Realtime**. Se registran vistas e interacciones de la página. Los eventos no incluyen nombres, emails, mensajes ni texto libre. En la configuración de retención del recurso, fija dos meses para los datos de eventos antes de producción.
- **Microsoft Clarity:** abre el proyecto asociado al dominio para revisar grabaciones y mapas de calor. En **Settings** activa el enmascarado estricto de texto y el modo de consentimiento antes de analizar sesiones.
- **Cloudflare Web Analytics:** en Cloudflare abre **Websites → fextracode.com → Analytics & Logs → Web Analytics**. La medición es agregada, no usa cookies y no depende del consentimiento del banner.

### Comprobar GA4 y Clarity

1. En producción, abre una ventana privada y comprueba en **Network** que no hay solicitudes a Google Tag Manager, Google Analytics ni Clarity antes de elegir.
2. Activa el modo de depuración en el navegador de comprobación (por ejemplo, con Google Analytics Debugger). Pulsa **Aceptar**. Confirma las solicitudes a `googletagmanager.com/gtag/js` y `clarity.ms/tag/…`. En GA4 abre **Admin → Data display → DebugView** y verifica `page_view` y eventos de interacción. En Clarity revisa **Recordings** y comprueba que el texto aparece enmascarado.
3. Abre **Preferencias de cookies** y pulsa **Rechazar**. Verifica que las cookies `_ga` desaparecen y que al recargar no se cargan scripts de Google ni Clarity.

Las previews y builds locales sin `PUBLIC_GA_ID` y `PUBLIC_CLARITY_ID` no muestran el aviso ni cargan analítica. Los builds de CI usan identificadores ficticios solo para pruebas.

### Activar Cloudflare Web Analytics

En **Workers & Pages → fextracode → Analytics → Web Analytics**, activa **Enable Web Analytics** y asocia el sitio con el dominio de producción. Pages gestiona la inserción del beacon; no añadas otro script en los componentes.

### Google Search Console

En Search Console añade `fextracode.com` como propiedad de dominio y copia el valor TXT de verificación. En Cloudflare abre la zona `fextracode.com` y crea un registro **TXT** en la raíz (`@`) con ese valor. Espera la propagación DNS y pulsa **Verify** en Search Console. Después entra en **Sitemaps**, envía `https://fextracode.com/sitemap-index.xml` y confirma que Search Console lo procesa.

## Formulario de contacto

La función `POST /api/contact` verifica el token de Turnstile y entrega el mensaje mediante Resend. Los datos del formulario se usan para responder al remitente. No se registran nombre, email ni mensaje.

### Configuración de Resend y Pages

1. En Resend, verifica el dominio `fextracode.com` y confirma que `contacto@fextracode.com` puede usarse como remitente.
2. Crea una API Key de Resend y guárdala como secreto `RESEND_API_KEY` en **Workers & Pages > fextracode > Settings > Variables and Secrets** para producción.
3. `CONTACT_TO=moralespenafernando@gmail.com` y `CONTACT_FROM=contacto@fextracode.com` se definen en `[vars]` de `wrangler.toml`. Mientras ese archivo incluya `pages_build_output_dir`, es la fuente de verdad y el panel de Pages no edita esos valores.
4. Guarda `TURNSTILE_SECRET_KEY` y `RESEND_API_KEY` como secretos de producción en Pages. Crea un widget de Turnstile con los hostnames `fextracode.com` y `fextracode.pages.dev`; guarda su Site Key pública como secreto o variable de repositorio `PUBLIC_TURNSTILE_SITE_KEY` para los builds.

Las previews no reciben secretos. En ellas la función responde HTTP `503` con `error: "not-configured"`, comportamiento esperado hasta que se decida configurar credenciales para ese entorno. `CONTACT_TO` y `CONTACT_FROM` proceden de `wrangler.toml`.

### Pruebas locales

Las pruebas unitarias simulan Siteverify y Resend. Las pruebas e2e interceptan el script de Turnstile y `/api/contact`.

Para probar en local, compila con la Site Key de prueba `1x00000000000000000000AA` en `PUBLIC_TURNSTILE_SITE_KEY` y arranca Pages con valores ficticios:

```sh
npx wrangler@4.136.3 pages dev dist \
  --binding=TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA \
  --binding=RESEND_API_KEY=re_fake_local_test \
  --binding=CONTACT_TO=test@example.invalid \
  --binding=CONTACT_FROM=contacto@fextracode.com
```

También puedes guardar los mismos valores en `.dev.vars`, que está excluido de Git. Las claves de prueba de Turnstile hacen que Siteverify apruebe el reto; Resend rechazará la API Key ficticia y la función responderá `502 send-failed`. Esta comprobación local requiere conexión a Turnstile y Resend. Las pruebas unitarias y e2e no necesitan esas llamadas.

### Rotar la clave de Resend

Revoca la clave anterior desde Resend, crea una nueva y reemplaza el secreto `RESEND_API_KEY` en Pages producción. No la guardes en el repositorio, `.dev.vars` compartido ni en los logs.

La función responde `502` ante errores de Resend y no expone el cuerpo de error del proveedor ni datos personales en logs.
