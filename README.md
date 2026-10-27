# TripSplit – Planificador de Viajes y Gastos Compartidos

TripSplit es una aplicación web diseñada para simplificar la organización de viajes en grupo y automatizar el control de finanzas compartidas. Permite centralizar en un solo lugar itinerarios, listas de equipaje, presupuestos y el cálculo de saldos entre participantes.


## Equipo de Desarrollo

* **Danna Sofía Morales Esparza**
* **Jessica Vanessa Martínez de la Rosa**


## Tecnologías y Herramientas

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Node.js
* **Base de Datos:** MySQL 
* **Control de Versiones:** Git & GitHub


## Funcionalidades Principales

* **Gestión de Viajes y Participantes:** Registro de datos generales e integración de integrantes.
* **Itinerario Dinámico:** Organización de actividades por día, fecha y hora.
* **Calculadora de Gastos Compartidos & Saldos:** Registro de compras (hospedaje, transporte, comida) y cálculo automático de saldos (quién le debe a quién).
* **Checklist de Equipaje:** Lista interactiva de cosas por llevar.
* **Presupuesto & Resumen Gráfico:** Gráficas en tiempo real para visualizar el presupuesto consumido vs. disponible.

# TripSplit – Planificador de viajes y gastos compartidos

## Instalación
1. `npm install`
2. Crear la BD: `mysql -u root -p < database/schema_sprint2.sql` (crea la base `tripsplit` y las tablas del Sprint 2).
3. Copiar `.env.example` a `.env` y completar los valores (nunca subir `.env`).
4. `npm start` y abrir http://localhost:3000

## Pruebas de integración
Crea una BD de pruebas (por ejemplo `tripsplit_test`) con el mismo esquema, apunta `DB_NAME` a ella en `.env`
(¡las pruebas vacían las tablas!) y ejecuta `npm test`. Muestra resultados y cobertura.

## Estructura
`client/` frontend · `server/src/{routes,middlewares,controllers,models,config}` · `server/tests` · `database/` · `docs/`
