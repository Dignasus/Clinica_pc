import { Col, Form, Row } from 'react-bootstrap';
import { REGIONES_CHILE, comunasDeRegion, encontrarRegionDeComuna } from '../../data/regionesChile.js';
import { LIMITES_REGISTRO } from '../../utils/validacionEntradas.js';

export default function DatosPersonales({ formData = {}, onChange, modoOscuro = false, errorCorreo = '' }) {
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  // Soporte de datos de prueba antiguos que solo tienen comuna.
  const regionElegida = formData.region || encontrarRegionDeComuna(formData.comuna);
  const comunas = comunasDeRegion(regionElegida);

  const cambiarRegion = (event) => {
    const region = event.target.value;
    // Mismo contrato de eventos que ya consume InscripcionQR / RegistroPresencial.
    onChange({ target: { name: 'region', value: region, type: 'select-one' } });
    onChange({ target: { name: 'comuna', value: '', type: 'select-one' } });
  };

  return (
    <Row className="g-3">
      <Col md={4}>
        <Form.Group controlId="propietario-rut">
          <Form.Label className="fw-bold">RUT *</Form.Label>
          <Form.Control name="rut" maxLength={LIMITES_REGISTRO.rut} value={formData.rut || ''} onChange={onChange}
            placeholder="12345678-5" required className={controlClass} />
        </Form.Group>
      </Col>
      <Col md={8}>
        <Form.Group controlId="propietario-nombre">
          <Form.Label className="fw-bold">Nombre *</Form.Label>
          <Form.Control name="nombre" maxLength={LIMITES_REGISTRO.nombre} value={formData.nombre || ''} onChange={onChange}
            placeholder="Nombre del propietario" required className={controlClass} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-paterno">
          <Form.Label className="fw-bold">Apellido paterno *</Form.Label>
          <Form.Control name="apellidoPaterno" maxLength={LIMITES_REGISTRO.apellidoPaterno} value={formData.apellidoPaterno || ''}
            onChange={onChange} placeholder="Apellido paterno" required className={controlClass} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-materno">
          <Form.Label className="fw-bold">Apellido materno *</Form.Label>
          <Form.Control name="apellidoMaterno" maxLength={LIMITES_REGISTRO.apellidoMaterno} value={formData.apellidoMaterno || ''}
            onChange={onChange} placeholder="Apellido materno" required className={controlClass} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-telefono">
          <Form.Label className="fw-bold">Teléfono *</Form.Label>
          <Form.Control name="telefono" maxLength={LIMITES_REGISTRO.telefono} type="tel" value={formData.telefono || ''}
            onChange={onChange} placeholder="912345678" required className={controlClass} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-correo">
          <Form.Label className="fw-bold">Correo electrónico *</Form.Label>
          <Form.Control name="correo" maxLength={LIMITES_REGISTRO.correo} type="email" value={formData.correo || ''}
            onChange={onChange} placeholder="ejemplo@correo.cl" required className={controlClass}
            isInvalid={Boolean(errorCorreo)} aria-describedby={errorCorreo ? 'error-correo-propietario' : undefined} />
          {errorCorreo && (
            <Form.Control.Feedback type="invalid" id="error-correo-propietario" role="alert">
              {errorCorreo}
            </Form.Control.Feedback>
          )}
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-region">
          <Form.Label className="fw-bold">Región *</Form.Label>
          <Form.Select name="region" value={regionElegida} onChange={cambiarRegion}
            className={controlClass} required>
            <option value="">Seleccione una región...</option>
            {REGIONES_CHILE.map((r) => (
              <option key={r.codigo} value={r.nombre}>{r.nombre}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="propietario-comuna">
          <Form.Label className="fw-bold">Comuna *</Form.Label>
          <Form.Select name="comuna" value={comunas.includes(formData.comuna) ? formData.comuna : ''}
            onChange={onChange} className={controlClass} required disabled={!regionElegida}>
            <option value="">{regionElegida ? 'Seleccione una comuna...' : 'Primero seleccione región...'}</option>
            {comunas.map((comuna) => (
              <option key={comuna} value={comuna}>{comuna}</option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>
      <Col xs={12}>
        <Form.Group controlId="propietario-sector">
          <Form.Label className="fw-bold">Sector o barrio *</Form.Label>
          <Form.Control name="sector" maxLength={LIMITES_REGISTRO.sector} value={formData.sector || ''} onChange={onChange}
            placeholder="Ej.: Villa San Pedro" required className={controlClass} />
        </Form.Group>
      </Col>
    </Row>
  );
}
