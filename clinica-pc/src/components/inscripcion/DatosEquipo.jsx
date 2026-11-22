
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LIMITES_REGISTRO } from '../../utils/validacionEntradas.js';

const camposEquipo = [
  {
    name: 'marcaEquipo',
    label: 'Marca del Equipo',
    required: true,
  },
  {
    name: 'modeloEquipo',
    label: 'Modelo',
    required: true,
  },
  {
    name: 'numeroSerie',
    label: 'Número de Serie (Opcional)',
    ayuda: 'Si no lo conoce, déjelo en blanco.',
    anchoCompleto: true,
  },
  {
    name: 'diagnosticoPropietario',
    label: '¿Qué problema presenta su equipo?',
    required: true,
    multilinea: true,
    anchoCompleto: true,
  },
];

const serviciosDisponibles = [
  {
    name: 'formateo',
    label: 'Formateo',
    ayuda: (
      <>
        Reinstalación del sistema desde cero.
        Elimina virus graves. <strong>Borra todos los archivos</strong>
        {' '}(requiere respaldo previo).
      </>
    ),
  },
  {
    name: 'mantencionLogica',
    label: 'Mantención Lógica',
    ayuda: (
      <>
        Limpieza de software, eliminación de virus ligeros
        y optimización. <strong>Tus archivos no se borran.</strong>
      </>
    ),
  },
  {
    name: 'mantencionFisica',
    label: 'Mantención Física',
    ayuda: (
      <>
        Limpieza interna de polvo y cambio de pasta térmica.
        Ideal si tu equipo <strong>se calienta o hace mucho ruido.</strong>
      </>
    ),
  },
];

function CampoEquipo({ campo, valor, onChange, modoOscuro }) {
  const clases = `
    block w-full min-w-0 appearance-none rounded-xl
    border px-4 py-3 text-sm shadow-sm
    outline-none transition-colors duration-200
    focus:border-inacap-red focus:ring-2 focus:ring-inacap-red/20
    ${modoOscuro
      ? 'border-gray-600 bg-[#292D32] text-white'
      : 'border-gray-300 bg-white text-gray-900'}
  `;

  const propiedades = {
    id: campo.name,
    name: campo.name,
    value: valor ?? '',
    onChange,
    required: Boolean(campo.required),
    maxLength: LIMITES_REGISTRO[campo.name],
    className: clases,
  };

  return (
    <div className={campo.anchoCompleto ? 'md:col-span-2' : ''}>
      <label
        htmlFor={campo.name}
        className="mb-2 block text-sm font-semibold"
      >
        {campo.label}
        {campo.required && (
          <span className="ml-1 text-inacap-red">*</span>
        )}
      </label>

      {campo.multilinea ? (
        <textarea {...propiedades} rows={3} />
      ) : (
        <input {...propiedades} type="text" />
      )}

      {campo.ayuda && (
        <p className="mb-0 mt-2 text-xs opacity-70">
          {campo.ayuda}
        </p>
      )}
    </div>
  );
}

function ServicioCheckbox({ servicio, checked, onChange, modoOscuro }) {
  return (
    <div className={`
      flex min-w-0 items-center gap-3 rounded-xl border p-4
      transition-colors
      ${modoOscuro
        ? 'border-gray-600 bg-[#292D32]'
        : 'border-gray-200 bg-gray-50'}
    `}>
      <input
        type="checkbox"
        id={servicio.name}
        name={servicio.name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer accent-inacap-red"
      />

      <label
        htmlFor={servicio.name}
        className="min-w-0 flex-1 cursor-pointer text-sm font-medium"
      >
        {servicio.label}
      </label>

      <OverlayTrigger
        placement="top"
        overlay={
          <Tooltip id={`tooltip-${servicio.name}`}>
            {servicio.ayuda}
          </Tooltip>
        }
      >
        <button
        type="button"
        aria-label={`Información sobre ${servicio.label}`}
        className="
            inline-flex h-8 w-8 shrink-0
            cursor-help appearance-none
            items-center justify-center
            rounded-full border-0
            bg-red-50 text-inacap-red
            transition-all duration-200
            hover:bg-inacap-red hover:text-white
            hover:scale-110
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-inacap-red
        "
        style={{ borderRadius: '50%' }}
        >
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
        </button>
      </OverlayTrigger>
    </div>
  );
}

export default function DatosEquipo({
  formData,
  onChange,
  modoOscuro,
  numeroPaso = '02',
}) {
  return (
    <section
      aria-labelledby="titulo-datos-equipo"
      className={`
        mb-6 overflow-hidden rounded-2xl border shadow-sm
        ${modoOscuro
          ? 'border-gray-700 bg-[#212529] text-white'
          : 'border-gray-200 bg-white text-gray-900'}
      `}
    >
      <div className="flex items-center gap-4 border-b border-gray-500/20 px-6 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-inacap-red text-sm font-bold text-white">
          {numeroPaso}
        </span>

        <div>
          <h2
            id="titulo-datos-equipo"
            className="mb-1 text-lg font-bold"
          >
            Datos del equipo y servicio
          </h2>
          <p className="mb-0 text-sm opacity-70">
            Identificación del equipo y asistencia solicitada
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {camposEquipo.map((campo) => (
            <CampoEquipo
              key={campo.name}
              campo={campo}
              valor={formData[campo.name]}
              onChange={onChange}
              modoOscuro={modoOscuro}
            />
          ))}
        </div>

        <fieldset className="mt-7 min-w-0 border-0 p-0">
          <legend className="mb-3 text-sm font-semibold">
            Servicio requerido
            <span className="ml-1 text-inacap-red">*</span>
          </legend>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {serviciosDisponibles.map((servicio) => (
              <ServicioCheckbox
                key={servicio.name}
                servicio={servicio}
                checked={Boolean(formData.servicios[servicio.name])}
                onChange={onChange}
                modoOscuro={modoOscuro}
              />
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
