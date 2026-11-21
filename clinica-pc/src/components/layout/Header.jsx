import { Form } from 'react-bootstrap';
import './Layout.css';

function Icono({ tipo }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {tipo === 'menu' && <path d="M4 6h16M4 12h16M4 18h16" />}
      {tipo === 'sol' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
      )}
      {tipo === 'luna' && <path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z" />}
      {tipo === 'salir' && (
        <>
          <path d="M10 17l5-5-5-5M15 12H3" />
          <path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" />
        </>
      )}
    </svg>
  );
}

export default function Header({
  rolUsuario,
  periodoGlobal,
  periodosDisponibles = ['Todos'],
  onPeriodoChange,
  modoOscuro,
  onToggleTema,
  onSalir,
  onAbrirMenu,
  menuMovilAbierto,
}) {
  return (
    <header className={`pc-topbar${modoOscuro ? ' pc-topbar--dark' : ''}`}>
      <div className="pc-topbar__main">
        <button
          type="button"
          onClick={onAbrirMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuMovilAbierto}
          aria-controls="menu-movil-clinica"
          className="pc-topbar__icon-button pc-topbar__mobile-menu"
        >
          <Icono tipo="menu" />
        </button>

        <div className="pc-topbar__brand">
          <span className="pc-topbar__brand-mark" aria-hidden="true" />
          <div>
            <strong>Clínica del PC</strong>
            <small>Gestión de atenciones</small>
          </div>
        </div>

        {rolUsuario !== 'cliente' && (
          <div className="pc-topbar__period">
            <Form.Label htmlFor="periodo-global">Período académico</Form.Label>
            <Form.Select
              id="periodo-global"
              value={periodoGlobal}
              onChange={(event) => onPeriodoChange(event.target.value)}
              aria-label="Filtrar por período académico"
            >
              {periodosDisponibles.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {periodo === 'Todos' ? 'Todos los períodos' : periodo}
                </option>
              ))}
            </Form.Select>
          </div>
        )}
        <div className="pc-topbar__actions">
          <button
            type="button"
            onClick={onToggleTema}
            aria-label={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            aria-pressed={modoOscuro}
            title={modoOscuro ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="pc-topbar__icon-button"
          >
            <Icono tipo={modoOscuro ? 'sol' : 'luna'} />
          </button>
          <button type="button" onClick={onSalir} className="pc-topbar__logout">
            <Icono tipo="salir" />
            <span>Salir</span>
          </button>
        </div>
      </div>


    </header>
  );
}
