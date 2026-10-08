# Grafos del repositorio

El cierre incluye los artefactos de Graphify actualizados a partir de la base de producto `2f19d01` y de la documentación de esta entrega. Se versionan por petición expresa del usuario. El mapa de cierre contiene 422 nodos, 501 relaciones y 37 comunidades; conserva etiquetas EXTRACTED e INFERRED, que deben distinguirse al interpretar los vínculos.

- [Grafo JSON](../graphify-out/graph.json): nodos y relaciones para consultas.
- [Vista HTML](../graphify-out/graph.html): descargar y abrir en un navegador para explorar el mapa.
- [Informe de Graphify](../graphify-out/GRAPH_REPORT.md): resumen generado de comunidades y relaciones.

## Actualización

Con Graphify instalado, desde la raíz:

```sh
graphify update .
graphify query "formulario consentimiento despliegue" --budget 2000
```

El update refresca la estructura sin requerir un LLM. Se conservan solo los tres artefactos públicos en Git; la caché, manifiestos y rutas de ejecución quedan locales. Antes de entregar un nuevo mapa, revisar sus fuentes y excluir secretos, credenciales y artefactos temporales.

## Límites de interpretación

El mapa sirve para orientación; el código, configuración, Git y comprobaciones reales son las fuentes de verdad. La extracción advierte errores de sintaxis en 22 archivos Astro y puede omitir símbolos de esos componentes. `src/styles/tokens.css` fue omitido por una heurística de nombres sensibles; sigue siendo la fuente de colores y debe inspeccionarse directamente cuando corresponda.

No se realizó una nueva síntesis semántica con LLM ni se usa Graphiti. El campo `built_at_commit` identifica la base Git durante la generación, no el commit futuro que publica estos mismos artefactos. Los cambios documentales sin commit de esta entrega también estaban presentes al regenerar el mapa.
