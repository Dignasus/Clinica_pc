
import { Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import DashboardMetricCard from './dashboard/DashboardMetricCard';
import MonitorTecnicos from './dashboard/MonitorTecnicos';
import OcupacionTaller from './dashboard/OcupacionTaller';

const estadosTaller = ['asignado', 'en_proceso', 'listo_entrega', 'contactado'];

const normalizar = (valor) =>
  String(valor || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function InicioDashboard({
  modoOscuro, rolUsuario, nombreUsuario, periodoGlobal = 'Todos',
}) {
  const { datos } = useClinica();

  const jornadasIds = new Set(
    datos.jornadas
      .filter((j) => periodoGlobal === 'Todos' || j.periodo === periodoGlobal)
      .map((j) => j.id)
  );

  const atenciones = datos.atenciones.filter((a) => jornadasIds.has(a.jornadaId));

  const preinscripciones = atenciones.filter((a) => a.estado === 'preinscrito').length;
  const equiposEnTaller = atenciones.filter((a) => estadosTaller.includes(a.estado)).length;
  const trabajosEnProceso = atenciones.filter((a) => a.estado === 'en_proceso').length;
  const pendientesEntrega = atenciones.filter(
    (a) => ['listo_entrega', 'contactado'].includes(a.estado)
  ).length;
  const entregados = atenciones.filter((a) => a.estado === 'entregado').length;

  const tecnicoActual = datos.usuarios.find((u) =>
    u.rol === 'tecnico' &&
    (normalizar(u.nombre) === normalizar(nombreUsuario) ||
     normalizar(u.id) === normalizar(nombreUsuario))
  );

  const misTareas = atenciones.filter((a) =>
    estadosTaller.includes(a.estado) &&
    a.tecnicoIds?.includes(tecnicoActual?.id)
  ).length;

  const tecnicos = datos.usuarios
    .filter((u) => u.rol === 'tecnico')
    .map((tecnico) => {
      const tareas = atenciones.filter((a) =>
        estadosTaller.includes(a.estado) &&
        a.tecnicoIds?.includes(tecnico.id)
      );

      const enProceso = tareas.filter((a) => a.estado === 'en_proceso').length;

      return {
        nombre: tecnico.nombre,
        estado: enProceso > 0
          ? `En proceso (${enProceso})`
          : tareas.length > 0
            ? `Asignado (${tareas.length})`
            : 'Sin tareas registradas',
      };
    });

  const puedeVerEquipos = ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario);
  const puedeVerPreinscripciones = ['superusuario', 'recepcionista'].includes(rolUsuario);
  const puedeVerTareas = ['superusuario', 'tecnico'].includes(rolUsuario);
  const puedeVerTecnicos = ['superusuario', 'recepcionista'].includes(rolUsuario);

  return (
    <div className={`flex flex-col gap-8 ${modoOscuro ? 'text-zinc-100' : 'text-zinc-900'}`}>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-0 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Clínica del PC · Operación
          </p>
          <h1 className="!mb-0 !mt-2 !text-3xl !font-bold sm:!text-4xl">
            Panel Principal
          </h1>
          <p className={`mb-0 mt-3 text-sm sm:text-base ${
            modoOscuro ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            Bienvenido/a, <strong>{nombreUsuario}</strong>.
            Resumen de {periodoGlobal === 'Todos' ? 'todos los períodos' : periodoGlobal}.
          </p>
        </div>

        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs ring-1 ${
          modoOscuro ? 'bg-zinc-900 text-zinc-300 ring-zinc-700'
            : 'bg-white text-zinc-600 ring-zinc-200'
        }`}>
          <span className="h-2 w-2 rounded-full bg-inacap-red" />
          Datos del prototipo
        </span>
      </header>

      {atenciones.length === 0 && (
        <Alert variant="info" className="mb-0">
          No hay atenciones registradas para el período seleccionado.
        </Alert>
      )}

      {rolUsuario === 'tecnico' && !tecnicoActual && (
        <Alert variant="warning" className="mb-0">
          La sesión no coincide con un técnico registrado.
        </Alert>
      )}

      <section aria-label="Indicadores del período"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">

        {puedeVerEquipos && (
          <OcupacionTaller modoOscuro={modoOscuro} cantidad={equiposEnTaller} />
        )}

        {puedeVerPreinscripciones && (
          <DashboardMetricCard modoOscuro={modoOscuro}
            titulo="Preinscripciones Pendientes" valor={preinscripciones} />
        )}

        {puedeVerTareas && (
          <DashboardMetricCard modoOscuro={modoOscuro}
            titulo={rolUsuario === 'tecnico' ? 'Mis Tareas Asignadas' : 'Trabajos en Proceso'}
            valor={rolUsuario === 'tecnico' ? misTareas : trabajosEnProceso} />
        )}

        {puedeVerEquipos && (
          <DashboardMetricCard modoOscuro={modoOscuro}
            titulo="Pendientes de Entrega" valor={pendientesEntrega} />
        )}

        {puedeVerEquipos && (
          <DashboardMetricCard modoOscuro={modoOscuro}
            titulo="Equipos Entregados" valor={entregados} />
        )}
      </section>

      {puedeVerTecnicos && (
        <MonitorTecnicos modoOscuro={modoOscuro} tecnicos={tecnicos} />
      )}
    </div>
  );
}
