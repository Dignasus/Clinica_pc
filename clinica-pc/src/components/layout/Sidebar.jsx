import logoInacap from '../../assets/logo-inacap.png';
import logoBlanco60 from '../../assets/logo-inacap-60-blanco.png';
import './Layout.css';

const nombresRol = {
  superusuario: 'Administración',
  recepcionista: 'Recepción',
  tecnico: 'Equipo técnico',
};

function obtenerIniciales(nombre) {
  return (
    String(nombre || 'Usuario')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('') || 'U'
  );
}

function IconoMenu({ tipo }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === 'inicio' && (
        <>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9v12h14V9M9 21v-7h6v7" />
        </>
      )}
      {tipo === 'recepcion' && (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 15h8" />
        </>
      )}
      {tipo === 'registroPresencial' && (
        <>
          <circle cx="9" cy="7" r="4" />
          <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2M19 8v6M16 11h6" />
        </>
      )}
      {tipo === 'tecnico' && (
        <path d="M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5a2.1 2.1 0 0 0 3 3l6.2-6.2a4 4 0 0 0 5-5l-2.8 2.8-3-3z" />
      )}
      {tipo === 'historial' && (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5M12 7v5l3 2" />
        </>
      )}
      {tipo === 'parametros' && (
        <>
          <path d="M4 7h16M4 17h16M9 4v6M15 14v6" />
          <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="17" r="2" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}

function EnlaceMenu({ id, texto, vistaActiva, onSeleccionar }) {
  const activo = vistaActiva === id;
  return (
    <button
      type="button"
      onClick={() => onSeleccionar(id)}
      aria-current={activo ? 'page' : undefined}
      className={`pc-sidebar__item${activo ? ' pc-sidebar__item--active' : ''}`}
    >
      <span className="pc-sidebar__icon"><IconoMenu tipo={id} /></span>
      <span className="pc-sidebar__item-text">{texto}</span>
      <svg
        className="pc-sidebar__arrow"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

function TituloSeccion({ children }) {
  return <p className="pc-sidebar__section-title">{children}</p>;
}

export default function Sidebar({ nombreUsuario, rolUsuario, nombreRol, vistaActiva, permisos, onSeleccionar, modoOscuro = false }) {
  const enlace = (id, texto) => (
    <EnlaceMenu
      key={id}
      id={id}
      texto={texto}
      vistaActiva={vistaActiva}
      onSeleccionar={onSeleccionar}
    />
  );

  const hayFases =
    permisos.recepcion || permisos.registroPresencial || permisos.tecnico || permisos.historial;

  return (
    <div className={`pc-sidebar ${modoOscuro ? 'pc-sidebar--dark' : 'pc-sidebar--light'}`}>
      <div className={`pc-sidebar__brand${modoOscuro ? ' pc-sidebar__brand--dark' : ''}`}>
        <img
          src={modoOscuro ? logoBlanco60 : logoInacap}
          alt={modoOscuro ? 'INACAP 60 años' : 'INACAP'}
          className="pc-sidebar__logo"
        />
        <span className="pc-sidebar__brand-detail">Clínica del PC</span>
      </div>

      <div className="pc-sidebar__user">
        <span className="pc-sidebar__avatar">{obtenerIniciales(nombreUsuario)}</span>
        <div className="pc-sidebar__user-text">
          <strong title={nombreUsuario}>{nombreUsuario || 'Usuario'}</strong>
          <small>{nombreRol || nombresRol[rolUsuario] || 'Personal autorizado'}</small>
        </div>
      </div>

      <nav aria-label="Módulos del sistema" className="pc-sidebar__nav">
        {permisos.inicio && (
          <section className="pc-sidebar__section" aria-label="General">
            <TituloSeccion>General</TituloSeccion>
            {enlace('inicio', 'Inicio')}
          </section>
        )}
        {hayFases && (
          <section className="pc-sidebar__section" aria-label="Fases del servicio">
            <TituloSeccion>Fases del servicio</TituloSeccion>
            {permisos.recepcion && enlace('recepcion', 'Recepción de equipos')}
            {permisos.registroPresencial && enlace('registroPresencial', 'Registro presencial')}
            {permisos.tecnico && enlace('tecnico', 'Panel técnico')}
            {permisos.historial && enlace('historial', 'Historial y consultas')}
          </section>
        )}
        {permisos.parametros && (
          <section className="pc-sidebar__section" aria-label="Administración">
            <TituloSeccion>Administración</TituloSeccion>
            {enlace('parametros', 'Parámetros y mantenedores')}
          </section>
        )}
      </nav>

      <div className="pc-sidebar__footer">Prototipo académico · INACAP</div>
    </div>
  );
}
