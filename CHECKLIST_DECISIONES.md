# Checklist: acciones del Registro de Ejecución (decisiones.md)

Esta checklist refleja las **acciones realizadas** registradas en el fichero **decisiones.md** del proyecto TFM (ruta por defecto: `../tfm/docs/decisiones.md`). Sirve para comprobar que la presentación cubre cómo se creó el proyecto, qué problema resuelve y cómo funciona.

---

## Fuente de verdad

- **Fichero:** `decisiones.md` (repositorio TFM, carpeta `docs`)
- **Ruta por defecto:** `../tfm/docs/decisiones.md`
- **Variable de entorno opcional:** `DECISIONES_PATH` para otra ubicación

---

## Resumen de progreso (según decisiones.md)

| Fase                                    | Estado        | Progreso |
| --------------------------------------- | ------------- | -------- |
| Fase 0: Preparación y pruebas           | ✅ Completada | 100%     |
| Fase 1: Auth y Usuarios                 | ✅ Completada | 100%     |
| Fase 2: Dominios principales            | ✅ Completada | 100%     |
| Fase 3: Dashboards                      | ✅ Completada | 100%     |
| Fase 4: Hardening y documentación       | ✅ Completada | 100%     |
| Fase 5: Empleados (formulario, detalle) | ✅ Completada | 100%     |
| Fase 6: Proyectos y Timetracking        | ✅ Completada | 100%     |
| Fase 7: E2E Playwright                  | ✅ Completada | 100%     |
| Release 1.3.0: Sistema de tareas        | ✅ Desplegada | 100%     |

---

## Checklist por fases (acciones a reflejar en las slides)

### Fase 0: Preparación y pruebas

- [ ] Revisión de fuentes de verdad (docs/adr, OpenAPI, reglas de negocio)
- [ ] Alcance y estrategia de persistencia (Drizzle)
- [ ] Entorno de BD de pruebas (migraciones, seed, config)
- [ ] Configuración Vitest (pool=forks, singleFork) para tests

### Fase 1: Auth y Usuarios

- [ ] Auth en DB (login, MFA, refresh/reset) con tests
- [ ] Usuarios CRUD, password, unlock, RBAC con tests

### Fase 2: Dominios principales

- [ ] Departamentos con tests
- [ ] Plantillas con tests
- [ ] Procesos con tests
- [ ] Proyectos/Asignaciones con tests
- [ ] Timetracking con tests

### Fase 3: Dashboards

- [ ] Dashboards con métricas reales y tests

### Fase 4: Hardening y documentación

- [ ] Swagger UI en `/docs`, OpenAPI en `/openapi.yaml`
- [ ] ADRs documentados (MFA, perfil, JWT, GitFlow, frontend, interceptors)
- [ ] ADRs reorganizados por categorías
- [ ] Refactor responsive (Layout, Dashboards, A11y)
- [ ] D3.js como tecnología de visualización (ADR-063)
- [ ] Hooks y páginas Fase 3 Onboarding (plantillas, procesos, mis tareas, widget)
- [ ] Fase 2 Empleados: formulario, vista detalle, Select UI
- [ ] Seguridad: headers, rate limiting (ADR-064, OWASP 96.5%)
- [ ] OpenAPI v1.0.0, 149 endpoints
- [ ] E2E Playwright (login, navegación, CRUD departamentos, contraste tema)
- [ ] Modularización backend (handlers, schemas, rutas por dominio)
- [ ] Componentes UI: Calendar, Popover, Textarea (react-day-picker v9)
- [ ] Vistas timetracking: Gantt D3.js, Weekly Timesheet, tabs
- [ ] Seed data scripts (seed-proyectos-gantt, seed-complete-data)
- [ ] Gantt responsive, espaciado cabeceras
- [ ] Hotfix SelectItem empty value (v1.2.1)
- [ ] GitHub Branch Protection y Rulesets (ADR-075)

### Release 1.3.0: Sistema de tareas

- [ ] Schema tareas, migración, repository, service
- [ ] Endpoints REST tareas
- [ ] Frontend: tipos, hooks, Gantt/List/Form de tareas
- [ ] Tests sistema tareas (114 tests)
- [ ] Dark mode, version display en footer
- [ ] GitFlow: PR release/1.3.0 → main/develop, tag v1.3.0

### Otras acciones registradas

- [ ] Catálogo E2E y matriz de trazabilidad (ADR-077)
- [ ] JSDoc obligatorio en métodos (ADR-078)
- [ ] Filtro managerId en /usuarios (ADR-079)
- [ ] Migración dashboards a D3.js (bar-chart, line-chart) (ADR-080)

---

## Criterio de las slides (objetivo)

Las slides deben servir para:

1. **Enseñar el proyecto** a alguien
2. **Explicar cómo se ha creado** (proceso, decisiones, fases)
3. **Comunicar qué problema resuelve** (motivación, contexto, alcance)
4. **Mostrar cómo funciona** (arquitectura, stack, resultados, demo)

Al revisar o ampliar la presentación, usar esta checklist para asegurar que cada bloque de acciones tiene reflejo en al menos una slide y que el mensaje cumple los cuatro puntos anteriores.
