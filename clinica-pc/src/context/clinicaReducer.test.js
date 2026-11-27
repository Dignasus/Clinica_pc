import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicaReducer } from './clinicaReducer.js';
import { datosIniciales } from '../data/datosIniciales.js';
import { fechaLocal, asegurarJornadaDemo, jornadaPermiteInscripcion, obtenerEstadoJornada } from '../utils/jornadas.js';
import { estadoTicket, HORAS_HASTA_ENCUESTA } from '../utils/seguimiento.js';

const ATENCION_ID = 'AT-QA-001';
const JORNADA_ID = 'JOR-QA-001';
const entregar = (tipoReceptor = 'propietario') => ({
  tipoReceptor,
  recibidoPor: tipoReceptor === 'tercero' ? 'Persona autorizada ficticia' : 'Cliente ficticio',
  identidadVerificada: true,
  conformidad: 'conforme',
  observaciones: '',
  pruebaConPropietario: tipoReceptor === 'propietario',
  pruebaConReceptor: false,
  relacion: tipoReceptor === 'tercero' ? 'Compañero' : '',
  medioAutorizacion: tipoReceptor === 'tercero' ? 'telefono' : '',
  autorizacionConfirmada: tipoReceptor === 'tercero',
});
const custodia = {
  ubicacion: 'Sala de profesores, piso 2',
  responsableRecepcion: 'Docente ficticio',
  motivo: 'Propietario retirará después del cierre',
  confirmacionRecepcion: true,
};

function transicionar(estado, type, payload) {
  return clinicaReducer(estado, { type, payload });
}
function atencion(estado) {
  const registro = estado.atenciones.find((a) => a.id === ATENCION_ID);
  assert.ok(registro, 'La atención ficticia debe existir');
  return registro;
}

function prepararAtencionCompleta() {
  let estado = structuredClone(datosIniciales);
  const fecha = fechaLocal();
  estado = {
    ...estado,
    jornadas: [
      ...estado.jornadas,
      { id: JORNADA_ID, periodo: 'QA automatizado', fecha, estado: 'activa' },
    ],
  };

  estado = transicionar(estado, 'REGISTRAR_PREINSCRIPCION', {
    propietario: {
      id: 'PROP-QA-001', rut: '11.111.111-1', nombre: 'Cliente',
      apellidoPaterno: 'Ficticio', region: 'Biobío', comuna: 'Concepción',
    },
    dispositivo: {
      id: 'DISP-QA-001', marca: 'Equipo QA', modelo: 'Notebook de pruebas',
      numeroSerie: 'QA-NOTEBOOK-001',
    },
    atencion: {
      id: ATENCION_ID, jornadaId: JORNADA_ID, estado: 'preinscrito',
      servicioIds: ['mantencionFisica'], fechaPreinscripcion: new Date().toISOString(),
    },
  });
  assert.equal(atencion(estado).estado, 'preinscrito');

  estado = transicionar(estado, 'ASIGNAR_TECNICO', {
    atencionId: ATENCION_ID, tecnicoId: 'cristian', fechaRecepcion: new Date().toISOString(),
  });
  assert.equal(atencion(estado).estado, 'asignado');

  estado = transicionar(estado, 'GUARDAR_AVANCE_TECNICO', {
    atencionId: ATENCION_ID,
    servicioIds: ['mantencionFisica'],
    justificacionServicios: '',
    inspeccionInicial: {
      encendido: 'Sí', estadoFisico: 'Sin daños visibles', accesorios: 'Cargador',
    },
    respuestasChecklist: [
      { servicioId: 'mantencionFisica', itemId: 'FIS-01', estado: 'Sí', observacion: '' },
      { servicioId: 'mantencionFisica', itemId: 'FIS-02', estado: 'Sí', observacion: '' },
    ],
    observacionesTecnicas: 'Prueba automatizada sin datos reales',
  });
  assert.equal(atencion(estado).estado, 'en_proceso');

  estado = transicionar(estado, 'REGISTRAR_VERIFICACION_FINAL', {
    atencionId: ATENCION_ID,
    verificacionFinal: {
      encendido: 'Sí', estadoFisico: 'Correcto', accesorios: 'Cargador',
      diferencias: 'Sin diferencias', resultadoServicio: 'resuelto',
    },
  });
  assert.equal(atencion(estado).estado, 'listo_entrega');

  estado = transicionar(estado, 'REGISTRAR_CONTACTO', {
    atencionId: ATENCION_ID,
    contacto: { medio: 'telefono', observaciones: 'Propietario contactado para retiro' },
  });
  assert.equal(atencion(estado).estado, 'contactado');
  return estado;
}

