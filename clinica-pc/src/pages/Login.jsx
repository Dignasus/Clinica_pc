import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function Login() {
  // Aquí estaba el error. Cambiamos 'rut' por 'usuario'
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const usuariosMock = {
    'admin': { rol: 'superusuario', nombre: 'Matías Carrasco' },
    'recepcion': { rol: 'recepcionista', nombre: 'Camila Rojas' },
    'tecnico': { rol: 'tecnico', nombre: 'Cristian' },
    'cliente': { rol: 'cliente', nombre: 'Cliente Invitado' }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que el usuario haya escrito algo
    if (!credenciales.usuario || !credenciales.password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    const usuarioIngresado = credenciales.usuario.toLowerCase().trim();
    
    if (usuariosMock[usuarioIngresado] && credenciales.password === '123') {
      sessionStorage.setItem('authToken', 'sesion-activa'); // Sim
      sessionStorage.setItem('userRol', usuariosMock[usuarioIngresado].rol);
      sessionStorage.setItem('userNombre', usuariosMock[usuarioIngresado].nombre);
      navigate('/panel', { replace: true });
    } else {
      setError('Credenciales inválidas. Revise su usuario y contraseña.');
    }
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f4f4' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={4}>
          <Card className="shadow-lg border-0 rounded-3 mb-3">
            <Card.Body className="p-5">
              
              <div className="text-center mb-4">
                <h2 style={{ color: '#cc0000', fontWeight: 'bold' }}>Clínica del PC</h2>
                <p className="text-muted mb-0">Sistema de Gestión Integral</p>
              </div>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="usuario">
                  <Form.Label className="fw-bold">Usuario</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="usuario" 
                    value={credenciales.usuario} 
                    onChange={handleChange} 
                    placeholder="Ingrese su usuario..." 
                    autoComplete="off" 
                    size="lg" 
                  />
                </Form.Group>
                
                <Form.Group className="mb-4" controlId="password">
                  <Form.Label className="fw-bold">Contraseña</Form.Label>
                  <Form.Control 
                    type="password" 
                    name="password" 
                    value={credenciales.password} 
                    onChange={handleChange} 
                    placeholder="Ingrese su contraseña..." 
                    size="lg" 
                  />
                </Form.Group>

                {error && <Alert variant="danger" className="text-center py-2">{error}</Alert>}
                
                <div className="d-grid mt-2">
                  <Button type="submit" size="lg" style={{ backgroundColor: '#cc0000', borderColor: '#cc0000' }}>
                    Ingresar al Sistema
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}