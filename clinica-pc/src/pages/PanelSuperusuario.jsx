
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Offcanvas } from 'react-bootstrap';

import { useClinica } from '../context/clinicaContextBase.js';

import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import InicioDashboard from '../components/InicioDashboard';
import InscripcionQR from '../components/InscripcionQR';
import RecepcionEquipos from '../components/RecepcionEquipos';
import PanelTecnico from '../components/PanelTecnico';
import HistorialConsultas from '../components/HistorialConsultas';
import ParametrosMantenedores from '../components/ParametrosMantenedores';
import EncuestaSatisfaccion from '../components/EncuestaSatisfaccion';

export default function PanelSuperusuario() {
  const navigate = useNavigate();
  const { datos } = useClinica();

  // Sesión del usuario
  const [sesion] = useState(() => ({
    rol: sessionStorage.getItem('userRol') || '',
    nombre: sessionStorage.getItem('userNombre') || '',
  }));

  const rolUsuario = sesion.rol;
  const nombreUsuario = sesion.nombre;

  // Navegación y apariencia
  const [vistaActiva, setVistaActiva] = useState(() =>
    sesion.rol === 'cliente' ? 'inscripcion' : 'inicio'
  );
  const [modoOscuro, setModoOscuro] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');

  // Períodos obtenidos de las jornadas, sin duplicados.
  // Ordenados desde la jornada más reciente.
  const periodosDisponibles = [
    ...new Set(
      [...datos.jornadas]
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
        .map((jornada) => jornada.periodo)
        .filter(Boolean)
    ),
  ];

  // Selección válida o período más reciente por defecto.
  const periodoGlobal =
    periodoSeleccionado === 'Todos' ||
    periodosDisponibles.includes(periodoSeleccionado)
      ? periodoSeleccionado
      : (periodosDisponibles[0] ?? 'Todos');

  const opcionesPeriodo = ['Todos', ...periodosDisponibles];

  // Verificación básica de sesión del prototipo
  useEffect(() => {
    if (!rolUsuario) navigate('/', { replace: true });
  }, [rolUsuario, navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const cambiarVista = (vista) => {
    setVistaActiva(vista);
    setMenuMovilAbierto(false);
  };

  const toggleTema = () => setModoOscuro((actual) => !actual);

  // Permisos de visualización del prototipo
  const permisos = {
    inicio: ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario),
    inscripcion: ['superusuario', 'cliente', 'recepcionista'].includes(rolUsuario),
    recepcion: ['superusuario', 'recepcionista'].includes(rolUsuario),
    tecnico: ['superusuario', 'tecnico'].includes(rolUsuario),
    historial: ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario),
    parametros: rolUsuario === 'superusuario',
    encuesta: ['superusuario', 'cliente'].includes(rolUsuario),
  };

  // Renderizado de los módulos
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
            periodoGlobal={periodoGlobal}
          />
        );

      case 'inscripcion':
        return <InscripcionQR modoOscuro={modoOscuro} />;

      case 'recepcion':
        return (
          <RecepcionEquipos
            modoOscuro={modoOscuro}
            periodoGlobal={periodoGlobal}
          />
        );

      case 'tecnico':
        return (
          <PanelTecnico
            modoOscuro={modoOscuro}
            periodoGlobal={periodoGlobal}
          />
        );

      case 'historial':
        return (
          <HistorialConsultas
            modoOscuro={modoOscuro}
            periodoGlobal={periodoGlobal}
          />
        );

      case 'parametros':
        return <ParametrosMantenedores modoOscuro={modoOscuro} />;

      case 'encuesta':
        return <EncuestaSatisfaccion modoOscuro={modoOscuro} />;

      default:
        return <div>Seleccione una fase.</div>;
    }
  };

  const propiedadesSidebar = {
    nombreUsuario,
    vistaActiva,
    permisos,
    onSeleccionar: cambiarVista,
  };

  return (
    <div
      data-bs-theme={modoOscuro ? 'dark' : 'light'}
      className={`flex min-h-screen ${
        modoOscuro ? 'bg-[#121212] text-white' : 'bg-[#f4f4f4] text-gray-900'
      }`}
    >
      {/* Navegación de escritorio */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto md:block">
        <Sidebar {...propiedadesSidebar} />
      </aside>

      {/* Contenido principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          rolUsuario={rolUsuario}
          periodoGlobal={periodoGlobal}
          periodosDisponibles={opcionesPeriodo}
          onPeriodoChange={setPeriodoSeleccionado}
          modoOscuro={modoOscuro}
          onToggleTema={toggleTema}
          onSalir={handleLogout}
          onAbrirMenu={() => setMenuMovilAbierto(true)}
          menuMovilAbierto={menuMovilAbierto}
        />

        <main className="min-w-0 w-full flex-1 overflow-x-auto p-4 md:p-6">
          {renderizarContenido()}
        </main>
      </div>

      {/* Navegación móvil */}
      <Offcanvas
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
