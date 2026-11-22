# Matriz de cumplimiento — Guía de Trabajo N.º 3 (TI3043)

Documento de coordinación para actualizar el **Informe 2**, sin confundir diseño futuro, prototipo y sistema real. Basado en `Guia_de_Trabajo_3_TI3043(2).docx`, el Informe 1, el Informe 2 y el feedback escrito del docente.

## Criterios de la rúbrica (35 % de la asignatura)

| Indicador de la rúbrica | Evidencia necesaria | Estado / próxima acción |
|---|---|---|
| 3.1.1 — SaaS, IaaS y Cloud Computing (10 %) | Definiciones correctas y ejemplos usando propietario, dispositivo, ficha, checklist y estado | **Revisar informe:** NO afirmar que el frontend servido por Vite es un SaaS desplegado |
| 3.1.1 — justificación de adopción (10 %) | Dos alternativas de despliegue, costos mensuales y supuestos, disponibilidad, accesos simultáneos | **Pendiente:** verificar cifra de AWS Calculator y presupuesto supuesto; comparar servidor local |
| 3.1.1 — otras tendencias y arquitectura (10 %) | Arquitectura cliente/navegador actual vs futura infraestructura distribuida | **Pendiente:** diagrama de componentes propuesto y diferencias |
| 3.1.2 — confiabilidad (10 %) | Disponibilidad, integridad y continuidad, riesgos concretos y mitigaciones demostrables | **Parcial:** localStorage + respaldo local NO son alta disponibilidad |
| 3.1.2 — ética (10 %) | Código ACM u otro aplicable; confidencialidad, evitar daño y responsabilidad | **Pendiente:** ejemplos en los pasos 1, 4 y 9 |
| 3.1.2 — marco jurídico (10 %) | Ley 21.459, Ley 19.628 y reforma 21.719; diferenciar Ley Marco 21.663 | **Corregir informe:** Guía 3 letra c nombra erróneamente Ley 21.663 como delitos informáticos. Su propia rúbrica cita 21.459 |
| 3.1.3 — prototipo funcional (15 %) | Capturas comprobables: QR, recepción RUT y múltiples equipos, checklist, observaciones, entrega/cierre final | **Pendiente:** actualizar capturas contra `main` / PR de seguridad |
| 3.1.3 — sistemas críticos (15 %) | Identificación de RUT, contacto, historial, roles y disponibilidad; decisiones y limitaciones | **Parcial:** no existe cifrado ni autorización server-side; solo datos ficticios |
| 3.1.3 — OWASP y repositorio (10 %) | Validación real en código, roles de demo, escape JSX, tests, GitHub Actions | **En revisión:** PR #6 `feat/seguridad-owasp-demo`; documentación `SEGURIDAD_OWASP_GUIA3.md` |

## Correcciones heredadas del feedback de la Guía 2

1. Comparar **Scrum, Kanban y Cascada** por actores, restricciones de dos desarrolladores y entregables incrementales; justificar una adaptación Scrum y evidenciarla con Git/PR. No afirmar un Scrum formal si no hubo todos sus eventos.
2. Elaborar **historias de usuario con HU-xx, prioridad, criterios de aceptación y RF-xx**. Crear un backlog verificable y asociarlo a evidencia real del código.
3. Actualizar **UML**: flujo del paso 9 (entrega/cierre); operaciones en diagrama de clases y patrón/es de diseño aplicados, diferenciando patrón real de propuesta.
4. Corregir la matriz de co-creación con el **correo real de validación del 13/10**. La fecha 02/10 puede corresponder a una entrevista distinta solo si hay evidencia. Enlazar cada cambio a RF y HU concretos.
5. Profundizar **ISO/IEC/IEEE 12207**: proceso, actividad, entrada, salida, responsable, verificación y evidencia (backlog, UML, test, acta de validación).
6. Eliminar del índice y cuerpo material de trabajo no académico, como el encabezado **“Instrucciones Mati”**, y revisar las referencias APA.

## Capturas y comprobantes mínimos que faltan

- Login de demostración y permiso de vistas por rol.
- Preinscripción QR, consentimiento, validación RUT y selección de servicios.
- Recepción de múltiples dispositivos del mismo propietario.
- Checklist técnico, observaciones y verificación posterior.
- Entrega/cierre, custodia o retiro por terceros si se mencionan.
- GitHub Actions: lint, `test:flujos` y compilación en verde.
- Fragmentos de código con ruta y líneas: `rut.js`, `validacionEntradas.js`, `InscripcionQR.jsx`, `RegistroPresencial.jsx`, `roles.js` y `clinicaReducer.js`.

## Notas de alcance

El trabajo exigido es un **prototipo funcional**. La arquitectura de producción, Cloud, cifrado y reglas legales de retención deben presentarse como *propuesta/condición futura*, no como funcionalidades desarrolladas. No usar datos personales reales para obtener capturas. Las fechas y el correo de validación del cliente deben respaldarse con el mensaje original; no inventarlos.

**Formato de entrega según Guía 3:** portada INACAP, índice, introducción, desarrollo único integrador (partes a–f), conclusiones, referencias APA y anexos con evidencias. Revisar con el docente que la guía señala “trabajo individual” si se presenta en pareja.
