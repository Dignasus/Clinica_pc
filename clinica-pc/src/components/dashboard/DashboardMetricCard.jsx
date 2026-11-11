export default function DashboardMetricCard({ modoOscuro, titulo, valor }) {
  return (
    <article
      className={`flex min-h-44 flex-col justify-between rounded-2xl p-6 ring-1 ring-inset ${
        modoOscuro
          ? 'bg-zinc-900 ring-zinc-800'
          : 'bg-inacap-white ring-zinc-200'
      }`}
    >
      <div className="flex items-start justify-between gap-6">
        <h2 className={`!mb-0 !text-sm !font-semibold !leading-6 ${modoOscuro ? 'text-zinc-300' : 'text-inacap-gray'}`}>
          {titulo}
        </h2>
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-inacap-red" aria-hidden="true" />
      </div>

      <p className={`mb-0 text-5xl font-semibold leading-none tracking-tight ${modoOscuro ? 'text-white' : 'text-zinc-950'}`}>
        {valor}
      </p>
    </article>
  );
}
