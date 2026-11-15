# QA — Seguimiento posservicio y cierre condicionado (prototipo)

## Objetivo

Verificar que **la entrega física del equipo no cierra automáticamente su ticket**. La jornada
presencial se puede finalizar cuando no quedan equipos pendientes de trabajo presencial,
mientras que los tickets entregados pueden continuar en seguimiento.

Esta rama depende de `feat/roles-dinamicos` (PR #2). Revisar los cambios antes de fusionar.

## Alcance implementado

- Al confirmar entrega física, el ticket conserva `estado: entregado` y crea `seguimiento`
  con encuesta pendiente para 72 horas después **solo como plazo de demostración**;
  confirmar plazo real con el profesor.
- El historial diferencia **estado del equipo** y **estado del ticket**.
- En la ficha histórica, el administrador puede **simular envío**; no se envían correos.
- Una ruta `/encuesta/:token` permite contestar la encuesta **en el mismo navegador**.
- Si el cliente confirma funcionamiento correcto, el encargado puede cerrar manualmente.
- Si informa problemas, registra incidencia y exige una resolución escrita antes de permitir cierre.
- Las respuestas no sustituyen ni borran la entrega ni el checklist original.
- Los tickets entregados antes de esta actualización pueden preparar un seguimiento desde su ficha.

## Prueba funcional manual

1. Abrir la aplicación con `npm run dev` e ingresar como `admin` con la clave ficticia `123`.
2. Crear una jornada del día e iniciarla; registrar y recepcionar un equipo con datos **ficticios**.
3. Completar checklist, verificación final, contacto y entrega.
4. Comprobar en **Historial y consultas → Ver visitas → Ver ficha** que el equipo
   figura **Entregado**, pero el ticket está **Encuesta pendiente**.
5. Asegurar que NO existe un botón de cierre de ticket previo a la encuesta.
6. En la ficha, pulsar **Simular envío de encuesta**. El sistema deja claro que NO
   se envió ningún correo real. Este botón funciona antes de las 72 h para facilitar QA.
7. Pulsar **Abrir encuesta de prueba** en el MISMO navegador y completar una respuesta
   satisfactoria. Regresar al panel e historial. Verificar que sigue abierto y que
   aparece la acción **Cerrar ticket después de revisión**.
8. Cerrar el ticket y comprobar fecha y usuario responsable.
9. Repetir con otro equipo: responder `Volvió a fallar` y descripción.
   Comprobar que NO se puede cerrar antes de registrar una resolución.
10. Registrar resolución y cerrar el ticket. Comprobar la conservación de
    la respuesta y de los datos originales de entrega.
11. Si existen registros antiguos con `estado: entregado` pero sin `seguimiento`,
    verificar la opción **Preparar seguimiento de atención antigua**.
12. Verificar que los técnicos sin permiso de administración pueden leer la ficha,
    pero no simular envío, resolver incidencias ni cerrar tickets.

## Comandos

```powershell
npm run lint
npm run build
npm run test:seguimiento
```

## Límites conocidos — **no usar datos reales**

- No hay backend, base de datos central ni envío programado de correo.
- El estado persiste solo en `localStorage` del navegador. Un cliente que abra la
  URL en su celular NO encontrará la atención creada en el navegador de recepción.
- Los enlaces de encuesta son **solo para la demostración local**, no enlaces
  seguros para enviar a clientes. El acceso al contenido no implementa autenticación
  de producción ni validación del token en servidor.
- Para producción se necesita API, almacenamiento compartido, notificaciones
  programadas, tokens de encuesta con vencimiento/restricciones y permisos en servidor.
- Falta fijar con el docente el plazo exacto, los recordatorios y qué hacer con
  tickets sin respuesta después de un período prolongado: **no cerrar automáticamente**.
