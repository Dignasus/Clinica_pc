import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Navbar, Form, Button, Badge } from 'react-bootstrap';
import InscripcionQR from '../components/InscripcionQR';
import RecepcionEquipos from '../components/RecepcionEquipos';
import PanelTecnico from '../components/PanelTecnico';
import HistorialConsultas from '../components/HistorialConsultas';
import ParametrosMantenedores from '../components/ParametrosMantenedores';
import logoInacap from '../assets/logo-inacap.png';

export default function PanelSuperusuario() {
  const [vistaActiva, setVistaActiva] = useState('recepcion');
  const [periodoGlobal, setPeriodoGlobal] = useState('Otoño 2026');
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('authToken');
    navigate('/');
  };

  const renderizarContenido = () => {
    switch (vistaActiva) {
      case 'inscripcion': return <InscripcionQR />;
      case 'recepcion': return <RecepcionEquipos />;
      case 'tecnico': return <PanelTecnico />;
      case 'historial': return <HistorialConsultas />;
      case 'parametros': return <ParametrosMantenedores />;
      default: return <div>Seleccione una fase</div>;
    }
  };

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      <Row className="flex-nowrap h-100 g-0">
        
        {/* Barra Lateral */}
        <Col xs="auto" md={3} lg={2} className="d-flex flex-column" style={{ backgroundColor: '#333333' }}>
          <div className="p-4 text-center bg-white" style={{ borderBottom: '4px solid #cc0000' }}>
            <img src={logoInacap} alt="Logo INACAP" className="img-fluid mb-3" style={{ maxWidth: '85%' }} />
            <h5 className="fw-bold mb-1" style={{ color: '#cc0000' }}>Clínica del PC</h5>
            <Badge bg="secondary" className="fw-normal">Superusuario</Badge>
          </div>

          <Nav variant="pills" className="flex-column mt-4 px-2">
            <p className="text-secondary small fw-bold px-3 mb-2">FASES DEL SERVICIO</p>
            <Nav.Item>
              <Nav.Link 
                active={vistaActiva === 'inscripcion'} 
                onClick={() => setVistaActiva('inscripcion')}
                className={vistaActiva === 'inscripcion' ? 'bg-light text-dark fw-bold border-start border-danger border-4 rounded-0' : 'text-light'}
              >
                1. Inscripción (QR)
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={vistaActiva === 'recepcion'} 
                onClick={() => setVistaActiva('recepcion')}
                className={vistaActiva === 'recepcion' ? 'bg-light text-dark fw-bold border-start border-danger border-4 rounded-0' : 'text-light'}
              >
                2. Recepción de Equipos
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={vistaActiva === 'tecnico'} 
                onClick={() => setVistaActiva('tecnico')}
                className={vistaActiva === 'tecnico' ? 'bg-light text-dark fw-bold border-start border-danger border-4 rounded-0' : 'text-light'}
              >
                3. Panel Técnico
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={vistaActiva === 'historial'} 
                onClick={() => setVistaActiva('historial')}
                className={vistaActiva === 'historial' ? 'bg-light text-dark fw-bold border-start border-danger border-4 rounded-0' : 'text-light'}
              >
                4. Historial y Consultas
              </Nav.Link>
            </Nav.Item>

            <p className="text-secondary small fw-bold px-3 mb-2 mt-4">ADMINISTRACIÓN</p>
            <Nav.Item>
              <Nav.Link 
                active={vistaActiva === 'parametros'} 
                onClick={() => setVistaActiva('parametros')}
                className={vistaActiva === 'parametros' ? 'bg-light text-dark fw-bold border-start border-danger border-4 rounded-0' : 'text-light'}
              >
                Parámetros y Mantenedores
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>

        {/* Contenido Principal */}
        <Col className="d-flex flex-column p-0" style={{ backgroundColor: '#f4f4f4' }}>
          
          {/* Cabecera Superior */}
          <Navbar bg="white" className="px-4 py-3 shadow-sm justify-content-between">
            <Form className="d-flex align-items-center">
              <Form.Label className="fw-bold text-dark me-3 mb-0">Período Activo:</Form.Label>
              <Form.Select 
                value={periodoGlobal} 
                onChange={(e) => setPeriodoGlobal(e.target.value)}
                className="w-auto shadow-none border-secondary"
              >
                <option value="Otoño 2026">Otoño 2026</option>
                <option value="Primavera 2026">Primavera 2026</option>
                <option value="Otoño 2025">Otoño 2025</option>
                <option value="Todos">Todos los períodos</option>
              </Form.Select>
            </Form>
            <Button variant="dark" onClick={handleLogout} className="fw-bold px-4">
              Cerrar Sesión
            </Button>
          </Navbar>

          {/* Área Dinámica */}
          <div className="p-4 overflow-auto flex-grow-1">
            {renderizarContenido()}
          </div>
        </Col>

      </Row>
    </Container>
  );
}