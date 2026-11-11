
import { Form, Alert } from 'react-bootstrap';

export default function ChecklistServicio({
  servicio, items, respuestas, onCambiar, modoOscuro,
}) {
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';

  return (
    <section className={`border rounded-3 p-3 mb-3 ${modoOscuro ? 'border-secondary' : ''}`}>
      <h5 className="fw-bold mb-3">{servicio.nombre}</h5>

      {items.length === 0 && (
        <Alert variant="warning">
          Este servicio no tiene tareas configuradas. Agrégalas en Mantenedores.
        </Alert>
      )}

      {items.map((item, indice) => {
        const clave = `${servicio.id}:${item.id}`;
        const respuesta = respuestas[clave] || {};

        return (
          <div key={item.id} className="border-bottom pb-3 mb-3">
            <p className="fw-semibold mb-2">{indice + 1}. {item.descripcion}</p>

            <div className="row g-2">
              <div className="col-md-4">
                <Form.Select
                  aria-label={`Resultado: ${item.descripcion}`}
                  value={respuesta.estado || ''}
                  onChange={(e) => onCambiar(clave, 'estado', e.target.value)}
                  className={controlClass}
                  required
                >
                  <option value="">Seleccione resultado...</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="No aplica">No aplica</option>
                </Form.Select>
              </div>

              <div className="col-md-8">
                <Form.Control
                  type="text"
                  aria-label={`Observación: ${item.descripcion}`}
                  value={respuesta.observacion || ''}
                  onChange={(e) => onCambiar(clave, 'observacion', e.target.value)}
                  placeholder="Observación técnica..."
                  maxLength={500}
                  required={respuesta.estado === 'No'}
                  className={controlClass}
                />
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
