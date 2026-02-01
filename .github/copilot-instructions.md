# Instrucciones de repositorio – GitHub Copilot

## Proyecto

**tfm-presentation**: presentación del TFM sobre desarrollo de software asistido por IA (caso TeamHub). Reveal.js 5 + HTML/CSS. **Requisito TFM**: slides con una presentación del proyecto (obligatorio). **Responsive** obligatorio; **A11y** y **WCAG 2.x nivel AA** (contraste, alt, semántica, teclado, ARIA).

## Estructura clave

- **index.html**: todas las slides; cada `<section>` es una slide. Incluir `role="region"` y `aria-label`.
- **css/custom.css**: estilos propios; usar variables CSS existentes (`--bg-primary`, `--text-muted`, etc.).
- **assets/images/**: logos SVG. **assets/diagrams/**: diagramas. **assets/screenshots/presentation/**: slide-01.png … slide-18.png.
- **scripts/**: TypeScript (ts-node) para captura de slides y screenshots.

## Comandos

- `npm run start` / `npm run dev`: servir en http://localhost:8080.
- `npm run screenshots`, `npm run capture-slide`, `npm run slide-walk`: capturas.
- `npm run pdf`: genera PDF (servidor en 8080 + decktape).
- `npm run lint` / `npm run format`: Prettier.

## Convenciones

1. Una `<section>` por slide; notas del presentador en `<aside class="notes">`.
2. **Formato uniforme**: Todas las slides deben tener el mismo formato; todas las cards deben ser iguales (mismas clases, misma estructura: icono, título, texto). No mezclar variantes de cards ni layouts distintos.
3. No modificar estilos dentro de `node_modules/reveal.js`; solo en `css/custom.css`.
4. Rutas de assets relativas desde la raíz: `assets/images/...`, `assets/diagrams/...`.
5. Comentarios de slide en orden: `<!-- SLIDE 1 -->` … `<!-- SLIDE 22 -->` según posición real (22 slides).
6. Contenido y documentación en español.
7. **Responsive y A11y**: Diseño responsive; cumplir WCAG AA (contraste, alt en imágenes, semántica, teclado, ARIA). No romper responsive ni accesibilidad.

## Fuente de verdad (única)

- **decisiones.md** es la **única fuente de verdad** para decisiones, datos, cifras, ADRs, hechos del TFM/TeamHub y **las acciones que se realizaron para generar el proyecto**. No inventar nada; solo usar lo que figure en `decisiones.md`. Si no está ahí, no afirmarlo.

## Documentación

- **GUION_PRESENTACION.md**: mensaje por slide.
- **CHECKLIST_PRESENTACION.md**: preparación de la presentación.
- **GUIA_IMPLEMENTACION_SLIDES.md**: flujo de implementación y assets.

## Restricciones

- **No alucinar**: No inventar datos, cifras, decisiones ni hechos. Única fuente de verdad: `decisiones.md`.
- Mantener **responsive** y **WCAG AA / A11y**: no introducir cambios que rompan diseño responsive ni accesibilidad.
