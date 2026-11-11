
import { Form, Row, Col } from 'react-bootstrap';
import { comunasBiobio } from '../../data/comunasBiobio.js';

export default function DatosPersonales({ formData, onChange, modoOscuro }) {
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';

  return (
    <Row className="g-3">
      <Col md={4}>
        <Form.Group>
          <Form.Label className="fw-bold">RUT *</Form.Label>
          <Form.Control name="rut" value={formData.rut} onChange={onChange}
            placeholder="12345678-5" maxLength={12} required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={8}>
        <Form.Group>
          <Form.Label className="fw-bold">Nombre *</Form.Label>
          <Form.Control name="nombre" value={formData.nombre} onChange={onChange}
            placeholder="Nombre del propietario" required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Apellido paterno *</Form.Label>
          <Form.Control name="apellidoPaterno" value={formData.apellidoPaterno} onChange={onChange}
            placeholder="Apellido paterno" required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Apellido materno *</Form.Label>
          <Form.Control name="apellidoMaterno" value={formData.apellidoMaterno} onChange={onChange}
            placeholder="Apellido materno" required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Teléfono *</Form.Label>
          <Form.Control name="telefono" type="tel" value={formData.telefono}
            onChange={onChange} placeholder="912345678" required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Correo electrónico *</Form.Label>
          <Form.Control name="correo" type="email" value={formData.correo}
            onChange={onChange} placeholder="correo@ejemplo.cl" required className={controlClass} />
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Comuna — Región del Biobío *</Form.Label>
          <Form.Select name="comuna" value={formData.comuna} onChange={onChange}
            required className={controlClass}>
            <option value="">Seleccione una comuna...</option>
            {Object.entries(comunasBiobio).map(([provincia, comunas]) => (
              <optgroup key={provincia} label={`Provincia de ${provincia}`}>
                {comunas.map((comuna) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </optgroup>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group>
          <Form.Label className="fw-bold">Sector o barrio *</Form.Label>
          <Form.Control name="sector" value={formData.sector} onChange={onChange}
            placeholder="Ej: Villa San Pedro" required className={controlClass} />
        </Form.Group>
      </Col>
    </Row>
  );
}
