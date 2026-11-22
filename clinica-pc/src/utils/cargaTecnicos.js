import { personalTecnico } from '../data/roles.js';

const ESTADOS_EN_TALLER = new Set(['asignado', 'en_proceso', 'listo_entrega', 'contactado']);

// El monitor muestra la actividad REAL en el período, no toda la nómina.
// Un equipo preinscrito no pertenece a ningún técnico hasta ser recepcionado.
export function obtenerCargaTecnicosPorPeriodo(datos, periodoGlobal = 'Todos') {
  const idsJornada = new Set((datos.jornadas || [])
    .filter((j) => periodoGlobal === 'Todos' || j.periodo === periodoGlobal)
    .map((j) => j.id));
  const atenciones = (datos.atenciones || []).filter((a) => idsJornada.has(a.jornadaId));
  const preinscripciones = atenciones.filter((a) => a.estado === 'preinscrito').length;

  const porTecnico = new Map();
  for (const atencion of atenciones) {
    for (const tecnicoId of new Set(atencion.tecnicoIds || [])) {
      if (!tecnicoId) continue;
      if (!porTecnico.has(tecnicoId)) porTecnico.set(tecnicoId, []);
      porTecnico.get(tecnicoId).push(atencion);
    }
  }

  const tecnicos = Array.from(porTecnico, ([id, asignaciones]) => {
    const nombre = datos.usuarios.find((u) => u.id === id)?.nombre || 'Técnico no registrado';
    const enTaller = asignaciones.filter((a) => ESTADOS_EN_TALLER.has(a.estado)).length;
    const enProceso = asignaciones.filter((a) => a.estado === 'en_proceso').length;
    const enCustodia = asignaciones.filter((a) => a.estado === 'en_custodia').length;
    const entregados = asignaciones.filter((a) => a.estado === 'entregado').length;
    const estado = enProceso
      ? `En proceso (${enProceso})`
      : enTaller
        ? `En taller (${enTaller})`
        : enCustodia
          ? `En custodia (${enCustodia})`
          : entregados
            ? `Entregados (${entregados})`
            : 'Sin atenciones activas';

    return {
      id, nombre, estado,
      disponible: enTaller === 0,
      detalle: `${asignaciones.length} ${asignaciones.length === 1 ? 'atención' : 'atenciones'} en el período · ` +
        `${enTaller} en taller · ${enCustodia} en custodia · ${entregados} entregados`,
      total: asignaciones.length,
    };
  }).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  return {
    periodo: periodoGlobal,
    tecnicos,
    preinscripciones,
    disponibles: personalTecnico(datos).length,
  };
}
