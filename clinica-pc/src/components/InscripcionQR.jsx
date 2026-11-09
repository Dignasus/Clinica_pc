import { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';

export default function InscripcionQR({ modoOscuro }) {
  const [formData, setFormData] = useState({
    rut: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    telefono: '', correo: '', comuna: '', sector: '',
    marcaEquipo: '', modeloEquipo: '', numeroSerie: '', diagnosticoPropietario: '',
    servicios: { formateo: false, mantencionFisica: false, mantencionLogica: false }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, servicios: { ...prev.servicios, [name]: checked } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Preinscripción guardada exitosamente.');
  };

  // Clases dinámicas según el tema
  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light border-secondary' : 'bg-white'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Formulario de Preinscripción (Vista Cliente)</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>Ingrese sus datos personales y los de su equipo para agilizar la recepción.</p>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className={cardClass}>
          <Card.Header className={headerClass}>1. Datos Personales</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label className="fw-bold">RUT *</Form.Label><Form.Control type="text" name="rut" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Nombre *</Form.Label><Form.Control type="text" name="nombre" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Apellido Paterno *</Form.Label><Form.Control type="text" name="apellidoPaterno" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Apellido Materno *</Form.Label><Form.Control type="text" name="apellidoMaterno" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Teléfono *</Form.Label><Form.Control type="tel" name="telefono" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Correo Electrónico *</Form.Label><Form.Control type="email" name="correo" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Comuna *</Form.Label><Form.Control type="text" name="comuna" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Sector *</Form.Label><Form.Control type="text" name="sector" required onChange={handleChange} /></Form.Group></Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>2. Datos del Equipo y Servicio</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Marca del Equipo *</Form.Label><Form.Control type="text" name="marcaEquipo" required onChange={handleChange} /></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Modelo *</Form.Label><Form.Control type="text" name="modeloEquipo" required onChange={handleChange} /></Form.Group></Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Número de Serie (Opcional)</Form.Label>
                  <Form.Control type="text" name="numeroSerie" onChange={handleChange} />
                  <Form.Text className={modoOscuro ? 'text-light fst-italic' : 'text-muted fst-italic'}>Nota: Si no lo conoce, déjelo en blanco.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}><Form.Group><Form.Label className="fw-bold">¿Qué problema presenta su equipo? *</Form.Label><Form.Control as="textarea" rows={3} name="diagnosticoPropietario" required onChange={handleChange} /></Form.Group></Col>
              <Col md={12}>
                <Form.Label className="fw-bold d-block">Servicio Requerido *</Form.Label>
                <div className="d-flex gap-4 mt-2">
                  <Form.Check type="checkbox" label="Formateo" name="formateo" onChange={handleChange} />
                  <Form.Check type="checkbox" label="Mantención Lógica" name="mantencionLogica" onChange={handleChange} />
                  <Form.Check type="checkbox" label="Mantención Física" name="mantencionFisica" onChange={handleChange} />
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" size="lg" variant={modoOscuro ? "light" : "danger"} className="fw-bold">Registrar Equipo</Button>
        </div>
      </Form>
    </>
  );
}