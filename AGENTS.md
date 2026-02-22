# AGENTS.md – Instrucciones para agentes (Codex y otros)

Proyecto: **tfm-presentation** – Presentación TFM sobre desarrollo de software asistido por IA (caso TeamHub). Reveal.js + HTML/CSS.

## Resumen

- **Qué es**: Slides para defensa del TFM. 25 slides en un único `index.html` con Reveal.js.
- **Requisito TFM**: Las slides deben incluir una presentación del proyecto (obligatorio según criterios del TFM).
- **Tecnologías**: Reveal.js 5, HTML5, CSS3, TypeScript solo en `scripts/` (captura de slides/screenshots).
- **Salida**: Presentación en navegador (puerto 8080), opcionalmente PDF vía decktape.
- **Responsive**: El proyecto debe ser responsive (desktop, tablet, móvil).
- **Accesibilidad (A11y)**: Cumplir con **WCAG 2.x nivel AA** (contraste, alt en imágenes, semántica, teclado, ARIA).

## Estructura del repositorio

```
tfm-presentation/
├── index.html              # Todas las slides (editar aquí)
├── css/custom.css          # Estilos propios (variables, grids, tipografía)
├── assets/
│   ├── images/             # Logos SVG (nextjs, react, tailwind, etc.)
│   ├── diagrams/           # architecture.svg, er-diagram.svg
│   └── screenshots/presentation/  # slide-01.png … slide-18.png
├── scripts/                # TypeScript: capture-screenshots, capture-slide, slide-walk
├── CHECKLIST_PRESENTACION.md
├── GUION_PRESENTACION.md
├── GUIA_IMPLEMENTACION_SLIDES.md
├── package.json
└── tsconfig.json
```

## Comandos esenciales

| Comando                 | Descripción                                                           |
| ----------------------- | --------------------------------------------------------------------- |
| `npm install`           | Instalar dependencias                                                 |
| `npm run start`         | Servir presentación en [http://localhost:8080](http://localhost:8080) |
| `npm run dev`           | Igual con CORS (capturas/PDF)                                         |
| `npm run screenshots`   | Ejecutar captura masiva (ts-node)                                     |
| `npm run capture-slide` | Capturar una slide concreta                                           |
| `npm run pdf`           | Generar PDF (servidor en 8080 + decktape)                             |
| `npm run lint`          | Comprobar formato (Prettier)                                          |
| `npm run format`        | Aplicar formato (Prettier)                                            |

## Convenciones de código

1. **Slides**: Una `<section>` por slide. Siempre `role="region"` y `aria-label` significativo. Notas en `<aside class="notes">`.
2. **Formato uniforme**: Todas las slides deben tener el mismo formato (estructura, espaciado, jerarquía). Todas las cards deben ser iguales: mismas clases CSS, misma estructura (icono, título, texto), mismo estilo. No mezclar variantes de cards ni layouts distintos entre slides equivalentes.
3. **Estilos**: Solo en `css/custom.css`; usar variables CSS existentes. No tocar CSS de Reveal.js en `node_modules`.
4. **Rutas**: Assets con rutas relativas desde raíz (`assets/images/...`, `assets/diagrams/...`).
5. **Comentarios**: Mantener `<!-- SLIDE N -->` en orden 1–22 según la posición real de la slide.
6. **Idioma**: Texto de la presentación y docs en español.
7. **Responsive y A11y**: Diseño responsive obligatorio; cumplimiento WCAG AA (contraste, alt, semántica, teclado, ARIA). No romper responsive ni accesibilidad.

## Fuente de verdad (única)

- **decisiones.md** es la **única fuente de verdad** para decisiones, datos, cifras, ADRs, hechos del TFM/TeamHub y **las acciones que se realizaron para generar el proyecto**. Todo contenido que dependa de decisiones, datos o del historial de acciones debe basarse exclusivamente en `decisiones.md`. No inventar ni asumir nada que no figure ahí.
- **Ubicación del fichero**: El fichero está en el repositorio del proyecto TFM, dentro de la carpeta **docs**. Ruta por defecto (relativa a la raíz de este repositorio): `**../tfm/docs/decisiones.md**`. Para otro layout de carpetas, definir la variable de entorno `**DECISIONES_PATH**` con la ruta absoluta o relativa al fichero.

## Documentación de referencia

- **Guion**: `GUION_PRESENTACION.md` – Mensaje clave por slide.
- **Checklist**: `CHECKLIST_PRESENTACION.md` – Fases de preparación.
- **Guía técnica**: `GUIA_IMPLEMENTACION_SLIDES.md` – Assets, estructura, flujo de trabajo.

## Restricciones

- **No alucinar**: No inventar datos, cifras, decisiones, ADRs ni hechos. Solo usar lo que está en `decisiones.md`. Si no está ahí, no afirmarlo; en duda, consultar `decisiones.md` (ruta: `../tfm/docs/decisiones.md` o `DECISIONES_PATH`) o indicar que no hay fuente.
- No añadir dependencias sin necesidad; el proyecto debe seguir siendo ligero.
- No modificar la estructura interna de `node_modules/reveal.js`.
- Mantener accesibilidad: no quitar `aria-label` ni `role="region"` de las secciones.
- Mantener formato uniforme: todas las slides y todas las cards deben usar el mismo formato y las mismas clases; no introducir layouts o variantes distintas.
- Mantener responsive y A11y: no introducir cambios que rompan el diseño responsive ni el cumplimiento WCAG AA.
