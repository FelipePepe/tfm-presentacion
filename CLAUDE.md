# Instrucciones de proyecto – tfm-presentation

Presentación del TFM sobre **desarrollo de software asistido por IA**, con TeamHub como caso práctico. Construida con **Reveal.js** y HTML/CSS.

## Objetivo del proyecto

- **Requisito TFM**: Slides con una presentación del proyecto (obligatorio según criterios del TFM).
- Slides para defender el TFM ante tribunal.
- Contenido: motivación, metodología, gobernanza, stack, resultados y lecciones; incluir presentación del proyecto (TeamHub/caso práctico).
- Mantener narrativa clara, accesibilidad y material visual alineado con el guion.
- **Responsive**: El proyecto debe ser responsive (desktop, tablet, móvil). Las slides y el layout deben adaptarse correctamente a distintos tamaños de pantalla.
- **Accesibilidad (A11y)**: Cumplir con **WCAG 2.x nivel AA**: contraste mínimo, texto alternativo en imágenes, estructura semántica, navegación por teclado, etiquetas y roles ARIA adecuados.

## Stack y estructura

- **Presentación**: Reveal.js 5, HTML semántico, CSS custom en `css/custom.css`.
- **Assets**: `assets/images/` (logos SVG), `assets/diagrams/` (arquitectura, ER), `assets/screenshots/presentation/` (capturas por slide).
- **Scripts**: TypeScript con ts-node en `scripts/` (captura de slides, screenshots, slide-walk).
- **Documentación**: `CHECKLIST_PRESENTACION.md`, `GUION_PRESENTACION.md`, `GUIA_IMPLEMENTACION_SLIDES.md`.

## Comandos principales

```bash
npm install          # dependencias
npm run start        # servir en http://localhost:8080 (npx serve)
npm run dev          # igual con CORS (útil para capturas)
npm run screenshots  # captura masiva de screenshots (ts-node)
npm run capture-slide # captura una slide concreta
npm run slide-walk   # recorrido automatizado de slides
npm run pdf          # genera PDF (requiere servidor en 8080 y decktape)
npm run lint         # Prettier check
npm run format       # Prettier write
```

## Convenciones al editar

1. **HTML**: Cada `<section>` es una slide. Incluir `role="region"` y `aria-label` descriptivo. Las notas del presentador van en `<aside class="notes">`.
2. **Formato uniforme**: Todas las slides deben seguir el mismo formato (estructura, espaciado, jerarquía de títulos). Todas las cards deben ser iguales: mismas clases CSS, misma estructura (icono, título, texto), mismo estilo visual. No mezclar variantes de cards ni layouts distintos entre slides equivalentes.
3. **CSS**: Usar variables en `css/custom.css` (`--bg-primary`, `--text-muted`, etc.). No modificar estilos de `node_modules/reveal.js` directamente.
4. **Numeración**: Los comentarios `<!-- SLIDE N -->` deben seguir el orden real 1…22 para evitar confusiones (22 slides en total).
5. **Imágenes**: Rutas relativas desde la raíz, p. ej. `assets/images/logo.svg`. Screenshots en `assets/screenshots/presentation/slide-NN.png`.
6. **Idioma**: Contenido de la presentación y documentación en español.
7. **Responsive y A11y**: Diseño responsive obligatorio; cumplimiento WCAG AA (contraste, alt en imágenes, semántica, teclado, ARIA). No introducir cambios que rompan responsive ni accesibilidad.

## Fuente de verdad (única)

- **decisiones.md** es la **única fuente de verdad** para decisiones, datos, cifras, ADRs, hechos del TFM/TeamHub y **las acciones que se realizaron para generar el proyecto**. Cualquier contenido que dependa de decisiones, datos o del historial de acciones del proyecto debe basarse exclusivamente en lo que está escrito en `decisiones.md`. No inventar ni asumir nada que no figure ahí.

## Otra documentación de apoyo

- **Guion**: `GUION_PRESENTACION.md` (mensaje por slide).
- **Checklist**: `CHECKLIST_PRESENTACION.md` (fases de preparación).
- **Implementación**: `GUIA_IMPLEMENTACION_SLIDES.md` (flujo de construcción y assets).

## Qué no hacer

- **No alucinar**: No inventar datos, cifras, decisiones, ADRs ni hechos. Si algo no está en `decisiones.md`, no afirmarlo ni escribirlo en slides o documentación. En caso de duda, consultar solo `decisiones.md` o indicar que no hay fuente.
- No añadir dependencias nuevas sin justificación (el proyecto es deliberadamente ligero).
- No cambiar la estructura de carpetas de Reveal.js en `node_modules`.
- No eliminar atributos de accesibilidad (`aria-label`, `role`) de las slides.
- No usar formatos o layouts distintos entre slides: todas las slides y todas las cards deben mantener el mismo formato y las mismas clases.
- No introducir estilos o layouts que rompan el diseño responsive ni el cumplimiento WCAG AA / A11y.
