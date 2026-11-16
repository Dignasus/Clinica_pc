import { fechaLocal } from './jornadas.js';

export const QA_VISUAL_PERIODO = 'QA Visual';
export const QA_VISUAL_PREFIJO = 'QA-VISUAL-';

const jornadaId = 'QA-VISUAL-JORNADA';
const situaciones = [
  { id: 'DIRECTO', estado: 'contactado', marca: 'Lenovo', modelo: 'ThinkPad T480',
    nombre: 'Cliente', apellido: 'Prueba Directa', rut: 'QA-IDENTIDAD-01' },
  { id: 'CUSTODIA', estado: 'en_custodia', marca: 'HP', modelo: 'ProBook 440 G7',
    nombre: 'Cliente', apellido: 'Prueba Custodia', rut: 'QA-IDENTIDAD-02' },
];

export function hayEscenariosQaVisual(datos) {
  return datos.atenciones.some((a) => a.id.startsWith(QA_VISUAL_PREFIJO));
}

export function agregarEscenariosQaVisual(datos) {
  if (hayEscenariosQaVisual(datos)) return datos;
  const ahora = new Date().toISOString();
  const fecha = fechaLocal();
  const jornadas = datos.jornadas.some((j) => j.id === jornadaId)
    ? datos.jornadas
    : [...datos.jornadas, { id: jornadaId, periodo: QA_VISUAL_PERIODO,
      fecha, estado: 'activa' }];

  const propietarios = situaciones.map((c) => ({
    id: `${QA_VISUAL_PREFIJO}PROP-${c.id}`,
    nombre: c.nombre,
    apellidoPaterno: c.apellido,
    apellidoMaterno: '',
    rut: c.rut,
    region: 'Biobío',
    comuna: 'San Pedro de la Paz',
    telefono: '000000000',
    correo: 'qa-ejemplo@example.invalid',
  }));

  const dispositivos = situaciones.map((c) => ({
    id: `${QA_VISUAL_PREFIJO}DISP-${c.id}`,
    propietarioId: `${QA_VISUAL_PREFIJO}PROP-${c.id}`,
    marca: c.marca,
    modelo: c.modelo,
    numeroSerie: `SERIE-QA-${c.id}`,
    tipo: 'Notebook',
  }));

  const atenciones = situaciones.map((c) => ({
    id: `${QA_VISUAL_PREFIJO}AT-${c.id}`,
    jornadaId,
    dispositivoId: `${QA_VISUAL_PREFIJO}DISP-${c.id}`,
    estado: c.estado,
    fechaPreinscripcion: ahora,
    fechaRecepcion: ahora,
    tecnicoIds: ['cristian'],
    servicioIds: ['mantencionFisica'],
    servicioIdsSolicitados: ['mantencionFisica'],
    inspeccionInicial: { encendido: 'Sí', estadoFisico: 'Sin daños visibles', accesorios: 'Cargador QA' },
    respuestasChecklist: [
      { servicioId: 'mantencionFisica', itemId: 'FIS-01', estado: 'Sí', observacion: '' },
      { servicioId: 'mantencionFisica', itemId: 'FIS-02', estado: 'Sí', observacion: '' },
    ],
    observacionesTecnicas: 'Registro ficticio creado exclusivamente para QA visual.',
    verificacionFinal: {
      encendido: 'Sí', estadoFisico: 'Correcto', accesorios: 'Cargador QA',
      diferencias: 'Sin diferencias', resultadoServicio: 'resuelto',
    },
    fechaVerificacionFinal: ahora,
    contacto: { medio: 'telefono', observaciones: 'Cliente informado en simulación QA.', fecha: ahora },
    ...(c.estado === 'en_custodia' ? {
      custodia: {
        ubicacion: 'Sala de profesores, piso 2',
        responsableRecepcion: 'Docente ficticio',
        motivo: 'Retiro después del horario de la clínica (QA)',
        fechaIngreso: ahora,
        registradoPorUsuarioId: 'cristian',
        confirmacionRecepcion: true,
      },
    } : {}),
  }));

  return {
    ...datos,
    jornadas,
    propietarios: [...datos.propietarios, ...propietarios],
    dispositivos: [...datos.dispositivos, ...dispositivos],
    atenciones: [...datos.atenciones, ...atenciones],
  };
}

export function reiniciarEscenariosQaVisual(datos) {
  const eliminar = (lista) => lista.filter((item) => !item.id.startsWith(QA_VISUAL_PREFIJO));
  return agregarEscenariosQaVisual({
    ...datos,
    jornadas: eliminar(datos.jornadas),
    propietarios: eliminar(datos.propietarios),
    dispositivos: eliminar(datos.dispositivos),
    atenciones: eliminar(datos.atenciones),
  });
}
