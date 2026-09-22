# Problem Framing — Problem Definition

> **Why this document exists:** Before designing solutions, the team must be aligned on the problem it solves. This document captures that alignment.

---

## 1. The problem in one sentence

**Padres y acudientes de estudiantes que utilizan transporte escolar** y **necesitan conocer y controlar el recorrido de sus hijos durante el servicio de transporte** tienen dificultades para **saber en tiempo real dónde se encuentra el bus, si el estudiante abordó o descendió correctamente y recibir información oportuna ante novedades**, debido a **la falta de un sistema centralizado que integre el seguimiento GPS, el control de acceso mediante QR y las notificaciones**, lo que puede generar **incertidumbre para los acudientes, dificultades de control para las instituciones y falta de trazabilidad sobre los recorridos y el ingreso/salida de los estudiantes**.

> **Nota:** El impacto cuantitativo exacto debe validarse mediante entrevistas, observación y datos reales de las instituciones. No se establece un porcentaje sin evidencia.

---

## 2. Affected users

| Segment | Description | Estimated size | Priority |
|---------|-------------|---------------|---------|
| Padres y acudientes | Responsables de los estudiantes que utilizan el transporte escolar y necesitan conocer su ubicación y estado durante el recorrido. | Por determinar | High |
| Conductores | Encargados de realizar las rutas y controlar el abordaje y descenso de los estudiantes. | Por determinar | High |
| Administradores de la institución | Gestionan estudiantes, acudientes, conductores, buses, rutas y paradas. | Por determinar | High |
| Estudiantes | Usuarios transportados mediante las rutas escolares. | Por determinar | High |
| Superadministradores | Gestionan instituciones y administradores dentro del sistema. | Por determinar | Medium |

### Jobs-to-be-done (JTBD)

**Padres y acudientes**

> **Cuando** mi hijo utiliza el transporte escolar,  
> **quiero** conocer la ubicación del bus y recibir información sobre su abordaje, descenso o novedades,  
> **para** tener mayor tranquilidad y saber que el recorrido se está realizando correctamente.

**Conductores**

> **Cuando** inicio y realizo una ruta escolar,  
> **quiero** identificar mediante QR a los estudiantes que suben y bajan del bus,  
> **para** mantener un registro de los estudiantes transportados y generar las notificaciones correspondientes.

**Administradores**

> **Cuando** gestiono el servicio de transporte escolar,  
> **quiero** administrar estudiantes, acudientes, conductores, buses, rutas y paradas desde un sistema centralizado,  
> **para** tener control y trazabilidad de la operación del transporte.

---

## 3. Evidence of the problem

> La evidencia disponible actualmente proviene principalmente del levantamiento de información del proyecto. Los datos cuantitativos deben validarse posteriormente.

| Evidence type | Source | Date | Key finding |
|--------------|--------|------|------------|
| User interviews | Entrevistas/levantamiento con usuarios relacionados con el transporte escolar | 2026 | Se identificó la necesidad de conocer la ubicación del bus y mantener informados a los acudientes. |
| User interviews | Levantamiento con responsables del servicio | 2026 | Se identificó la necesidad de controlar quién sube y baja del bus. |
| Direct observation | Análisis del proceso actual | 2026 | Actualmente no existe un mecanismo integrado para registrar mediante QR el abordaje y descenso de estudiantes. |
| Benchmarking | Análisis de soluciones de seguimiento como Protrack | 2026 | Se identificó el seguimiento de vehículos mediante mapas como una referencia para resolver la visualización de rutas y ubicación. |
| Technical validation | Pruebas con dispositivo GPS VT03F | 2026 | Se comprobó la viabilidad técnica de recibir información del GPS mediante comunicación TCP para obtener datos de ubicación del vehículo. |

---

## 4. Current user solution (and its problems)

| Current solution | Limitations | Cost/Friction |
|-----------------|------------|--------------|
| Comunicación directa entre institución, conductor y acudientes | La información depende de comunicación manual y no existe una fuente centralizada de información. | Tiempo adicional y posibilidad de retrasos en la comunicación. |
| Consulta manual sobre el estado del recorrido | No permite conocer de forma centralizada la ubicación actual del bus. | Incertidumbre y dependencia de terceros para obtener información. |
| Control manual de estudiantes durante el abordaje y descenso | No existe inicialmente un mecanismo automatizado que registre cada evento asociado al estudiante. | Riesgo de errores humanos y falta de trazabilidad. |
| Sistemas/plataformas externas de rastreo GPS | Pueden permitir visualizar vehículos, pero no necesariamente integran estudiantes, acudientes, rutas y eventos de abordaje/descenso dentro del mismo sistema. | Necesidad de consultar diferentes herramientas o adaptar procesos manualmente. |

