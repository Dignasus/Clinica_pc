import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';

import { useClinica } from '../context/clinicaContextBase.js';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import InicioDashboard from '../components/InicioDashboard';
import RecepcionEquipos from '../components/RecepcionEquipos';
import RegistroPresencial from '../components/recepcion/RegistroPresencial';
import PanelTecnico from '../components/PanelTecnico';
import HistorialConsultas from '../components/HistorialConsultas';
import ParametrosMantenedores from '../components/ParametrosMantenedores';
import { MODULOS, nombreDeRol, tienePermiso } from '../data/roles.js';

export default function PanelSuperusuario() {
  const navigate = useNavigate();
  const { datos } = useClinica();

  const [idSesion] = useState(() => sessionStorage.getItem('userId') || '');
  const usuario = datos.usuarios.find((u) => u.id === idSesion);
  const rolUsuario = usuario?.rol || '';
  const nombreUsuario = usuario?.nombre || '';
  const permisos = Object.fromEntries(MODULOS.map((m) =>
    [m.id, tienePermiso(datos, rolUsuario, m.id)]));

  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [registroReciente, setRegistroReciente] = useState(null);

  // Períodos obtenidos de las jornadas registradas.
  const periodosDisponibles = [
    ...new Set(
      [...datos.jornadas]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((j) => j.periodo)
        .filter(Boolean),
    ),
  ];

  const periodoGlobal =
    periodoSeleccionado === 'Todos' || periodosDisponibles.includes(periodoSeleccionado)
      ? periodoSeleccionado
      : (periodosDisponibles[0] ?? 'Todos');

  const opcionesPeriodo = ['Todos', ...periodosDisponibles];

  useEffect(() => {
    if (!usuario || !Object.values(permisos).some(Boolean)) {
      sessionStorage.removeItem('authToken');
      navigate('/', { replace: true });
    }
  }, [usuario, rolUsuario, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const cambiarVista = (vista) => {
    setRegistroReciente(null);
    setVistaActiva(vista);
    setMenuMovilAbierto(false);
  };

  // Después del registro presencial, abrir directamente esa atención.
  const registroCompletado = ({ atencionId, rut }) => {
    setRegistroReciente({ atencionId, rut });
    setVistaActiva('recepcion');
    setMenuMovilAbierto(false);
  };

  const renderizarContenido = () => {
    if (!permisos[vistaActiva]) {
      return <div>No tienes acceso a esta sección.</div>;
    }

    switch (vistaActiva) {
      case 'inicio':
        return (
          <InicioDashboard
            modoOscuro={modoOscuro}
            rolUsuario={rolUsuario}
            nombreUsuario={nombreUsuario}
            permisos={permisos}
            usuarioId={idSesion}
            periodoGlobal={periodoGlobal}
          />
        );

      case 'recepcion':
        return (
          <RecepcionEquipos
            key={registroReciente?.atencionId || 'busqueda'}
            modoOscuro={modoOscuro}
            periodoGlobal={periodoGlobal}
            seleccionInicial={registroReciente}
          />
        );

      case 'registroPresencial':
        return (
          <RegistroPresencial
            modoOscuro={modoOscuro}
            periodoGlobal={periodoGlobal}
            onCancelar={() => cambiarVista('recepcion')}
            onRegistrado={registroCompletado}
          />
        );

      case 'tecnico':
        return <PanelTecnico modoOscuro={modoOscuro} periodoGlobal={periodoGlobal} usuarioId={idSesion} puedeVerTodos={permisos.parametros} />;

      case 'historial':
        return <HistorialConsultas modoOscuro={modoOscuro} periodoGlobal={periodoGlobal} />;

      case 'parametros':
        return <ParametrosMantenedores modoOscuro={modoOscuro} />;

      default:
        return <div>Seleccione una fase.</div>;
    }
  };

  const propiedadesSidebar = {
    nombreUsuario,
    rolUsuario,
    nombreRol: nombreDeRol(datos, rolUsuario),
    modoOscuro,
    vistaActiva,
    permisos,
    onSeleccionar: cambiarVista,
  };

  return (
    <div
      data-bs-theme={modoOscuro ? 'dark' : 'light'}
      className={`flex min-h-screen ${
        modoOscuro ? 'bg-[#15171b] text-white' : 'bg-[#f5f6f8] text-slate-900'
      }`}
    >
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 overflow-hidden md:block">
        <Sidebar {...propiedadesSidebar} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          rolUsuario={rolUsuario}
          periodoGlobal={periodoGlobal}
          periodosDisponibles={opcionesPeriodo}
          onPeriodoChange={setPeriodoSeleccionado}
          modoOscuro={modoOscuro}
          onToggleTema={() => setModoOscuro((actual) => !actual)}
          onSalir={handleLogout}
          onAbrirMenu={() => setMenuMovilAbierto(true)}
          menuMovilAbierto={menuMovilAbierto}
        />

        <main id="contenido-principal" className="min-w-0 w-full flex-1 overflow-x-auto p-4 md:p-6 xl:p-8">
          {renderizarContenido()}
        </main>
      </div>

      <Offcanvas
        id="menu-movil-clinica"
        show={menuMovilAbierto}
        onHide={() => setMenuMovilAbierto(false)}
        placement="start"
        backdrop
        scroll={false}
        keyboard
        restoreFocus
        aria-labelledby="titulo-menu-movil"
        data-bs-theme="dark"
        style={{ '--bs-offcanvas-width': 'min(18rem, 85vw)' }}
      >
        <Offcanvas.Header closeButton className="bg-[#24272d] text-white">
          <Offcanvas.Title id="titulo-menu-movil" className="text-base font-semibold">
            Menú de navegación
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-0">
          <Sidebar {...propiedadesSidebar} />
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
}
