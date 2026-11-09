import { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

export default function RecepcionEquipos({ modoOscuro }) {
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  const buscarCliente = (e) => {
    e.preventDefault();
    if (rutBusqueda === '12345678-9') {
      setClienteEncontrado({
        nombre: 'Camila Rojas',
        telefono: '+56 9 1234 5678',
        equipo: { marca: 'Lenovo', modelo: 'IdeaPad 5', problema: 'El equipo se apaga de forma repentina.', servicios: ['Formateo', 'Mantención Física'] }
      });
    } else {
      alert('Para la prueba, intente con el RUT: 12345678-9');
      setClienteEncontrado(null);
    }
  };

  const handleAsignar = (e) => {
    e.preventDefault();
    alert('Equipo recepcionado y asignado correctamente.');
    setClienteEncontrado(null);
    setRutBusqueda('');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const highlightCardClass = `shadow-sm border-0 border-top border-danger border-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const infoBoxClass = `p-4 rounded-3 mb-4 border ${modoOscuro ? 'bg-secondary text-light border-secondary' : 'bg-light'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Recepción de Equipos</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>Busque al propietario por su RUT para confirmar la llegada del equipo.</p>
      </div>

      <Card className={cardClass}>
        <Card.Body className="p-4">
          <Form onSubmit={buscarCliente}>
            <Form.Label className="fw-bold">Buscar por RUT del Propietario</Form.Label>
            <InputGroup className="w-50">
              <Form.Control type="text" placeholder="Ej: 12345678-9" required value={rutBusqueda} onChange={(e) => setRutBusqueda(e.target.value)} className={modoOscuro ? 'bg-dark text-light' : ''} />
              <Button variant="danger" type="submit" className="fw-bold px-4">Buscar</Button>
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>

      {clienteEncontrado && (
        <Card className={highlightCardClass}>
          <Card.Body className="p-4">
            <h4 className="mb-4 text-danger fw-bold">Propietario: {clienteEncontrado.nombre}</h4>
            
            <div className={infoBoxClass}>
              <Row className="g-3">
                <Col md={6}><p className="mb-1"><strong>Teléfono:</strong> {clienteEncontrado.telefono}</p></Col>
                <Col md={6}><p className="mb-1"><strong>Equipo Registrado:</strong> {clienteEncontrado.equipo.marca} {clienteEncontrado.equipo.modelo}</p></Col>
                <Col md={12}><p className="mb-1"><strong>Servicios Solicitados:</strong> {clienteEncontrado.equipo.servicios.join(', ')}</p></Col>
                <Col md={12}><p className={`mb-0 ${modoOscuro ? 'text-warning' : 'text-danger'}`}><strong>Falla Reportada:</strong> {clienteEncontrado.equipo.problema}</p></Col>
              </Row>
            </div>

            <Form onSubmit={handleAsignar}>
              <Form.Group controlId="tecnico" className="mb-4 w-50">
                <Form.Label className="fw-bold">Asignar a Técnico o Dupla de Trabajo</Form.Label>
                <Form.Select required className={modoOscuro ? 'bg-dark text-light' : ''}>
                  <option value="">Seleccione un técnico disponible...</option>
                  <option value="matias">Matías Carrasco</option>
                  <option value="cristian">Cristian</option>
                  <option value="dupla1">Dupla: Matías y Cristian</option>
                </Form.Select>
              </Form.Group>
              <Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold px-4 py-2">
                Confirmar Recepción
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </>
  );
}