test('flujo completo: inscripción → técnico → entrega al propietario → encuesta → cierre', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar(), usuarioId: 'cristian', token: 'qa-propietario',
  });
  assert.equal(atencion(estado).estado, 'entregado');
  assert.equal(estadoTicket(atencion(estado)), 'pendiente_envio');
  assert.equal(atencion(estado).cierreTicket, undefined);

  estado = transicionar(estado, 'CERRAR_TICKET', { atencionId: ATENCION_ID, usuarioId: 'matias' });
  assert.equal(atencion(estado).cierreTicket, undefined, 'No se permite cerrar sin encuesta');

  estado = transicionar(estado, 'SIMULAR_ENVIO_ENCUESTA', {
    atencionId: ATENCION_ID, usuarioId: 'matias',
  });
  estado = transicionar(estado, 'RESPONDER_ENCUESTA', {
    token: 'qa-propietario', calificacion: 5, funcionamiento: 'bien',
    comentarios: 'Notebook funcionando correctamente',
  });
  assert.equal(estadoTicket(atencion(estado)), 'pendiente_cierre');
  estado = transicionar(estado, 'CERRAR_TICKET', { atencionId: ATENCION_ID, usuarioId: 'matias' });
  assert.equal(estadoTicket(atencion(estado)), 'cerrado');
  assert.equal(atencion(estado).cierreTicket.usuarioId, 'matias');
});

test('custodia: permite cerrar jornada, mantiene ticket abierto y empieza encuesta solo tras retiro', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'REGISTRAR_CUSTODIA', {
    atencionId: ATENCION_ID, custodia, usuarioId: 'cristian',
  });
  assert.equal(atencion(estado).estado, 'en_custodia');
  assert.equal(atencion(estado).entrega, undefined);
  assert.equal(atencion(estado).seguimiento, undefined);
  assert.equal(estadoTicket(atencion(estado)), 'pendiente_retiro');

  estado = transicionar(estado, 'CERRAR_JORNADA', JORNADA_ID);
  assert.equal(estado.jornadas.find((j) => j.id === JORNADA_ID).estado, 'finalizada');
  assert.equal(atencion(estado).estado, 'en_custodia');

  const fechaCustodia = new Date(atencion(estado).custodia.fechaIngreso);
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar(), usuarioId: 'camila', token: 'qa-custodia',
  });
  const registro = atencion(estado);
  assert.equal(registro.estado, 'entregado');
  assert.equal(registro.entrega.procedenciaCustodia, true);
  assert.equal(registro.custodia.entregadoPorUsuarioId, 'camila');
  assert.ok(registro.custodia.fechaSalida);
  assert.ok(new Date(registro.entrega.fecha) >= fechaCustodia);
  assert.equal(
    new Date(registro.seguimiento.programadaPara) - new Date(registro.entrega.fecha),
    HORAS_HASTA_ENCUESTA * 3600000,
  );
  assert.equal(registro.cierreTicket, undefined);
});

test('retiro por tercero sin autorización permanece bloqueado', () => {
  let estado = prepararAtencionCompleta();
  const sinAutorizacion = { ...entregar('tercero'), autorizacionConfirmada: false };
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: sinAutorizacion,
    usuarioId: 'cristian', token: 'qa-no-autorizado',
  });
  assert.equal(atencion(estado).estado, 'contactado');
  assert.equal(atencion(estado).seguimiento, undefined);

  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar('tercero'),
    usuarioId: 'cristian', token: 'qa-tercero',
  });
  assert.equal(atencion(estado).estado, 'entregado');
  assert.equal(atencion(estado).entrega.tipoReceptor, 'tercero');
  assert.equal(atencion(estado).entrega.pruebaConPropietario, false);
  assert.equal(atencion(estado).entrega.medioAutorizacion, 'telefono');
});

test('tercero autorizado puede retirar desde custodia, conservando la transferencia anterior', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'REGISTRAR_CUSTODIA', {
    atencionId: ATENCION_ID, custodia, usuarioId: 'cristian',
  });
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar('tercero'),
    usuarioId: 'camila', token: 'qa-tercero-custodia',
  });
  const registro = atencion(estado);
  assert.equal(registro.entrega.tipoReceptor, 'tercero');
  assert.equal(registro.entrega.procedenciaCustodia, true);
  assert.equal(registro.custodia.responsableRecepcion, 'Docente ficticio');
  assert.ok(registro.custodia.fechaSalida);
  assert.equal(registro.entrega.pruebaConPropietario, false);
});

