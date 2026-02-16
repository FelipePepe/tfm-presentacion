# GitHub Pages Deployment

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages.

## 🚀 Despliegue Automático

Cada push a `main` ejecuta:
1. Build de la presentación desde módulos (`npm run build`)
2. Deploy a GitHub Pages

## 📝 Actualizar Métricas

Para actualizar datos del proyecto:

1. Editar `config/data.json`:
```json
{
  "project": {
    "version": "1.6.1",
    "lastUpdate": "2026-02-16"
  },
  "metrics": {
    "totalTests": 1038,
    "backendTests": 655,
    "frontendTests": 383,
    "backendCoverage": "81.01%",
    "frontendCoverage": "90.07%",
    ...
  }
}
```

2. Commit y push:
```bash
git add config/data.json
git commit -m "chore: update metrics to v1.6.1"
git push
```

3. GitHub Actions generará automáticamente el `index.html` actualizado

## 🛠 Build Local

```bash
npm install
npm run build
npm start
```

Abre http://localhost:8080

## 📂 Estructura Modular

```
tfm-presentacion/
├── slides/          # 31 slides individuales
│   ├── 01-slide.html
│   ├── 02-slide.html
│   └── ...
├── config/
│   └── data.json    # Datos centralizados (versiones, métricas)
├── templates/
│   ├── header.html  # Cabecera HTML + Reveal.js setup
│   └── footer.html  # Scripts + Service Worker
├── scripts/
│   └── build.ts     # Script que genera index.html
└── index.html       # Generado automáticamente
```

## 💾 Caché Offline

Service Worker incluido:
- Cache-first para assets (Reveal.js, CSS, imágenes)
- Carga instantánea tras primera visita
- Funciona sin conexión

Versión de caché: `tfm-presentacion-v{version}`

## 🔧 Comandos

- `npm run build` - Genera index.html desde módulos
- `npm start` - Build + servidor local (puerto 8080)
- `npm run dev` - Build + servidor con CORS
- `npm run pdf` - Exportar a PDF con Decktape

## 📊 Actualización desde decisiones.md

Los datos en `config/data.json` deben sincronizarse con:
- `TeamHub/README.md` (versión, tests, coverage)
- `TeamHub/docs/decisiones.md` (último ADR)

## 🔗 URLs

- **Producción**: https://felipepepe.github.io/tfm-presentacion
- **Repositorio**: https://github.com/FelipePepe/tfm-presentacion
