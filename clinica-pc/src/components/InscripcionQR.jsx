import { useState } from 'react';
import { Card, Form, Row, Col, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function InscripcionQR({ modoOscuro }) {
  const [formData, setFormData] = useState({
    rut: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
    telefono: '', correo: '', comuna: '', sector: '',
    marcaEquipo: '', modeloEquipo: '', numeroSerie: '', diagnosticoPropietario: '',
    servicios: { formateo: false, mantencionFisica: false, mantencionLogica: false },
    aceptaTerminos: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (['formateo', 'mantencionFisica', 'mantencionLogica'].includes(name)) {
        setFormData(prev => ({ ...prev, servicios: { ...prev.servicios, [name]: checked } }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Preinscripción guardada exitosamente. El cliente ha aceptado los términos legales.');
  };

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
              <Col md={6}><Form.Group><Form.Label className="fw-bold">RUT *</Form.Label><Form.Control type="text" name="rut" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Nombre *</Form.Label><Form.Control type="text" name="nombre" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Apellido Paterno *</Form.Label><Form.Control type="text" name="apellidoPaterno" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Apellido Materno *</Form.Label><Form.Control type="text" name="apellidoMaterno" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Teléfono *</Form.Label><Form.Control type="tel" name="telefono" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Correo Electrónico *</Form.Label><Form.Control type="email" name="correo" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Comuna *</Form.Label><Form.Control type="text" name="comuna" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Sector *</Form.Label><Form.Control type="text" name="sector" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>2. Datos del Equipo y Servicio</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Marca del Equipo *</Form.Label><Form.Control type="text" name="marcaEquipo" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={6}><Form.Group><Form.Label className="fw-bold">Modelo *</Form.Label><Form.Control type="text" name="modeloEquipo" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-bold">Número de Serie (Opcional)</Form.Label>
                  <Form.Control type="text" name="numeroSerie" onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''} />
                  <Form.Text className={modoOscuro ? 'text-light fst-italic' : 'text-muted fst-italic'}>Nota: Si no lo conoce, déjelo en blanco.</Form.Text>
                </Form.Group>
              </Col>
              <Col md={12}><Form.Group><Form.Label className="fw-bold">¿Qué problema presenta su equipo? *</Form.Label><Form.Control as="textarea" rows={3} name="diagnosticoPropietario" required onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''}/></Form.Group></Col>
              
              <Col md={12}>
                <Form.Label className="fw-bold d-block">Servicio Requerido *</Form.Label>
                <div className="d-flex flex-wrap gap-4 mt-2">
                  
                  <Form.Check 
                    type="checkbox" 
                    name="formateo" 
                    onChange={handleChange} 
                    label={
                      <span className="d-flex align-items-center">
                        Formateo
                        <OverlayTrigger placement="top" overlay={<Tooltip>Reinstalación del sistema desde cero. Elimina virus graves. <strong>Borra todos los archivos</strong> (requiere respaldo previo).</Tooltip>}>
                          <span className="ms-2 badge bg-secondary rounded-circle" style={{ cursor: 'help', fontSize: '0.65em' }}>?</span>
                        </OverlayTrigger>
                      </span>
                    } 
                  />
                  
                  <Form.Check 
                    type="checkbox" 
                    name="mantencionLogica" 
                    onChange={handleChange} 
                    label={
                      <span className="d-flex align-items-center">
                        Mantención Lógica
                        <OverlayTrigger placement="top" overlay={<Tooltip>Limpieza de software, eliminación de virus ligeros y optimización. <strong>Tus archivos no se borran.</strong></Tooltip>}>
                          <span className="ms-2 badge bg-secondary rounded-circle" style={{ cursor: 'help', fontSize: '0.65em' }}>?</span>
                        </OverlayTrigger>
                      </span>
                    } 
                  />
                  
                  <Form.Check 
                    type="checkbox" 
                    name="mantencionFisica" 
                    onChange={handleChange} 
                    label={
                      <span className="d-flex align-items-center">
                        Mantención Física
                        <OverlayTrigger placement="top" overlay={<Tooltip>Limpieza interna de polvo y cambio de pasta térmica. Ideal si tu equipo <strong>se calienta o hace mucho ruido</strong>.</Tooltip>}>
                          <span className="ms-2 badge bg-secondary rounded-circle" style={{ cursor: 'help', fontSize: '0.65em' }}>?</span>
                        </OverlayTrigger>
                      </span>
                    } 
                  />

                </div>
              </Col>

            </Row>
          </Card.Body>
        </Card>

        {/* 3. TÉRMINOS LEGALES */}
        <Card className={cardClass} border="danger">
          <Card.Header className={`fw-bold py-3 text-white`} style={{ backgroundColor: '#cc0000' }}>
            3. Términos y Condiciones Legales
          </Card.Header>
          <Card.Body className="p-4">
            <Alert variant={modoOscuro ? "dark" : "warning"} className={`mb-0 border-0 shadow-sm ${modoOscuro ? 'border-secondary text-light' : ''}`}>
              <Form.Check 
                type="checkbox" 
                id="aceptaTerminos" 
                name="aceptaTerminos" 
                required 
                onChange={handleChange}
                label={
                  <span className="ms-1">
                    Tomo conocimiento y acepto las condiciones del servicio. Autorizo el tratamiento de mis datos personales en conformidad a la <strong>Ley N° 21.719</strong> y eximo expresamente a <strong>Clínica del PC</strong> y a <strong>INACAP</strong> de cualquier responsabilidad frente a la eventual pérdida de información, programas o datos no respaldados por mí de forma previa a la entrega del equipo.
                  </span>
                }
              />
            </Alert>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" size="lg" variant={modoOscuro ? "light" : "danger"} className="fw-bold px-5">
            Registrar Equipo
          </Button>
        </div>
      </Form>
    </>
  );
}