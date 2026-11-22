# Clínica del PC — Evidencia de seguridad y OWASP (Guía de Trabajo N.º 3)

> **Estado:** Prototipo académico React + Vite, **sin backend, API, base de datos ni autenticación real**. Usar únicamente personas y dispositivos ficticios. Este documento describe controles comprobables del prototipo y restricciones pendientes para producción.

## 1. Alcance y trazabilidad a la rúbrica

- **3.1.3 — Requerimientos funcionales:** formularios de preinscripción (simulación QR), recepción, selección de dispositivos previos, checklist, observaciones, entrega/cierre. El flujo y sus pruebas están en componentes, `clinicaReducer.js` y tests existentes.
- **3.1.3 — Sistemas críticos:** RUT, nombres, contacto, número de serie, diagnóstico, historial de atención y permisos por rol. Los formularios muestran un aviso para no introducir datos reales.
- **3.1.3 — OWASP:** validación de entradas y longitudes, salida JSX escapada, permisos de interfaz y verificaciones de acciones en el reducer; pruebas automatizadas y control de versiones.

## 2. Matriz de controles y evidencias

| Riesgo / referencia | Control que sí existe en esta versión | Evidencia concreta | Límite |
|---|---|---|---|
| Datos erróneos o excesivos | Longitudes máximas y validación compartida para datos personales, correo, teléfono, equipo y diagnóstico | `src/utils/validacionEntradas.js`, `DatosPersonales.jsx`, `DatosEquipo.jsx`, `InscripcionQR.jsx`, `RegistroPresencial.jsx` | No reemplaza validación en servidor |
| RUT incoherente | Formato chileno y comprobación de dígito verificador | `src/utils/rut.js`, ambos formularios | No identifica a una persona real |
| OWASP A05:2025 — Injection / XSS (inyección de código) | Texto de usuario mostrado por expresiones JSX que React escapa; controles de caracteres y formato en campos estructurados | `src/utils/validacionEntradas.test.js`, búsqueda de usos de `dangerouslySetInnerHTML` e `innerHTML` | No existe motor SQL ni HTML enriquecido; no afirmar prevención absoluta |
| OWASP A01:2025 — Broken Access Control | Navegación por perfil y restricciones de operaciones del estado para roles existentes | `src/data/roles.js`, `src/pages/PanelSuperusuario.jsx`, `src/context/clinicaReducer.js` | La sesión y los permisos viven en el navegador y son manipulables; **no hay autorización segura** |
| OWASP A04:2025 — Cryptographic Failures | No usar datos personales reales; información del carácter demostrativo visible en formularios | `src/context/ClinicaContext.jsx`, avisos de formularios | **Datos en localStorage sin cifrado**. No existe seguridad de datos en reposo ni servidor |
| Continuidad (prototipo) | Copia de respaldo del JSON local anterior, manejo de errores de lectura y pruebas de transiciones | `src/context/ClinicaContext.jsx`, `src/context/clinicaReducer.test.js` | El respaldo está en el mismo navegador y no recupera pérdidas del equipo o manipulación maliciosa |

**Importante:** React escapa expresiones de texto JSX; no se debe usar `dangerouslySetInnerHTML` con datos de usuario. No se borran las etiquetas escritas en diagnósticos: se preservan como **texto plano**, que se muestra escapado. Sanitización HTML específica solo si un futuro editor acepta HTML de verdad.

## 3. Pruebas reproducibles — evidencia para el informe

Desde `clinica-pc`:

```powershell
npm ci
npm run lint
npm run test:flujos
npm run build
```

La suite `src/utils/validacionEntradas.test.js` cubre casos de nombres con tildes y apóstrofes, formatos de correo, teléfono nacional e internacional +56, límites de longitud, caracteres de control invisibles, número de serie opcional, textos libres con etiquetas y renderizado escapado por React.

**Capturas recomendadas para Informe 2:**
1. Preinscripción QR: aviso de datos ficticios y rechazo de teléfono/correo inválido.
2. Registro presencial: rechazo de nombre con etiqueta HTML y límite de diagnóstico.
3. Ejecución de las pruebas en GitHub Actions (comprobar conclusión **success** antes de declararlo aprobado).
4. Captura de un rol restringido frente a uno autorizado y explicación de su carácter demostrativo.
5. Código referenciado con ruta y línea de las validaciones.

## 4. Límites que deben indicarse sin exagerar

- Login con contraseña `123` y token de sesión ficticio; **no usar credenciales reales ni afirmar que son seguras**.
- `sessionStorage` y `localStorage` no aseguran confidencialidad, integridad o sincronización entre equipos. Un usuario puede modificar los registros y los roles del navegador.
- La validación del frontend no previene ataques a un eventual backend. La versión productiva necesitaría API, autenticación y autorización por servidor, validación independiente, registros de auditoría, cifrado apropiado y política de retención.
- El sistema simula la atención y la encuesta: no efectúa envíos de correos o consultas reales de identidad.
- No se realizaron pruebas de carga reales: no afirmar alta disponibilidad ni capacidad para cientos de usuarios concurrentes.

## 5. Referencias normativas para el informe

- **Ley 21.459 (Chile):** establece normas sobre delitos informáticos, incluyendo acceso ilícito e interferencia en datos/sistemas. https://nuevo.leychile.cl/navegar?idNorma=1177743
- **Ley 21.663 (Chile):** Ley Marco de Ciberseguridad; **no** es la ley específica que tipifica los delitos informáticos. https://www.leychile.cl/leychile/Navegar?idNorma=1202434
- **Ley 19.628:** marco de protección de datos personales aplicable según su vigencia.
- **Ley 21.719:** reforma al tratamiento de datos personales; entrada en vigencia principal prevista para **1 de diciembre de 2026**, por lo que al 21/11/2026 no corresponde describirla como plenamente vigente. https://nuevo.leychile.cl/navegar?idNorma=1209272
- **OWASP Top 10:2025:** https://top10.owasp.org/
- **ACM Code of Ethics:** https://www.acm.org/code-of-ethics

> Los riesgos y escenarios normativos se documentan para diseñar responsablemente el prototipo. La aplicación de controles visuales no constituye una certificación OWASP ni acredita cumplimiento legal integral.
