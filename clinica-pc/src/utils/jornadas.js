
export function fechaLocal(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function obtenerEstadoJornada(jornada) {
  if (jornada.estado === 'finalizada') return 'finalizada';

  const hoy = fechaLocal();

  if (jornada.fecha < hoy) return 'pendiente_cierre';
  if (jornada.fecha > hoy) return 'programada';

  return jornada.estado === 'activa' ? 'activa' : 'programada';
}

export function jornadaPermiteInscripcion(jornada) {
  const estado = obtenerEstadoJornada(jornada);
  return estado === 'programada' || estado === 'activa';
}

export const etiquetasEstadoJornada = {
  programada: 'Programada',
  activa: 'Activa',
  pendiente_cierre: 'Pendiente de cierre',
  finalizada: 'Finalizada',
};

// Solo para la demostración local: una jornada activa por día, sin alterar las existentes.
export function asegurarJornadaDemo(datos, hoy = fechaLocal()) {
  const id = `DEMO-JOR-${hoy}`;
  if (datos.jornadas.some((j) => j.fecha === hoy || j.id === id)) return datos;
  return {
    ...datos,
    jornadas: [...datos.jornadas, {
      id,
      periodo: `Demostración ${hoy.slice(0, 4)}`,
      fecha: hoy,
      estado: 'activa',
    }],
  };
}
