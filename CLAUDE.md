# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Presentación del TFM sobre **desarrollo de software asistido por IA**, con TeamHub como caso práctico. Construida con **Reveal.js 5** y HTML/CSS. Desplegada en GitHub Pages.

## Arquitectura: Build modular

El proyecto usa un sistema de build que ensambla `index.html` a partir de módulos:

1. **`scripts/build.js`** lee `config/data.json`, concatena `templates/header.html` + todos los `slides/NN-slide.html` (ordenados) + `templates/footer.html`.
2. Los placeholders `{{metrics.totalTests}}`, `{{author.name}}`, etc. se reemplazan con valores de `config/data.json`.
3. Se actualiza la versión del cache en `sw.js` (Service Worker).
4. El resultado se escribe en `index.html` (archivo generado, no editar directamente).

**Para editar contenido de slides**: modificar los archivos en `slides/` (31 slides: `01-slide.html` a `31-slide.html`).
**Para editar datos/métricas**: modificar `config/data.json`.
**Para editar estilos**: modificar `css/custom.css`.
**Para editar estructura HTML envolvente**: modificar `templates/header.html` o `templates/footer.html`.

Tras cualquier cambio, ejecutar `npm run build` para regenerar `index.html`.

## Comandos principales

```bash
npm install          # dependencias
npm run build        # genera index.html desde módulos
npm run start        # build + servir en http://localhost:8080
npm run dev          # build + servidor con CORS
npm run screenshots  # captura masiva de screenshots (ts-node + Playwright)
npm run capture-slide # captura una slide concreta
npm run check-slides # verificación automatizada de slides (Playwright)
npm run review-slides # revisión visual de slides (Playwright)
npm run pdf          # genera PDF (requiere servidor en 8080 y decktape)
npm run lint         # Prettier check
npm run format       # Prettier write
```

## Convenciones al editar

1. **HTML**: Cada `<section>` es una slide. Incluir `role="region"` y `aria-label` descriptivo. Las notas del presentador van en `<aside class="notes">`.
2. **Formato uniforme**: Todas las slides deben seguir el mismo formato (estructura, espaciado, jerarquía de títulos). Todas las cards deben ser iguales: mismas clases CSS, misma estructura (icono, título, texto), mismo estilo visual. No mezclar variantes de cards ni layouts distintos entre slides equivalentes.
3. **CSS**: Usar variables en `css/custom.css` (`--bg-primary`, `--text-muted`, etc.). No modificar estilos de `node_modules/reveal.js` directamente.
4. **Datos dinámicos**: Usar placeholders `{{clave}}` en slides/templates; los valores vienen de `config/data.json`. No hardcodear métricas ni versiones.
5. **Imágenes**: Rutas relativas desde la raíz, p. ej. `assets/images/logo.svg`. Screenshots en `assets/screenshots/presentation/slide-NN.png`.
6. **Idioma**: Contenido de la presentación y documentación en español.
7. **Responsive y A11y**: Diseño responsive obligatorio; cumplimiento WCAG AA (contraste, alt en imágenes, semántica, teclado, ARIA). No introducir cambios que rompan responsive ni accesibilidad.

## Fuente de verdad (única)

**`decisiones.md`** es la **única fuente de verdad** para decisiones, datos, cifras, ADRs, hechos del TFM/TeamHub y las acciones que se realizaron para generar el proyecto. No inventar ni asumir nada que no figure ahí.

## Documentación de apoyo

- **Guion**: `GUION_PRESENTACION.md` (mensaje por slide).
- **Checklist**: `CHECKLIST_PRESENTACION.md` (fases de preparación).
- **Implementación**: `GUIA_IMPLEMENTACION_SLIDES.md` (flujo de construcción y assets).

## Qué no hacer

- **No alucinar**: No inventar datos, cifras, decisiones, ADRs ni hechos. Si algo no está en `decisiones.md`, no afirmarlo.
- **No editar `index.html` directamente**: Es generado por el build. Editar `slides/`, `templates/` o `config/data.json`.
- No añadir dependencias nuevas sin justificación (el proyecto es deliberadamente ligero).
- No eliminar atributos de accesibilidad (`aria-label`, `role`) de las slides.
- No usar formatos o layouts distintos entre slides equivalentes.
- No introducir estilos o layouts que rompan el diseño responsive ni el cumplimiento WCAG AA.
