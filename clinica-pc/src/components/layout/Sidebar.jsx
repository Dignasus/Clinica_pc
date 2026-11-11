
import logoInacap from '../../assets/logo-inacap.png';


function EnlaceMenu({ id, texto, vistaActiva, onSeleccionar }) {
  const activo = vistaActiva === id;

  return (
    <button
      type="button"
      onClick={() => onSeleccionar(id)}
      aria-current={activo ? 'page' : undefined}
      className={`
        block w-full cursor-pointer appearance-none
        rounded-lg border-0 px-4 py-2.5
        text-left text-sm text-white
        transition-colors duration-200
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-white
        ${
          activo
            ? 'bg-inacap-red font-semibold'
            : 'bg-transparent hover:bg-inacap-red/90 hover:text-white'
        }
      `}
    >
      {texto}
    </button>
  );
}


export default function Sidebar({
  nombreUsuario,
  vistaActiva,
  permisos,
  onSeleccionar,
}) {
  const enlace = (id, texto) => (
    <EnlaceMenu
      key={id}
      id={id}
      texto={texto}
      vistaActiva={vistaActiva}
      onSeleccionar={onSeleccionar}
    />
  );

  return (
    <div className="flex min-h-full flex-col bg-[#333333] text-white">
      <div className="border-b-4 border-inacap-red bg-white px-5 py-6 text-center">
        <img
          src={logoInacap}
          alt="INACAP"
          className="mx-auto h-auto w-full max-w-[170px] object-contain"
        />
        <p className="mt-3 mb-0 text-sm font-semibold text-inacap-red">
          {nombreUsuario}
        </p>
      </div>

      <nav aria-label="Módulos del sistema" className="flex flex-col gap-1 p-3">
        {permisos.inicio && enlace('inicio', 'Inicio')}

        <p className="mb-1 mt-5 px-3 text-xs font-semibold uppercase tracking-wider text-gray-300">
          Fases del servicio
        </p>

        {permisos.inscripcion &&
          enlace('inscripcion', '1. Inscripción (QR)')}

        {permisos.encuesta &&
          enlace('encuesta', '★ Evaluar Servicio')}

        {permisos.recepcion &&
          enlace('recepcion', '2. Recepción de Equipos')}

        {permisos.tecnico &&
          enlace('tecnico', '3. Panel Técnico')}

        {permisos.historial &&
          enlace('historial', '4. Historial y Consultas')}

        {permisos.parametros && (
          <>
            <p className="mb-1 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-gray-300">
              Administración
            </p>
            {enlace('parametros', 'Parámetros y Mantenedores')}
          </>
        )}
      </nav>
    </div>
  );
}
