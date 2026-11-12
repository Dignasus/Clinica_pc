import { Alert, Form } from 'react-bootstrap';

export default function SeleccionServicios({
  servicios, seleccionados, solicitados, motivo, onToggle, onMotivo,
}) {
  const nombre = (id) => servicios.find((s) => s.id === id)?.nombre || id;
  const cambio = seleccionados.length !== solicitados.length ||
    seleccionados.some((id) => !solicitados.includes(id));

  return (
    <div className="pc-tech-services">
      <div className="pc-tech-note">
        <span className="pc-tech-kicker">SOLICITUD ORIGINAL</span>
        <p>Servicios solicitados inicialmente: <strong>{solicitados.map(nombre).join(', ') || 'Ninguno'}</strong>.</p>
        <small>El técnico puede agregar o retirar servicios según su evaluación.</small>
      </div>
      <div className="pc-tech-service-grid">
        {servicios.map((servicio) => {
          const elegido = seleccionados.includes(servicio.id);
          return (
            <div key={servicio.id} className={`pc-tech-service-option${elegido ? ' is-selected' : ''}`}>
              <Form.Check
                type="checkbox"
                id={`servicio-tecnico-${servicio.id}`}
                label={servicio.nombre}
                checked={elegido}
                onChange={(e) => onToggle(servicio.id, e.target.checked)}
              />
              {solicitados.includes(servicio.id) && <small>Solicitado inicialmente</small>}
            </div>
          );
        })}
      </div>
      {cambio && (
        <Alert variant="warning" className="pc-tech-change-alert mt-3 mb-0">
          <Form.Group controlId="pc-tech-motivo-servicios">
            <Form.Label className="fw-bold">Motivo del cambio de servicios *</Form.Label>
            <Form.Control as="textarea" rows={2} maxLength={600} required
              className="pc-tech-control" value={motivo}
              onChange={(e) => onMotivo(e.target.value)}
              placeholder="Ej.: el diagnóstico inicial mostró que también se requiere mantención física." />
          </Form.Group>
        </Alert>
      )}
      {seleccionados.length === 0 && (
        <Alert variant="danger" className="mt-3 mb-0">Selecciona al menos un servicio para continuar.</Alert>
      )}
    </div>
  );
}
