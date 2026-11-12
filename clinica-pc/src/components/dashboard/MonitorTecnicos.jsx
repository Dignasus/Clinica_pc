export default function MonitorTecnicos({ modoOscuro, tecnicos }) {
  return (
    <section
      aria-labelledby="monitor-tecnicos-title"
      className={`rounded-2xl p-6 ring-1 ring-inset sm:p-8 ${
        modoOscuro
          ? 'bg-zinc-900 ring-zinc-800'
          : 'bg-inacap-white ring-zinc-200'
      }`}
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-0 text-xs font-semibold uppercase tracking-[0.16em] text-inacap-red">
            Equipo de trabajo
          </p>
          <h2 id="monitor-tecnicos-title" className={`!mb-0 !mt-2 !text-xl !font-semibold !tracking-tight ${modoOscuro ? 'text-zinc-100' : 'text-zinc-900'}`}>
            Estado Actual de Técnicos
          </h2>
        </div>
        <span className={`text-xs ${modoOscuro ? 'text-zinc-500' : 'text-zinc-500'}`}>
          {tecnicos.length} integrantes
        </span>
      </header>

      <div role="list" className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
        {tecnicos.map(({ nombre, estado }) => {
          const disponible = ['Disponible', 'Sin tareas registradas'].includes(estado);

          return (
            <div
              key={nombre}
              role="listitem"
              className={`flex min-h-20 items-center justify-between gap-6 rounded-xl px-6 py-4 ${
                modoOscuro ? 'bg-zinc-800/70' : 'bg-zinc-50'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${modoOscuro ? 'bg-zinc-700 text-zinc-200' : 'bg-white text-inacap-gray ring-1 ring-inset ring-zinc-200'}`} aria-hidden="true">
                  {nombre.charAt(0)}
                </span>
                <span className={`truncate text-sm font-semibold ${modoOscuro ? 'text-zinc-100' : 'text-zinc-800'}`}>
                  {nombre}
                </span>
              </div>

              <span className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium ${
                disponible
                  ? modoOscuro
                    ? 'bg-emerald-950 text-emerald-300'
                    : 'bg-emerald-50 text-emerald-800'
                  : modoOscuro
                    ? 'bg-amber-950 text-amber-300'
                    : 'bg-amber-50 text-amber-800'
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${disponible ? 'bg-emerald-500' : 'bg-amber-500'}`} aria-hidden="true" />
                {estado}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
