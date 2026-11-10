import { Card, Row, Col, Badge } from 'react-bootstrap';

export default function InicioDashboard({ modoOscuro, rolUsuario, nombreUsuario }) {
  const cardClass = `shadow-sm border-0 h-100 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Panel Principal</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Bienvenido/a, <strong>{nombreUsuario}</strong>. Aquí tienes un resumen de la jornada actual.
        </p>
      </div>

      <Row className="g-4 mb-4">
        {['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario) && (
          <Col md={4}>
            <Card className={cardClass} border="start" style={{ borderLeftColor: '#cc0000', borderLeftWidth: '4px' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2">Equipos en Taller</h6>
                <h2 className="fw-bold mb-0">12</h2>
              </Card.Body>
            </Card>
          </Col>
        )}

        {['superusuario', 'recepcionista'].includes(rolUsuario) && (
          <Col md={4}>
            <Card className={cardClass} border="start" style={{ borderLeftColor: '#ffc107', borderLeftWidth: '4px' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2">Preinscripciones Pendientes</h6>
                <h2 className="fw-bold mb-0">5</h2>
              </Card.Body>
            </Card>
          </Col>
        )}

        {['superusuario', 'tecnico'].includes(rolUsuario) && (
          <Col md={4}>
            <Card className={cardClass} border="start" style={{ borderLeftColor: '#198754', borderLeftWidth: '4px' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2">Tus Tareas Asignadas</h6>
                <h2 className="fw-bold mb-0">3</h2>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {['superusuario', 'recepcionista'].includes(rolUsuario) && (
        <Card className={`shadow-sm border-0 ${modoOscuro ? 'bg-dark text-light' : ''}`}>
          <Card.Header className={`fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`}>
            Estado Actual de Técnicos
          </Card.Header>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span>Matías Carrasco</span>
              <Badge bg="success">Disponible</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
              <span>Cristian</span>
              <Badge bg="warning" text="dark">Ocupado (En revisión)</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <span>Camila Rojas</span>
              <Badge bg="success">Disponible</Badge>
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );
}