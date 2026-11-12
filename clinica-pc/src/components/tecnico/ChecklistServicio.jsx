import { Form, Alert } from 'react-bootstrap';

export default function ChecklistServicio({
  servicio, items, respuestas, onCambiar,
}) {
  return (
    <section className="pc-tech-checklist">
      <div className="pc-tech-checklist-heading">
        <div>
          <span className="pc-tech-kicker">SERVICIO</span>
          <h3>{servicio.nombre}</h3>
        </div>
        <span className="pc-tech-checklist-count">{items.length} {items.length === 1 ? 'tarea' : 'tareas'}</span>
      </div>

      {items.length === 0 && (
        <Alert variant="warning">Este servicio no tiene tareas configuradas. Agrégalas en Mantenedores.</Alert>
      )}

      {items.map((item, indice) => {
        const clave = `${servicio.id}:${item.id}`;
        const respuesta = respuestas[clave] || {};
        return (
          <div key={item.id} className="pc-tech-task">
            <div className="pc-tech-task-name">
              <span className="pc-tech-task-index">{String(indice + 1).padStart(2, '0')}</span>
              <strong>{item.descripcion}</strong>
            </div>
            <div className="pc-tech-task-fields">
              <Form.Group>
                <Form.Label>Resultado *</Form.Label>
                <Form.Select
                  aria-label={`Resultado: ${item.descripcion}`}
                  value={respuesta.estado || ''}
                  onChange={(e) => onCambiar(clave, 'estado', e.target.value)}
                  className="pc-tech-control"
                  required
                >
                  <option value="">Seleccione resultado...</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No aplica">No aplica</option>
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Observación {respuesta.estado === 'No' ? '*' : '(opcional)'}</Form.Label>
                <Form.Control
                  type="text"
                  aria-label={`Observación: ${item.descripcion}`}
                  value={respuesta.observacion || ''}
                  onChange={(e) => onCambiar(clave, 'observacion', e.target.value)}
                  placeholder="Observación técnica..."
                  maxLength={500}
                  required={respuesta.estado === 'No'}
                  className="pc-tech-control"
                />
              </Form.Group>
            </div>
          </div>
        );
      })}
    </section>
  );
}