---

## 5. Solution hypothesis

**We believe that** una plataforma de gestión de transporte escolar que integre **seguimiento GPS de los buses, control de abordaje y descenso mediante códigos QR, gestión de rutas y paradas y notificaciones a los acudientes**

**for** padres y acudientes, conductores y administradores de instituciones educativas

**will achieve** mayor visibilidad, control y trazabilidad del servicio de transporte escolar, permitiendo que los acudientes conozcan la ubicación del bus y reciban información sobre los eventos relacionados con sus estudiantes.

**We will know we succeeded when** los usuarios puedan consultar la ubicación del bus, registrar correctamente los eventos de abordaje/descenso mediante QR y recibir las notificaciones correspondientes, con una reducción de la dependencia de procesos manuales.

---

## 6. Success metrics (North Star)

| Metric | Current baseline | 6-month target | How to measure it |
|--------|----------------|---------------|-------------------|
| Estudiantes con eventos de abordaje/descenso registrados | No existe medición centralizada | ≥ 95% de los eventos registrados mediante QR | Registros generados por el sistema |
| Rutas con seguimiento GPS activo | Por determinar | ≥ 95% de las rutas operativas con GPS activo | Datos recibidos por el servicio GPS |
| Notificaciones generadas correctamente | No existe medición | ≥ 95% de los eventos configurados generan su notificación | Logs de eventos y notificaciones |
| Uso de la aplicación por acudientes | No existe medición | Por determinar mediante piloto | Métricas de autenticación y actividad |
| Incidencias de información no disponible sobre el recorrido | Por determinar | Reducción respecto a la línea base | Registro de incidencias y soporte |

### North Star Metric

**Porcentaje de recorridos escolares en los que los eventos críticos del servicio —ubicación del bus y abordaje/descenso de estudiantes— quedan registrados y disponibles para los usuarios correspondientes.**

Esta métrica representa el valor principal del sistema: **dar visibilidad y trazabilidad al transporte escolar.**

---

## 7. Hypothesis risks

| Risk | Probability | Impact | Experiment to validate |
|------|-------------|--------|----------------------|
| Los acudientes no utilizan frecuentemente la aplicación | Medium | High | Realizar un piloto con acudientes y medir frecuencia de acceso y consultas. |
| Los conductores no realizan correctamente el escaneo de QR | Medium | High | Probar el flujo de abordaje/descenso durante recorridos reales y medir eventos correctamente registrados. |
| La señal GPS no es suficientemente estable durante los recorridos | Medium | High | Realizar pruebas del VT03F durante diferentes recorridos y medir continuidad de los datos TCP/GPS. |
| Los usuarios no necesitan consultar la ubicación con tanta frecuencia como se plantea | Medium | Medium | Medir durante un piloto cuántas consultas de ubicación realizan los acudientes. |
| Las notificaciones no son oportunas o relevantes | Medium | High | Medir tiempos de generación/entrega y solicitar retroalimentación de los usuarios. |
| La integración del GPS presenta problemas de conectividad | Medium | High | Realizar pruebas de conexión, recepción de datos y reconexión del dispositivo GPS. |
| El proceso actual de transporte presenta variaciones entre instituciones | Medium | Medium | Validar el flujo con diferentes instituciones antes de establecerlo como proceso estándar. |

---

## 8. Out of scope (we do not solve)

Para esta versión del sistema **no se pretende resolver**:

- La planificación automática de horarios académicos de los estudiantes.
- La gestión académica de las instituciones educativas.
- El mantenimiento mecánico de los buses.
- La compra, administración o instalación física de dispositivos GPS.
- La gestión del servicio de transporte público general.
- La navegación autónoma del conductor.
- La generación automática de rutas óptimas mediante inteligencia artificial.
- El pago o cobro del servicio de transporte escolar.
- La comunicación telefónica directa entre acudientes y conductores como función principal.
- La sustitución de los procedimientos de emergencia establecidos por cada institución.

---

## Correlations

- Product vision → `03-product/vision.md`
- HUs that implement this solution → `04-requirements/user-stories.md`
- Detailed KPIs → `13-operations/README.md`
- Domain → `02-domain/`
- GPS / tracking → módulo o servicio de seguimiento GPS
- QR → módulo de control de abordaje y descenso