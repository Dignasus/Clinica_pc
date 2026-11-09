import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ rut: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!credenciales.rut || !credenciales.password) {
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
      return;
    }

    sessionStorage.setItem('authToken', 'super-usuario-token-simulado');
    navigate('/panel');
  };

  return (
    <Container fluid className="vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f4f4' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={4}>
          <Card className="shadow-lg border-0 rounded-3">
            <Card.Body className="p-5">
              
              <div className="text-center mb-4">
                <h2 style={{ color: '#cc0000', fontWeight: 'bold' }}>Clínica del PC</h2>
                <p className="text-muted mb-0">Sistema de Gestión Integral</p>
              </div>
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="rut">
                  <Form.Label className="fw-bold">Usuario (RUT)</Form.Label>
                  <Form.Control
                    type="text"
                    name="rut"
                    value={credenciales.rut}
                    onChange={handleChange}
                    placeholder="Ej: 12.345.678-9"
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
                    placeholder="Ingresa tu contraseña"
                    size="lg"
                  />
                </Form.Group>

                {error && <Alert variant="danger" className="text-center py-2">{error}</Alert>}
                
                <div className="d-grid">
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