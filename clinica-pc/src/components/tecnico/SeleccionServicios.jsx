import { Alert, Form } from 'react-bootstrap';

export default function SeleccionServicios({ servicios, seleccionados, solicitados, motivo, onToggle, onMotivo, modoOscuro }) {
  const nombre = (id) => servicios.find((s) => s.id === id)?.nombre || id;
  const cambio = seleccionados.length !== solicitados.length ||
    seleccionados.some((id) => !solicitados.includes(id));

  return (
    <>
      <p className={modoOscuro ? 'text-light' : 'text-muted'}>
        Servicios solicitados inicialmente: <strong>{solicitados.map(nombre).join(', ') || 'Ninguno'}</strong>.
        El técnico puede agregar o retirar servicios según su evaluación.
      </p>
      <div className="row g-2">
        {servicios.map((servicio) => (
          <div className="col-sm-6" key={servicio.id}>
            <div className={`rounded-3 border p-3 h-100 ${modoOscuro ? 'border-secondary' : ''}`}>
              <Form.Check type="checkbox" id={`servicio-tecnico-${servicio.id}`}
                label={servicio.nombre} checked={seleccionados.includes(servicio.id)}
                onChange={(e) => onToggle(servicio.id, e.target.checked)} />
            </div>
          </div>
        ))}
      </div>
      {cambio && (
        <Alert variant="warning" className="mt-3 mb-0">
          <Form.Label className="fw-bold">Motivo del cambio de servicios *</Form.Label>
          <Form.Control as="textarea" rows={2} maxLength={600} required
            className={modoOscuro ? 'bg-dark text-light' : ''}
            value={motivo} onChange={(e) => onMotivo(e.target.value)}
            placeholder="Ej.: el diagnóstico inicial mostró que también se requiere mantención física." />
        </Alert>
      )}
      {seleccionados.length === 0 && (
        <Alert variant="danger" className="mt-3 mb-0">Selecciona al menos un servicio para continuar.</Alert>
      )}
    </>
  );
}
