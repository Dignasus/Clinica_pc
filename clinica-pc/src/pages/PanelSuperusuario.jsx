import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Nav, Navbar, Form, Button } from 'react-bootstrap';
import InicioDashboard from '../components/InicioDashboard';
import InscripcionQR from '../components/InscripcionQR';
import RecepcionEquipos from '../components/RecepcionEquipos';
import PanelTecnico from '../components/PanelTecnico';
import HistorialConsultas from '../components/HistorialConsultas';
import ParametrosMantenedores from '../components/ParametrosMantenedores';
import logoInacap from '../assets/logo-inacap.png';

export default function PanelSuperusuario() {
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [vistaActiva, setVistaActiva] = useState('');
  const [periodoGlobal, setPeriodoGlobal] = useState('Otoño 2026');
  const [modoOscuro, setModoOscuro] = useState(false);

  // Validación de seguridad al entrar al panel
  useEffect(() => {
    const rol = sessionStorage.getItem('userRol');
    const nombre = sessionStorage.getItem('userNombre');
    
    if (!rol) {
      navigate('/');
      return;
    }
    
    setRolUsuario(rol);
    setNombreUsuario(nombre);

    // Asignación de pantalla por defecto según rol
    if (rol === 'cliente') setVistaActiva('inscripcion');
    else setVistaActiva('inicio');
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const renderizarContenido = () => {
    switch (vistaActiva) {
      case 'inicio': return <InicioDashboard modoOscuro={modoOscuro} rolUsuario={rolUsuario} nombreUsuario={nombreUsuario} />;
      case 'inscripcion': return <InscripcionQR modoOscuro={modoOscuro} />;
      case 'recepcion': return <RecepcionEquipos modoOscuro={modoOscuro} />;
      case 'tecnico': return <PanelTecnico modoOscuro={modoOscuro} />;
      case 'historial': return <HistorialConsultas modoOscuro={modoOscuro} periodoGlobal={periodoGlobal} />;
      case 'parametros': return <ParametrosMantenedores modoOscuro={modoOscuro} />;
      default: return <div>Seleccione una fase</div>;
    }
  };

  const toggleTema = () => setModoOscuro(!modoOscuro);

  // Permisos dinámicos para mostrar u ocultar menús laterales
  const puedeVerInicio = ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario);
  const puedeVerInscripcion = ['superusuario', 'cliente', 'recepcionista'].includes(rolUsuario);
  const puedeVerRecepcion = ['superusuario', 'recepcionista'].includes(rolUsuario);
  const puedeVerTecnico = ['superusuario', 'tecnico'].includes(rolUsuario);
  const puedeVerHistorial = ['superusuario', 'recepcionista', 'tecnico'].includes(rolUsuario);
  const puedeVerParametros = ['superusuario'].includes(rolUsuario);

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0" data-bs-theme={modoOscuro ? 'dark' : 'light'}>
      <Row className="flex-nowrap h-100 g-0">
        
        {/* Barra Lateral Dinámica */}
        <Col xs="auto" md={3} lg={2} className="d-flex flex-column border-end" style={{ backgroundColor: modoOscuro ? '#212529' : '#333333' }}>
          <div className="p-4 text-center" style={{ backgroundColor: modoOscuro ? '#1a1d20' : '#ffffff', borderBottom: '4px solid #cc0000' }}>
            <img src={logoInacap} alt="Logo INACAP" className="img-fluid mb-3" style={{ maxWidth: '85%' }} />
            {/* Solo mostramos el nombre del usuario logueado */}
            <h6 className="fw-bold mb-0" style={{ color: '#cc0000' }}>{nombreUsuario}</h6>
          </div>

          <Nav variant="pills" className="flex-column mt-4 px-2">
            
            {puedeVerInicio && (
              <Nav.Item className="mb-3">
                <Nav.Link active={vistaActiva === 'inicio'} onClick={() => setVistaActiva('inicio')} className={vistaActiva === 'inicio' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                  🏠 Inicio
                </Nav.Link>
              </Nav.Item>
            )}

            <p className="text-secondary small fw-bold px-3 mb-2">FASES DEL SERVICIO</p>
            
            {puedeVerInscripcion && (
              <Nav.Item>
                <Nav.Link active={vistaActiva === 'inscripcion'} onClick={() => setVistaActiva('inscripcion')} className={vistaActiva === 'inscripcion' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                  1. Inscripción (QR)
                </Nav.Link>
              </Nav.Item>
            )}

            {puedeVerRecepcion && (
              <Nav.Item>
                <Nav.Link active={vistaActiva === 'recepcion'} onClick={() => setVistaActiva('recepcion')} className={vistaActiva === 'recepcion' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                  2. Recepción de Equipos
                </Nav.Link>
              </Nav.Item>
            )}

            {puedeVerTecnico && (
              <Nav.Item>
                <Nav.Link active={vistaActiva === 'tecnico'} onClick={() => setVistaActiva('tecnico')} className={vistaActiva === 'tecnico' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                  3. Panel Técnico
                </Nav.Link>
              </Nav.Item>
            )}

            {puedeVerHistorial && (
              <Nav.Item>
                <Nav.Link active={vistaActiva === 'historial'} onClick={() => setVistaActiva('historial')} className={vistaActiva === 'historial' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                  4. Historial y Consultas
                </Nav.Link>
              </Nav.Item>
            )}

            {puedeVerParametros && (
              <>
                <p className="text-secondary small fw-bold px-3 mb-2 mt-4">ADMINISTRACIÓN</p>
                <Nav.Item>
                  <Nav.Link active={vistaActiva === 'parametros'} onClick={() => setVistaActiva('parametros')} className={vistaActiva === 'parametros' ? 'bg-danger text-white fw-bold rounded-0' : 'text-light'}>
                    Parámetros y Mantenedores
                  </Nav.Link>
                </Nav.Item>
              </>
            )}
          </Nav>
        </Col>

        {/* Contenido Principal */}
        <Col className="d-flex flex-column p-0" style={{ backgroundColor: modoOscuro ? '#121212' : '#f4f4f4' }}>
          <Navbar bg={modoOscuro ? 'dark' : 'white'} className="px-4 py-3 border-bottom justify-content-between">
            {/* Ocultamos el filtro de periodo si es un cliente invitado */}
            {rolUsuario !== 'cliente' ? (
              <Form className="d-flex align-items-center">
                <Form.Label className={`fw-bold me-3 mb-0 ${modoOscuro ? 'text-light' : 'text-dark'}`}>Período Activo:</Form.Label>
                <Form.Select value={periodoGlobal} onChange={(e) => setPeriodoGlobal(e.target.value)} className={`w-auto shadow-none ${modoOscuro ? 'bg-dark text-light border-secondary' : 'border-secondary'}`}>
                  <option value="Otoño 2026">Otoño 2026</option>
                  <option value="Primavera 2026">Primavera 2026</option>
                  <option value="Todos">Todos los períodos</option>
                </Form.Select>
              </Form>
            ) : <div></div>}
            
            <div className="d-flex align-items-center gap-3">
              <Form.Check type="switch" id="tema-switch" label={modoOscuro ? 'Modo Oscuro' : 'Modo Claro'} checked={modoOscuro} onChange={toggleTema} className={`fw-bold ${modoOscuro ? 'text-light' : 'text-dark'}`} />
              <Button variant="danger" onClick={handleLogout} className="fw-bold px-4">Salir</Button>
            </div>
          </Navbar>

          <div className="p-4 overflow-auto flex-grow-1">
            {renderizarContenido()}
          </div>
        </Col>

      </Row>
    </Container>
  );
}