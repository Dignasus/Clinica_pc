import { Card, Form, Row, Col, Button } from 'react-bootstrap';

export default function ParametrosMantenedores({ modoOscuro }) {
  const handleCrearJornada = (e) => { e.preventDefault(); alert('Jornada creada exitosamente.'); };
  const handleCargaMasiva = (e) => { e.preventDefault(); alert('Archivo procesado correctamente.'); };
  const handleCrearChecklist = (e) => { e.preventDefault(); alert('Ítem agregado al checklist.'); };

  const cardClass = `shadow-sm border-0 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 border-bottom-0 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Parámetros y Mantenedores</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>Módulo de administración del sistema para configurar jornadas, personal y servicios.</p>
      </div>

      <Row className="g-4">
        <Col lg={12}>
          <Card className={cardClass}>
            <Card.Header className={headerClass}>1. Creación de Jornada de Clínica</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCrearJornada}>
                <Row className="g-3 align-items-end">
                  <Col md={5}><Form.Group><Form.Label className="fw-bold mt-3">Período Académico *</Form.Label><Form.Control type="text" placeholder="Ej: Otoño 2026" required className={modoOscuro ? 'bg-dark text-light' : ''} /></Form.Group></Col>
                  <Col md={5}><Form.Group><Form.Label className="fw-bold">Fecha de Ejecución *</Form.Label><Form.Control type="date" required className={modoOscuro ? 'bg-dark text-light' : ''} /></Form.Group></Col>
                  <Col md={2} className="d-grid"><Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold">Registrar</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className={cardClass}>
            <Card.Header className={headerClass}>2. Carga Masiva de Usuarios (Técnicos, Profesores)</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCargaMasiva}>
                <Row className="g-3 align-items-end">
                  <Col md={10}><Form.Group><Form.Label className="fw-bold mt-3">Subir base de datos (Formato CSV o Excel) *</Form.Label><Form.Control type="file" accept=".csv, .xlsx, .xls" required className={modoOscuro ? 'bg-dark text-light' : ''} /></Form.Group></Col>
                  <Col md={2} className="d-grid"><Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold">Procesar</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={12}>
          <Card className={`${cardClass} mb-5`}>
            <Card.Header className={headerClass}>3. Mantenedor de Checklists Dinámicos</Card.Header>
            <Card.Body className="p-4 pt-0">
              <Form onSubmit={handleCrearChecklist}>
                <Row className="g-3 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold mt-3">Tipo de Servicio *</Form.Label>
                      <Form.Select required className={modoOscuro ? 'bg-dark text-light' : ''}>
                        <option value="">Seleccione el servicio...</option>
                        <option value="formateo">Formateo</option>
                        <option value="fisica">Mantención Física</option>
                        <option value="logica">Mantención Lógica</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}><Form.Group><Form.Label className="fw-bold">Nueva Tarea a Evaluar *</Form.Label><Form.Control type="text" placeholder="Ej: Revisar estado térmico" required className={modoOscuro ? 'bg-dark text-light' : ''} /></Form.Group></Col>
                  <Col md={2} className="d-grid"><Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold">Agregar Ítem</Button></Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}