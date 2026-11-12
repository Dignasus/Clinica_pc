const trazos = {
  equipo: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  clipboard: <><rect x="5" y="5" width="14" height="16" rx="2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></>,
  herramienta: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18a2.1 2.1 0 0 0 3 3l5.3-5.3a5 5 0 0 0 6.4-6.4l-3 3-3-3 3-3Z" /></>,
  reloj: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  entrega: <><path d="M3 7 12 3l9 4v10l-9 4-9-4V7Z" /><path d="m3 7 9 4 9-4M12 11v10m3-9 2 2 4-4" /></>,
};

export default function DashboardMetricCard({
  modoOscuro, titulo, valor, icono = 'equipo', descripcion = '', tono = 'rojo', destacado = false,
}) {
  return (
    <article className={`pc-metrica pc-metrica--${tono} ${destacado ? 'pc-metrica--destacada' : ''} ${modoOscuro ? 'pc-metrica--oscura' : ''}`}>
      <div className="pc-metrica__superior">
        <h3>{titulo}</h3>
        <span className="pc-metrica__icono" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            {trazos[icono] || trazos.equipo}
          </svg>
        </span>
      </div>
      <div className="pc-metrica__inferior">
        <strong className="pc-metrica__valor">{valor}</strong>
        {descripcion && <p className="pc-metrica__descripcion">{descripcion}</p>}
      </div>
    </article>
  );
}
