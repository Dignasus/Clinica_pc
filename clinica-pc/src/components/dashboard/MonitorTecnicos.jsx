export default function MonitorTecnicos({ modoOscuro, tecnicos }) {
  return (
    <section className={`pc-monitor ${modoOscuro ? 'pc-monitor--oscuro' : ''}`} aria-labelledby="monitor-tecnicos-title">
      <div className="pc-dashboard__seccion-cabecera pc-monitor__encabezado">
        <div>
          <p className="pc-dashboard__seccion-etiqueta">EQUIPO DE TRABAJO</p>
          <h2 id="monitor-tecnicos-title">Estado actual de técnicos</h2>
          <p className="pc-monitor__descripcion">Disponibilidad y carga de trabajo del período seleccionado</p>
        </div>
        <span className="pc-monitor__contador">{tecnicos.length} integrantes</span>
      </div>
      {tecnicos.length === 0 ? (
        <p className="pc-monitor__vacio">No hay técnicos registrados.</p>
      ) : (
        <div className="pc-monitor__lista" role="list">
          {tecnicos.map(({ nombre, estado }) => {
            const disponible = ['Disponible', 'Sin tareas registradas'].includes(estado);
            return (
              <div className="pc-monitor__integrante" role="listitem" key={nombre}>
                <div className="pc-monitor__persona">
                  <span className="pc-monitor__avatar" aria-hidden="true">{nombre.charAt(0)}</span>
                  <span className="pc-monitor__nombre" title={nombre}>{nombre}</span>
                </div>
                <span className={`pc-monitor__estado ${disponible ? 'pc-monitor__estado--libre' : 'pc-monitor__estado--ocupado'}`}>
                  <span aria-hidden="true" />{estado}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
