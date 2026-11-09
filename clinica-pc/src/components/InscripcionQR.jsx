import { useState } from 'react';
import { Card, Form, Row, Col, Button } from 'react-bootstrap';

export default function InscripcionQR() {
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
    console.log('Datos enviados:', formData);
    alert('Preinscripción guardada exitosamente.');
  };

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: '#cc0000', fontWeight: 'bold' }}>Formulario de Preinscripción (Vista Cliente)</h3>
        <p className="text-muted">Ingrese sus datos personales y los de su equipo para agilizar la recepción.</p>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white fw-bold py-3">1. Datos Personales</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="rut">
                  <Form.Label className="fw-bold">RUT *</Form.Label>
                  <Form.Control type="text" name="rut" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="nombre">
                  <Form.Label className="fw-bold">Nombre *</Form.Label>
                  <Form.Control type="text" name="nombre" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="apellidoPaterno">
                  <Form.Label className="fw-bold">Apellido Paterno *</Form.Label>
                  <Form.Control type="text" name="apellidoPaterno" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="apellidoMaterno">
                  <Form.Label className="fw-bold">Apellido Materno *</Form.Label>
                  <Form.Control type="text" name="apellidoMaterno" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="telefono">
                  <Form.Label className="fw-bold">Teléfono *</Form.Label>
                  <Form.Control type="tel" name="telefono" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="correo">
                  <Form.Label className="fw-bold">Correo Electrónico *</Form.Label>
                  <Form.Control type="email" name="correo" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="comuna">
                  <Form.Label className="fw-bold">Comuna *</Form.Label>
                  <Form.Control type="text" name="comuna" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="sector">
                  <Form.Label className="fw-bold">Sector *</Form.Label>
                  <Form.Control type="text" name="sector" required onChange={handleChange} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow-sm border-0 mb-4">
          <Card.Header className="bg-white fw-bold py-3">2. Datos del Equipo y Servicio</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="marcaEquipo">
                  <Form.Label className="fw-bold">Marca del Equipo *</Form.Label>
                  <Form.Control type="text" name="marcaEquipo" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="modeloEquipo">
                  <Form.Label className="fw-bold">Modelo *</Form.Label>
                  <Form.Control type="text" name="modeloEquipo" required onChange={handleChange} />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="numeroSerie">
                  <Form.Label className="fw-bold">Número de Serie (Opcional)</Form.Label>
                  <Form.Control type="text" name="numeroSerie" onChange={handleChange} />
                  <Form.Text className="text-muted fst-italic">
                    Nota: Si no conoce o no encuentra el número de serie, déjelo en blanco. El técnico lo registrará al recibir el equipo.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="diagnosticoPropietario">
                  <Form.Label className="fw-bold">¿Qué problema presenta su equipo? *</Form.Label>
                  <Form.Control as="textarea" rows={3} name="diagnosticoPropietario" required onChange={handleChange} />
                </Form.Group>
              </Col>
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
          <Button type="submit" size="lg" style={{ backgroundColor: '#cc0000', borderColor: '#cc0000' }}>
            Registrar Equipo
          </Button>
        </div>
      </Form>
    </>
  );
}