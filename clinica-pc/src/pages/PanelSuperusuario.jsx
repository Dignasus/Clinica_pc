
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

export default function PanelSuperusuario() {
  const navigate = useNavigate();
  const { datos } = useClinica();

  const [sesion] = useState(() => ({
    rol: sessionStorage.getItem('userRol') || '',
    nombre: sessionStorage.getItem('userNombre') || '',
  }));

  const rolUsuario = sesion.rol;
  const nombreUsuario = sesion.nombre;

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
        .filter(Boolean)
    ),
  ];

  const periodoGlobal =
    periodoSeleccionado === 'Todos' ||
    periodosDisponibles.includes(periodoSeleccionado)
      ? periodoSeleccionado
      : (periodosDisponibles[0] ?? 'Todos');

  const opcionesPeriodo = ['Todos', ...periodosDisponibles];

  // Los propietarios usan el portal público.
  useEffect(() => {
    if (!rolUsuario) navigate('/', { replace: true });
    else if (rolUsuario === 'cliente') {
      navigate('/inscripcion', { replace: true });
    }
  }, [rolUsuario, navigate]);

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

  const permisos = {
    inicio: ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario),
    recepcion: ['superusuario', 'recepcionista'].includes(rolUsuario),
    registroPresencial: ['superusuario', 'recepcionista'].includes(rolUsuario),
    tecnico: ['superusuario', 'tecnico'].includes(rolUsuario),
    historial: ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario),
    parametros: rolUsuario === 'superusuario',
  };

  const renderizarContenido = () => {
    if (!permisos[vistaActiva]) {
      return <div>No tienes acceso a esta sección.</div>;
    }

    switch (vistaActiva) {
      case 'inicio':
        return (
          <InicioDashboard modoOscuro={modoOscuro}
            rolUsuario={rolUsuario} nombreUsuario={nombreUsuario}
            periodoGlobal={periodoGlobal} />
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
        return <PanelTecnico modoOscuro={modoOscuro} periodoGlobal={periodoGlobal} />;

      case 'historial':
        return <HistorialConsultas modoOscuro={modoOscuro} periodoGlobal={periodoGlobal} />;

      case 'parametros':
        return <ParametrosMantenedores modoOscuro={modoOscuro} />;

      default:
        return <div>Seleccione una fase.</div>;
    }
  };

  const propiedadesSidebar = {
    nombreUsuario, vistaActiva, permisos, onSeleccionar: cambiarVista,
  };

  return (
    <div data-bs-theme={modoOscuro ? 'dark' : 'light'}
      className={`flex min-h-screen ${
        modoOscuro ? 'bg-[#121212] text-white' : 'bg-[#f4f4f4] text-gray-900'
      }`}>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto md:block">
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

        <main className="min-w-0 w-full flex-1 overflow-x-auto p-4 md:p-6">
          {renderizarContenido()}
        </main>
      </div>

      <Offcanvas show={menuMovilAbierto}
        onHide={() => setMenuMovilAbierto(false)}
        placement="start" backdrop scroll={false} keyboard restoreFocus
        aria-labelledby="titulo-menu-movil"
        data-bs-theme="dark"
        style={{ '--bs-offcanvas-width': 'min(18rem, 85vw)' }}>

        <Offcanvas.Header closeButton className="bg-[#333333] text-white">
          <Offcanvas.Title id="titulo-menu-movil">
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
