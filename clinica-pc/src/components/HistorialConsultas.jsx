import { useState } from 'react';
import { Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';

export default function HistorialConsultas() {
  const [filtros, setFiltros] = useState({
    busquedaGeneral: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const historialMock = [
    { id: 1, fecha: '2025-10-15', rut: '11222333-4', propietario: 'Luis Pérez', equipo: 'HP Pavilion', servicio: 'Formateo', tecnico: 'Matías Carrasco', estado: 'Entregado' },
    { id: 2, fecha: '2025-10-16', rut: '44555666-7', propietario: 'Ana Soto', equipo: 'Dell Inspiron', servicio: 'Mantención Física', tecnico: 'Cristian', estado: 'Entregado' },
    { id: 3, fecha: '2026-04-10', rut: '12345678-9', propietario: 'Camila Rojas', equipo: 'Asus ZenBook', servicio: 'Mantención Lógica', tecnico: 'Matías Carrasco', estado: 'Entregado' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    console.log('Filtros aplicados:', filtros);
    alert('Aplicando búsqueda global en la base de datos...');
  };

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: '#cc0000', fontWeight: 'bold' }}>Historial y Consultas</h3>
        <p className="text-muted">Busque atenciones por nombre, RUT, equipo o filtre por rango de fechas.</p>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="busquedaGeneral">
                  <Form.Label className="fw-bold">Búsqueda General</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="busquedaGeneral"
                    value={filtros.busquedaGeneral}
                    onChange={handleChange}
                    placeholder="RUT, nombre, técnico, marca o falla..." 
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="fechaInicio">
                  <Form.Label className="fw-bold">Fecha Inicio</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="fechaInicio"
                    value={filtros.fechaInicio}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group controlId="fechaFin">
                  <Form.Label className="fw-bold">Fecha Fin</Form.Label>
                  <Form.Control 
                    type="date" 
                    name="fechaFin"
                    value={filtros.fechaFin}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-grid">
                <Button variant="dark" type="submit" className="fw-bold">Buscar</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="py-3 px-4 border-bottom-0">Fecha</th>
                <th className="py-3 border-bottom-0">RUT</th>
                <th className="py-3 border-bottom-0">Propietario</th>
                <th className="py-3 border-bottom-0">Equipo</th>
                <th className="py-3 border-bottom-0">Servicio</th>
                <th className="py-3 border-bottom-0">Técnico</th>
                <th className="py-3 px-4 border-bottom-0">Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialMock.map(registro => (
                <tr key={registro.id}>
                  <td className="px-4">{registro.fecha}</td>
                  <td>{registro.rut}</td>
                  <td>{registro.propietario}</td>
                  <td>{registro.equipo}</td>
                  <td>{registro.servicio}</td>
                  <td>{registro.tecnico}</td>
                  <td className="px-4">
                    <Badge bg="success" className="px-3 py-2 rounded-pill">
                      {registro.estado}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}