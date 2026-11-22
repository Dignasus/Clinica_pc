# QA — Custodia posterior al horario y retiro por terceros

## Origen del requerimiento

Entrevista con Pablo Pesce: aproximadamente minutos **19:27–20:16** (el propietario
puede autorizar por teléfono/WhatsApp que un tercero retire) y **27:36–28:20**
(un equipo no retirado puede dejarse en el segundo piso bajo custodia de profesores).
La entrevista no fija un procedimiento institucional completo ni determina qué
docente tiene acceso al sistema. Esta implementación es una **propuesta académica**.

## Escenarios de prueba

### A. Entrega al propietario (regresión)
1. Crear o usar una jornada activa. Registrar, recepcionar, asignar y finalizar
   técnicamente un equipo ficticio.
2. Registrar contacto al propietario.
3. Elegir **Propietario registrado** y comprobar que el nombre se carga desde
   el registro; marcar identidad verificada y prueba conjunta.
4. Confirmar entrega: equipo `entregado`, encuesta pendiente y **ticket abierto**.
5. Responder encuesta de prueba; evaluar y cerrar desde historial.

### B. Traslado a custodia después del horario
1. Con un nuevo equipo en estado `contactado`, ubicar **Transferir a custodia
   para retiro posterior**.
2. Registrar sala, docente receptor, motivo y confirmar recepción física.
3. Validar que figure `en_custodia` y se vea en Historial.
4. Verificar que **NO** exista seguimiento ni encuesta programada.
5. Cerrar la jornada presencial si no quedan otros equipos pendientes: la custodia
   debe persistir y el ticket permanecer abierto.
6. Entrar a Historial como superusuario o recepcionista con acceso al módulo.
   Abrir la atención y en **Custodia temporal y retiro posterior** confirmar
   el retiro real del propietario.
7. Verificar fecha y responsables de ingreso y salida de custodia, ahora
   `entregado` y **encuesta programada desde el retiro**, no desde el ingreso.

### C. Entrega a tercero autorizado
1. Crear otro equipo hasta estado `contactado`, seleccionar **Tercero autorizado**.
2. Completar nombre, relación, identificación verificada y conformidad.
3. Sin marcar autorización, intentar confirmar: debe bloquearse.
4. Seleccionar teléfono o WhatsApp usado para contactar al **propietario
   registrado** y confirmar que autorizó expresamente la entrega.
5. Registrar retiro. En Historial confirmar que figura nombre del tercero,
   tipo de retiro, medio utilizado y `pruebaConPropietario: false`.
6. El ticket sigue abierto para encuesta y cierre posterior.

### D. Tercero retira desde custodia
1. Repetir flujo B, pero al momento del retiro escoger **Tercero autorizado**.
2. Verificar que se registra **tanto la custodia como el retiro**, sin perder
   el historial previo, y que la encuesta empieza recién al entregar al tercero.

### E. Roles y registros antiguos
1. Usuario con permiso de historial pero sin recepción/administración puede
   consultar la ficha de custodia **sin poder confirmar entrega** allí.
2. Supervisor/recepción puede registrar retiro desde Historial aunque la
   jornada del técnico haya cerrado.
3. Los registros entregados antes de esta iteración siguen mostrando su
   fecha y encuesta; los campos de terceros/custodia quedan **No registrado**.

## Comandos

```powershell
npm run lint
npm run build
npm run test:flujos
npm run dev
```

## Restricciones y decisiones pendientes

- Prototipo React + `localStorage`: **no sincroniza** los datos entre
  computadores, salas, celulares ni usuarios; no usar datos personales reales.
- La marca de recepción/autorización es declarativa; **no existe firma digital,
  corroboración automática de identidad, llamada ni WhatsApp real**.
- Confirmar con el profesor quién tiene autoridad para registrar la entrega
  de custodia y si el docente receptor necesita un rol de acceso específico.
- No se crean turnos ni horarios automáticos; la sala de profesores y el
  horario hasta las 22:00 son referencias del caso, no garantías del sistema.
- El envío de correos y la recepción remota de encuestas requieren un backend.
- Se conserva el registro original de la atención y se documentan la entrega
  física y el cierre administrativo por separado.
