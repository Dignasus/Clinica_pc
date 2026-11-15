import { Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import { personalTecnico } from '../data/roles.js';
import DashboardMetricCard from './dashboard/DashboardMetricCard.jsx';
import MonitorTecnicos from './dashboard/MonitorTecnicos.jsx';
import OcupacionTaller from './dashboard/OcupacionTaller.jsx';
import './dashboard/Dashboard.css';

const estadosTaller = ['asignado', 'en_proceso', 'listo_entrega', 'contactado'];
const normalizar = (valor) => String(valor || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function InicioDashboard({
  modoOscuro, rolUsuario, nombreUsuario, permisos = {}, usuarioId = '', periodoGlobal = 'Todos',
}) {
  const { datos } = useClinica();

  // Se conservan los cálculos del Dashboard original.
  const jornadasIds = new Set(datos.jornadas
    .filter((j) => periodoGlobal === 'Todos' || j.periodo === periodoGlobal)
    .map((j) => j.id));
  const atenciones = datos.atenciones.filter((a) => jornadasIds.has(a.jornadaId));
  const preinscripciones = atenciones.filter((a) => a.estado === 'preinscrito').length;
  const equiposEnTaller = atenciones.filter((a) => estadosTaller.includes(a.estado)).length;
  const trabajosEnProceso = atenciones.filter((a) => a.estado === 'en_proceso').length;
  const pendientesEntrega = atenciones.filter((a) => ['listo_entrega', 'contactado'].includes(a.estado)).length;
  const entregados = atenciones.filter((a) => a.estado === 'entregado').length;

  const tecnicoActual = personalTecnico(datos).find((u) => u.id === usuarioId);
  const misTareas = atenciones.filter((a) => estadosTaller.includes(a.estado) &&
    a.tecnicoIds?.includes(tecnicoActual?.id)).length;

  const tecnicos = personalTecnico(datos).map((tecnico) => {
    const tareas = atenciones.filter((a) => estadosTaller.includes(a.estado) &&
      a.tecnicoIds?.includes(tecnico.id));
    const enProceso = tareas.filter((a) => a.estado === 'en_proceso').length;
    return {
      nombre: tecnico.nombre,
      estado: enProceso > 0 ? `En proceso (${enProceso})`
        : tareas.length > 0 ? `Asignado (${tareas.length})` : 'Sin tareas registradas',
    };
  });

  const puedeVerEquipos = permisos.inicio;
  const puedeVerPreinscripciones = permisos.recepcion;
  const puedeVerTareas = permisos.tecnico;
  const puedeVerTecnicos = permisos.recepcion;
  const cantidadMetricas = Number(puedeVerEquipos) * 3 +
    Number(puedeVerPreinscripciones) + Number(puedeVerTareas);

  return (
    <div className={`pc-dashboard ${modoOscuro ? 'pc-dashboard--dark' : ''}`}>
      <header className="pc-dashboard__encabezado">
        <div className="pc-dashboard__introduccion">
          <p className="pc-dashboard__sobretitulo"><span aria-hidden="true" /> CLÍNICA DEL PC / INICIO</p>
          <h1>Resumen de operaciones</h1>
          <p className="pc-dashboard__subtitulo">
            Bienvenido/a, <strong>{nombreUsuario}</strong>. Consulta el estado de las atenciones del período.
          </p>
        </div>
        <div className="pc-dashboard__periodo" aria-label={`Período seleccionado: ${periodoGlobal}`}>
          <span className="pc-dashboard__periodo-icono" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" />
            </svg>
          </span>
          <span><small>Período académico</small><strong>{periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}</strong></span>
        </div>
      </header>

      {atenciones.length === 0 && (
        <Alert variant="info" className="pc-dashboard__alerta mb-0">
          No hay atenciones registradas para el período seleccionado.
        </Alert>
      )}
      {permisos.tecnico && !permisos.parametros && !tecnicoActual && (
        <Alert variant="warning" className="pc-dashboard__alerta mb-0">
          La sesión no coincide con un técnico registrado.
        </Alert>
      )}

      {cantidadMetricas > 0 && (
        <section className="pc-dashboard__seccion" aria-labelledby="pc-metricas-titulo">
          <div className="pc-dashboard__seccion-cabecera">
            <div>
              <p className="pc-dashboard__seccion-etiqueta">INDICADORES</p>
              <h2 id="pc-metricas-titulo">Actividad del período</h2>
            </div>
            <span className="pc-dashboard__seccion-nota">Datos de demostración</span>
          </div>
          <div className={`pc-dashboard__metricas pc-dashboard__metricas--${cantidadMetricas}`}>
            {puedeVerEquipos && <OcupacionTaller modoOscuro={modoOscuro} cantidad={equiposEnTaller} />}
            {puedeVerPreinscripciones && (
              <DashboardMetricCard modoOscuro={modoOscuro} titulo="Preinscripciones pendientes"
                valor={preinscripciones} icono="clipboard" descripcion="Pendientes de recepción" tono="ambar" />
            )}
            {puedeVerTareas && (
              <DashboardMetricCard modoOscuro={modoOscuro}
                titulo={!permisos.parametros ? 'Mis tareas asignadas' : 'Trabajos en proceso'}
                valor={rolUsuario === 'tecnico' ? misTareas : trabajosEnProceso}
                icono="herramienta" descripcion="Atenciones en taller" tono="azul" />
            )}
            {puedeVerEquipos && (
              <DashboardMetricCard modoOscuro={modoOscuro} titulo="Pendientes de entrega"
                valor={pendientesEntrega} icono="reloj" descripcion="Listos o contactados" tono="violeta" />
            )}
            {puedeVerEquipos && (
              <DashboardMetricCard modoOscuro={modoOscuro} titulo="Equipos entregados"
                valor={entregados} icono="entrega" descripcion="Atenciones finalizadas" tono="verde" />
            )}
          </div>
        </section>
      )}
      {puedeVerTecnicos && <MonitorTecnicos modoOscuro={modoOscuro} tecnicos={tecnicos} />}
    </div>
  );
}
