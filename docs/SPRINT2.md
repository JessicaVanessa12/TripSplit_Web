# Sprint 2 – Evidencia y plan de revisión (26/27 oct)

## Metas comprometidas
| HU | Descripción | Responsable | Endpoint | Estado |
|----|-------------|-------------|----------|--------|
| HU-01 | Registro | Jessica | POST /api/auth/registro | Hecha |
| HU-02 | Login | Jessica | POST /api/auth/login | Hecha |
| HU-03 | Crear viaje | Danna | POST /api/viajes | Hecha |
| HU-04 | Ver mis viajes | Danna | GET /api/viajes, GET /api/viajes/:id | Hecha |
| HU-05 | Agregar/retirar participantes | Jessica | POST/DELETE /api/viajes/:id/participantes | Hecha |

## Separación de responsabilidades
routes -> middlewares (requireAuth, requireTripMember, requireOrganizer, validate) -> controllers -> models (SQL parametrizado).

## Seguridad demostrable
bcrypt (hash), JWT, validación y saneamiento en servidor, SQL parametrizado, helmet, CORS restringido, rate limit en login/registro,
mensajes genéricos (401), 403 por pertenencia/rol, secretos en .env (fuera de Git).

## Pruebas (server/tests/api.test.js)
Cubren CP-S01 a CP-S05, CP-S07, CP-S08 y CP-S12 del plan de seguridad: flujos exitosos, entradas inválidas y restricciones de acceso.

## Pendiente de Sprint 1 (a completar por el equipo)
- Marcar issues y PRs en GitHub Projects con evidencia (capturas del tablero y commits en `feature/*`).
- Mover las HU-01 a HU-05 a "Hecho" tras cada PR a `develop`.
