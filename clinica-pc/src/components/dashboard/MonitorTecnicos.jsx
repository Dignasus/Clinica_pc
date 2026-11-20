export default function MonitorTecnicos({
  modoOscuro, tecnicos, periodo = 'Todos', preinscripciones = 0, disponibles = 0,
}) {
  const nombrePeriodo = periodo === 'Todos' ? 'todos los períodos' : periodo;
  return (
    <section className={`pc-monitor ${modoOscuro ? 'pc-monitor--oscuro' : ''}`}
      aria-labelledby="monitor-tecnicos-title">
      <div className="pc-dashboard__seccion-cabecera pc-monitor__encabezado">
        <div>
          <p className="pc-dashboard__seccion-etiqueta">EQUIPO DE TRABAJO</p>
          <h2 id="monitor-tecnicos-title">Técnicos con atenciones asignadas</h2>
          <p className="pc-monitor__descripcion">
            Carga técnica de {nombrePeriodo}. Los equipos preinscritos aún no tienen
            técnico hasta que recepción los asigne.
          </p>
        </div>
        <span className="pc-monitor__contador">
          {tecnicos.length} {tecnicos.length === 1 ? 'técnico con asignaciones' : 'técnicos con asignaciones'}
        </span>
      </div>
      {tecnicos.length === 0 ? (
        <div className="pc-monitor__vacio">
          <p>No existen atenciones asignadas a técnicos en {nombrePeriodo}.</p>
          <p>
            {preinscripciones > 0
              ? `${preinscripciones} ${preinscripciones === 1 ? 'preinscripción pendiente' : 'preinscripciones pendientes'} de recepción y asignación.`
              : 'No hay preinscripciones pendientes de asignación en este período.'}
          </p>
          <p>{disponibles} {disponibles === 1 ? 'técnico habilitado' : 'técnicos habilitados'} para recibir asignaciones en el sistema.</p>
        </div>
      ) : (
        <div className="pc-monitor__lista" role="list">
          {tecnicos.map(({ id, nombre, estado, detalle, disponible }) => (
            <div className="pc-monitor__integrante" role="listitem" key={id}>
              <div className="pc-monitor__persona">
                <span className="pc-monitor__avatar" aria-hidden="true">{nombre.charAt(0)}</span>
                <div className="pc-monitor__datos">
                  <span className="pc-monitor__nombre" title={nombre}>{nombre}</span>
                  <span className="pc-monitor__detalle">{detalle}</span>
                </div>
              </div>
              <span className={`pc-monitor__estado ${disponible ? 'pc-monitor__estado--libre' : 'pc-monitor__estado--ocupado'}`}>
                <span aria-hidden="true" />{estado}
              </span>
            </div>
          ))}
        </div>
      )}
      {tecnicos.length > 0 && preinscripciones > 0 && (
        <p className="pc-monitor__nota">
          Además hay {preinscripciones} {preinscripciones === 1 ? 'preinscripción sin técnico asignado' : 'preinscripciones sin técnico asignado'}.
        </p>
      )}
    </section>
  );
}
