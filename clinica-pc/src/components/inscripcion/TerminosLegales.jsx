
export default function TerminosLegales({
  formData,
  onChange,
  modoOscuro,
  numeroPaso = '03',
}) {
  return (
    <section
      aria-labelledby="titulo-terminos"
      className={`
        mb-6 overflow-hidden rounded-2xl border shadow-sm
        ${modoOscuro
          ? 'border-gray-700 bg-[#212529] text-white'
          : 'border-gray-200 bg-white text-gray-900'}
      `}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-4 border-b border-gray-500/20 px-6 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-inacap-red text-sm font-bold text-white">
          {numeroPaso}
        </span>

        <div>
          <h2
            id="titulo-terminos"
            className="mb-1 text-lg font-bold"
          >
            Términos y condiciones legales
          </h2>

          <p className="mb-0 text-sm opacity-70">
            Revisión y aceptación de las condiciones del servicio
          </p>
        </div>
      </div>

      {/* Consentimiento */}
      <div className="p-6">
        <div
          className={`
            rounded-xl border p-5
            ${modoOscuro
              ? 'border-gray-600 bg-[#292D32]'
              : 'border-gray-200 bg-gray-50'}
          `}
        >
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              id="aceptaTerminos"
              name="aceptaTerminos"
              checked={formData.aceptaTerminos}
              onChange={onChange}
              required
              className="
                mt-1 h-5 w-5 shrink-0
                cursor-pointer accent-inacap-red
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-inacap-red
              "
            />

            <label
              htmlFor="aceptaTerminos"
              className="cursor-pointer text-sm leading-7"
            >
              Tomo conocimiento y acepto las condiciones del servicio.
              Autorizo el tratamiento de mis datos personales en
              conformidad a la <strong>Ley N° 21.719</strong> y eximo
              expresamente a <strong>Clínica del PC</strong> y a
              <strong> INACAP</strong> de cualquier responsabilidad
              frente a la eventual pérdida de información, programas
              o datos no respaldados por mí de forma previa a la
              entrega del equipo.
            </label>
          </div>
        </div>

        <p className="mb-0 mt-4 text-xs opacity-70">
          * Debes aceptar las condiciones para continuar
          con la preinscripción.
        </p>
      </div>
    </section>
  );
}
