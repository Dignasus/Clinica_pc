import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Panel.css'; // Crearemos los estilos en el siguiente paso
import InscripcionQR from '../components/InscripcionQR';
import RecepcionEquipos from '../components/RecepcionEquipos';

export default function PanelSuperusuario() {
  const [vistaActiva, setVistaActiva] = useState('recepcion');
  const [periodoGlobal, setPeriodoGlobal] = useState('Otoño 2026');
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    navigate('/');
  };

  // OWASP A01: Como superusuario, esta vista renderiza todo. 
  // En un backend real, el rol del usuario filtraría qué opciones ve.
  const renderizarContenido = () => {
    switch (vistaActiva) {
      case 'inscripcion':
        return <InscripcionQR />;
      case 'recepcion':
        return <RecepcionEquipos />;
      case 'tecnico':
        return <div className="vista-placeholder">🔧 Panel Técnico: Equipos asignados, Diagnóstico y Checklists Dinámicos</div>;
      case 'historial':
        return <div className="vista-placeholder">📅 Historial y Consultas: Atenciones finalizadas (Filtro por fecha)</div>;
      case 'parametros':
        return <div className="vista-placeholder">⚙️ Mantenedores: Gestión de Checklists, Servicios y Técnicos</div>;
      default:
        return <div>Seleccione una fase</div>;
    }
  };

  return (
    <div className="panel-layout">
      {/* Barra Lateral (Fases Lógicas) */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Clínica del PC</h2>
          <span className="badge-rol">Superusuario</span>
        </div>
        
        <nav className="sidebar-menu">
          <p className="menu-label">FASES DEL SERVICIO</p>
          <button 
            className={vistaActiva === 'inscripcion' ? 'active' : ''} 
            onClick={() => setVistaActiva('inscripcion')}
          >
            1. Inscripción (QR)
          </button>
          <button 
            className={vistaActiva === 'recepcion' ? 'active' : ''} 
            onClick={() => setVistaActiva('recepcion')}
          >
            2. Recepción de Equipos
          </button>
          <button 
            className={vistaActiva === 'tecnico' ? 'active' : ''} 
            onClick={() => setVistaActiva('tecnico')}
          >
            3. Panel Técnico
          </button>
          <button 
            className={vistaActiva === 'historial' ? 'active' : ''} 
            onClick={() => setVistaActiva('historial')}
          >
            4. Historial y Consultas
          </button>
          
          <p className="menu-label mt-2">ADMINISTRACIÓN</p>
          <button 
            className={vistaActiva === 'parametros' ? 'active' : ''} 
            onClick={() => setVistaActiva('parametros')}
          >
            Parámetros y Mantenedores
          </button>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        {/* Cabecera con Filtro Temporal Exigido */}
        <header className="topbar">
          <div className="filtros-globales">
            <label htmlFor="periodo">Período Activo: </label>
            <select 
              id="periodo" 
              value={periodoGlobal} 
              onChange={(e) => setPeriodoGlobal(e.target.value)}
              className="select-periodo"
            >
              <option value="Otoño 2026">Otoño 2026</option>
              <option value="Primavera 2026">Primavera 2026</option>
              <option value="Otoño 2025">Otoño 2025</option>
              <option value="Todos">Todos los períodos</option>
            </select>
          </div>
          <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
        </header>

        {/* Contenedor Dinámico */}
        <section className="content-area">
          {renderizarContenido()}
        </section>
      </main>
    </div>
  );
}