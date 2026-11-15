// Reglas del seguimiento académico. No representa un servicio real de envío.
export const HORAS_HASTA_ENCUESTA = 72; // Valor de demostración; confirmar con el docente.

export function programarEncuesta(fechaEntrega, token) {
  const origen = new Date(fechaEntrega);
  if (!token || Number.isNaN(origen.getTime())) return null;
  return {
    token,
    estado: 'pendiente_envio',
    programadaPara: new Date(origen.getTime() + HORAS_HASTA_ENCUESTA * 3600000).toISOString(),
  };
}

export function puedeCerrarTicket(atencion) {
  if (atencion?.estado !== 'entregado' || atencion.cierreTicket?.fecha) return false;
  const seguimiento = atencion.seguimiento;
  if (!seguimiento?.respuesta) return false;
  return seguimiento.respuesta.funcionamiento === 'bien' ||
    Boolean(seguimiento.resolucion?.observaciones?.trim());
}

export function estadoTicket(atencion) {
  if (atencion?.cierreTicket?.fecha) return 'cerrado';
  if (atencion?.estado !== 'entregado') {
    return ['no_presentado', 'cancelado', 'cerrada', 'finalizada'].includes(atencion?.estado)
      ? 'sin_cierre_posservicio' : 'en_atencion';
  }
  const s = atencion.seguimiento;
  if (!s) return 'pendiente_configurar';
  if (s.respuesta?.funcionamiento !== 'bien' && s.respuesta && !s.resolucion) {
    return 'incidencia';
  }
  if (s.respuesta) return 'pendiente_cierre';
  if (s.estado === 'enviada_demo') return 'esperando_respuesta';
  return 'pendiente_envio';
}

export const etiquetasTicket = {
  cerrado: 'Ticket cerrado',
  sin_cierre_posservicio: 'Sin seguimiento posservicio',
  en_atencion: 'En atención',
  pendiente_configurar: 'Seguimiento por preparar',
  pendiente_envio: 'Encuesta pendiente',
  esperando_respuesta: 'Encuesta habilitada (demo)',
  incidencia: 'Incidencia reportada',
  pendiente_cierre: 'Pendiente de revisión y cierre',
};
