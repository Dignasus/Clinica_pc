export default function OcupacionTaller({ modoOscuro, cantidad }) {
  return (
    <article
      className={`relative flex min-h-44 flex-col justify-between overflow-hidden rounded-2xl p-6 ring-1 ring-inset ${
        modoOscuro
          ? 'bg-zinc-900 ring-zinc-800'
          : 'bg-inacap-white ring-zinc-200'
      }`}
    >
      <div className="absolute inset-y-0 left-0 w-1.5 bg-inacap-red" aria-hidden="true" />

      <div className="flex items-start justify-between gap-6 pl-2">
        <div>
          <h2 className={`!mb-0 !text-sm !font-semibold !leading-6 ${modoOscuro ? 'text-zinc-300' : 'text-inacap-gray'}`}>
            Equipos en Taller
          </h2>
          <p className={`mb-0 mt-1 text-xs ${modoOscuro ? 'text-zinc-500' : 'text-zinc-500'}`}>
            Conteo actual
          </p>
        </div>
        <span className={`rounded-full px-4 py-2 text-xs font-semibold ring-1 ring-inset ${modoOscuro ? 'bg-zinc-800 text-zinc-300 ring-zinc-700' : 'bg-zinc-50 text-inacap-gray ring-zinc-200'}`}>
          Taller
        </span>
      </div>

      <p className={`mb-0 pl-2 text-5xl font-semibold leading-none tracking-tight ${modoOscuro ? 'text-white' : 'text-zinc-950'}`}>
        {cantidad}
        <span className={`ml-3 text-sm font-medium tracking-normal ${modoOscuro ? 'text-zinc-400' : 'text-zinc-500'}`}>
          equipos
        </span>
      </p>
    </article>
  );
}