test('incidencia posservicio obliga a documentar resolución antes de cerrar', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar(),
    usuarioId: 'cristian', token: 'qa-incidencia',
  });
  estado = transicionar(estado, 'SIMULAR_ENVIO_ENCUESTA', {
    atencionId: ATENCION_ID, usuarioId: 'matias',
  });
  estado = transicionar(estado, 'RESPONDER_ENCUESTA', {
    token: 'qa-incidencia', calificacion: 2, funcionamiento: 'mal',
    comentarios: 'Se apagó nuevamente',
  });
  assert.equal(estadoTicket(atencion(estado)), 'incidencia');

  estado = transicionar(estado, 'CERRAR_TICKET', { atencionId: ATENCION_ID, usuarioId: 'matias' });
  assert.equal(atencion(estado).cierreTicket, undefined);

  estado = transicionar(estado, 'RESOLVER_INCIDENCIA', {
    atencionId: ATENCION_ID, usuarioId: 'matias',
    observaciones: 'Se verificó la falla y se resolvió el caso de prueba',
  });
  assert.equal(estadoTicket(atencion(estado)), 'pendiente_cierre');
  estado = transicionar(estado, 'CERRAR_TICKET', { atencionId: ATENCION_ID, usuarioId: 'matias' });
  assert.equal(estadoTicket(atencion(estado)), 'cerrado');
});

test('usuario sin permisos operativos no puede registrar traslado ni entrega', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'REGISTRAR_CUSTODIA', {
    atencionId: ATENCION_ID, custodia, usuarioId: 'usuario-sin-acceso',
  });
  assert.equal(atencion(estado).estado, 'contactado');

  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar(),
    usuarioId: 'usuario-sin-acceso', token: 'qa-sin-rol',
  });
  assert.equal(atencion(estado).estado, 'contactado');
});

test('una entrega finalizada no puede duplicarse ni reabrir la custodia', () => {
  let estado = prepararAtencionCompleta();
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar(),
    usuarioId: 'cristian', token: 'qa-unico',
  });
  const fechaOriginal = atencion(estado).entrega.fecha;
  estado = transicionar(estado, 'REGISTRAR_CUSTODIA', {
    atencionId: ATENCION_ID, custodia, usuarioId: 'cristian',
  });
  estado = transicionar(estado, 'CONFIRMAR_ENTREGA', {
    atencionId: ATENCION_ID, entrega: entregar('tercero'),
    usuarioId: 'camila', token: 'qa-duplicado',
  });
  assert.equal(atencion(estado).entrega.fecha, fechaOriginal);
  assert.equal(atencion(estado).seguimiento.token, 'qa-unico');
  assert.equal(atencion(estado).custodia, undefined);
});


test('jornada demo: inicializa fecha actual activa y permite inscripción', () => {
  const anterior = structuredClone(datosIniciales);
  const salida = asegurarJornadaDemo(anterior);
  const jornada = salida.jornadas.find((j) => j.id === `DEMO-JOR-${fechaLocal()}`);
  assert.ok(jornada);
  assert.equal(obtenerEstadoJornada(jornada), 'activa');
  assert.equal(jornadaPermiteInscripcion(jornada), true);
  assert.equal(anterior.jornadas.length, datosIniciales.jornadas.length);
  assert.equal(asegurarJornadaDemo(salida), salida);
});

test('jornada demo: respeta jornadas existentes y no reactiva una jornada cerrada', () => {
  for (const estado of ['programada', 'activa', 'finalizada']) {
    const datos = { ...structuredClone(datosIniciales), jornadas: [{ id: 'EXISTENTE', periodo: 'Primavera', fecha: fechaLocal(), estado }] };
    assert.equal(asegurarJornadaDemo(datos), datos);
  }
});

test('jornada demo: nuevo día conserva jornadas y registros anteriores', () => {
  const anterior = asegurarJornadaDemo({ ...structuredClone(datosIniciales), atenciones: [{ id: 'AT-ANTERIOR' }] }, '2026-11-26');
  const salida = asegurarJornadaDemo(anterior, '2026-11-27');
  assert.equal(salida.jornadas.length, anterior.jornadas.length + 1);
  assert.deepEqual(salida.jornadas.slice(0, -1), anterior.jornadas);
  assert.equal(salida.atenciones, anterior.atenciones);
  assert.equal(salida.jornadas.at(-1).fecha, '2026-11-27');
});
