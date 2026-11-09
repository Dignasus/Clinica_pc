import { Card, Form, Row, Col, Button } from 'react-bootstrap';

export default function ParametrosMantenedores() {
  const handleCrearJornada = (e) => {
    e.preventDefault();
    alert('Jornada creada exitosamente.');
  };

  const handleCargaMasiva = (e) => {
    e.preventDefault();
    alert('Archivo procesado correctamente.');
  };

  const handleCrearChecklist = (e) => {
    e.preventDefault();
    alert('Ítem agregado al checklist.');
  };

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: '#cc0000', fontWeight: 'bold' }}>Parámetros y Mantenedores</h3>
        <p className="text-muted">Módulo de administración del sistema para configurar jornadas, personal y servicios.</p>
      </div>

      <Row className="g-4">
        {/* 1. Gestión de Jornadas */}
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold py-3 border-bottom-0">1. Creación de Jornada de Clínica</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCrearJornada}>
                <Row className="g-3 align-items-end">
                  <Col md={5}>
                    <Form.Group controlId="periodo">
                      <Form.Label className="fw-bold">Período Académico *</Form.Label>
                      <Form.Control type="text" placeholder="Ej: Otoño 2026" required />
                    </Form.Group>
                  </Col>
                  <Col md={5}>
                    <Form.Group controlId="fecha">
                      <Form.Label className="fw-bold">Fecha de Ejecución *</Form.Label>
                      <Form.Control type="date" required />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button variant="danger" type="submit" className="fw-bold">Registrar</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* 2. Carga Masiva de Personal */}
        <Col lg={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white fw-bold py-3 border-bottom-0">2. Carga Masiva de Usuarios (Técnicos, Profesores)</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCargaMasiva}>
                <Row className="g-3 align-items-end">
                  <Col md={10}>
                    <Form.Group controlId="archivoExcel">
                      <Form.Label className="fw-bold">Subir base de datos (Formato CSV o Excel) *</Form.Label>
                      <Form.Control type="file" accept=".csv, .xlsx, .xls" required />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button variant="dark" type="submit" className="fw-bold">Procesar</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* 3. Gestión de Checklists Dinámicos */}
        <Col lg={12}>
          <Card className="shadow-sm border-0 mb-5">
            <Card.Header className="bg-white fw-bold py-3 border-bottom-0">3. Mantenedor de Checklists Dinámicos</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCrearChecklist}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group controlId="servicioConfig">
                      <Form.Label className="fw-bold">Tipo de Servicio *</Form.Label>
                      <Form.Select required>
                        <option value="">Seleccione el servicio...</option>
                        <option value="formateo">Formateo</option>
                        <option value="fisica">Mantención Física</option>
                        <option value="logica">Mantención Lógica</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="nuevaTarea">
                      <Form.Label className="fw-bold">Nueva Tarea a Evaluar *</Form.Label>
                      <Form.Control type="text" placeholder="Ej: Revisar estado térmico del procesador" required />
                    </Form.Group>
                  </Col>
                  <Col md={2} className="d-grid">
                    <Button variant="danger" type="submit" className="fw-bold">Agregar Ítem</Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}