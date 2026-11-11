
import { Form } from 'react-bootstrap';

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
  const headerClass = `sticky top-0 z-20 border-b px-4 py-3 md:px-6 ${
    modoOscuro
      ? 'border-gray-700 bg-[#212529] text-white'
      : 'border-gray-200 bg-white text-gray-900'
  }`;

  return (
    <header className={headerClass}>
      <div className="flex flex-wrap items-center gap-4">

        {/* MENÚ MÓVIL */}
        <button type="button" onClick={onAbrirMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuMovilAbierto}
          className="cursor-pointer rounded-lg border border-gray-300 bg-transparent px-3 py-2 md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* PERÍODO ACADÉMICO DINÁMICO */}
        {rolUsuario !== 'cliente' && (
          <div className="flex flex-wrap items-center gap-2">
            <Form.Label htmlFor="periodo-global" className="mb-0 text-sm font-semibold">
              Período académico:
            </Form.Label>

            <Form.Select id="periodo-global" value={periodoGlobal}
              onChange={(e) => onPeriodoChange(e.target.value)}
              className="w-auto max-w-full" aria-label="Filtrar por período académico">

              {periodosDisponibles.map((periodo) => (
                <option key={periodo} value={periodo}>
                  {periodo === 'Todos' ? 'Todos los períodos' : periodo}
                </option>
              ))}
            </Form.Select>
          </div>
        )}

        {/* PREFERENCIAS Y SESIÓN */}
        <div className="ml-auto flex flex-wrap items-center gap-4">
          <Form.Check type="switch" id="tema-switch"
            label={modoOscuro ? 'Modo Oscuro' : 'Modo Claro'}
            checked={modoOscuro} onChange={onToggleTema}
            className="mb-0 text-sm" />

          <button type="button" onClick={onSalir}
            className="cursor-pointer border-0 bg-inacap-red px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-90"
            style={{ borderRadius: '12px' }}>
            Salir
          </button>
        </div>

      </div>
    </header>
  );
}
