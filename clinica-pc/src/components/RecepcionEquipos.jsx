import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';

export default function RecepcionEquipos({ modoOscuro }) {
  const [equiposPendientes, setEquiposPendientes] = useState([
    { id: 101, rut: '12345678-9', nombre: 'Camila Rojas', equipo: 'Lenovo IdeaPad 5', falla: 'Se apaga repentinamente', fecha: 'Hoy 09:30' },
    { id: 102, rut: '9876543-2', nombre: 'Pedro Pascal', equipo: 'MacBook Air M1', falla: 'No carga batería', fecha: 'Hoy 11:15' },
    { id: 103, rut: '19283746-5', nombre: 'Valentina Soto', equipo: 'HP Pavilion', falla: 'Muy lento, requiere formateo', fecha: 'Ayer 16:45' }
  ]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [tecnicoAsignado, setTecnicoAsignado] = useState('');
  const [rutBusqueda, setRutBusqueda] = useState('');

  // 1. Lógica de Filtro en Vivo: Comprueba si el texto ingresado está en el RUT o el Nombre
  const equiposFiltrados = equiposPendientes.filter(eq => 
    eq.rut.includes(rutBusqueda) || 
    eq.nombre.toLowerCase().includes(rutBusqueda.toLowerCase())
  );

  const buscarCliente = (e) => {
    e.preventDefault();
    
    // 2. Comportamiento inteligente del botón buscar
    if (equiposFiltrados.length === 1) {
      // Si solo queda uno en la tabla, lo selecciona automáticamente
      seleccionarDesdeTabla(equiposFiltrados[0]);
    } else if (equiposFiltrados.length > 1) {
      // Si hay varios, avisa que debe elegir
      alert('Se encontraron varias coincidencias. Por favor, seleccione manualmente desde la tabla.');
    } else {
      // Si no hay ninguno
      alert('No se encontraron preinscripciones con ese dato. El cliente debe realizar la Fase 1 primero.');
      setClienteSeleccionado(null);
    }
  };

  const seleccionarDesdeTabla = (equipo) => {
    setClienteSeleccionado(equipo);
    setRutBusqueda(equipo.rut); // Autocompleta el RUT en la barra
  };

  const handleAsignar = (e) => {
    e.preventDefault();
    alert('Equipo recepcionado exitosamente y asignado al técnico.');
    
    // Lo quitamos de la lista para simular que avanzó a taller
    setEquiposPendientes(prev => prev.filter(eq => eq.id !== clienteSeleccionado.id));
    setClienteSeleccionado(null);
    setRutBusqueda('');
    setTecnicoAsignado('');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const highlightCardClass = `shadow-sm border-0 border-top border-danger border-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const infoBoxClass = `p-4 rounded-3 mb-4 border ${modoOscuro ? 'bg-secondary text-light border-secondary' : 'bg-light'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Recepción Física de Equipos</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Confirme la llegada física del equipo preinscrito y asígnelo a un técnico disponible.
        </p>
      </div>

      <Row className="g-4">
        {/* Columna Izquierda: Búsqueda y Tabla */}
        <Col lg={7}>
          <Card className={cardClass}>
            <Card.Header className={headerClass}>1. Buscar Preinscripción</Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={buscarCliente} className="mb-4">
                <Form.Group className="d-flex gap-2">
                  <Form.Control 
                    type="text" 
                    placeholder="Ingrese RUT o Nombre..." 
                    value={rutBusqueda} 
                    onChange={(e) => setRutBusqueda(e.target.value)} 
                    className={modoOscuro ? 'bg-dark text-light' : ''} 
                  />
                  <Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold px-4">Buscar</Button>
                </Form.Group>
              </Form>

              <h6 className="fw-bold mb-3">Equipos esperando llegada (Fase 1 completada):</h6>
              <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>RUT</th>
                    <th>Cliente</th>
                    <th>Equipo</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 3. Ahora renderizamos equiposFiltrados en lugar de la lista completa */}
                  {equiposFiltrados.length > 0 ? (
                    equiposFiltrados.map(eq => (
                      <tr key={eq.id}>
                        <td>{eq.rut}</td>
                        <td>{eq.nombre}</td>
                        <td>{eq.equipo}</td>
                        <td className="text-end">
                          <Button variant="outline-danger" size="sm" onClick={() => seleccionarDesdeTabla(eq)}>
                            Seleccionar
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3 text-muted">No hay preinscripciones que coincidan.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha: Asignación */}
        <Col lg={5}>
          {clienteSeleccionado ? (
            <Card className={highlightCardClass}>
              <Card.Header className={headerClass}>2. Asignación Técnica</Card.Header>
              <Card.Body className="p-4">
                <h4 className="mb-3 text-danger fw-bold">{clienteSeleccionado.nombre}</h4>
                
                <div className={infoBoxClass}>
                  <p className="mb-2"><strong>RUT:</strong> {clienteSeleccionado.rut}</p>
                  <p className="mb-2"><strong>Equipo:</strong> {clienteSeleccionado.equipo}</p>
                  <p className="mb-2 text-danger"><strong>Falla:</strong> {clienteSeleccionado.falla}</p>
                  <p className="mb-0"><strong>Preinscrito:</strong> {clienteSeleccionado.fecha}</p>
                </div>

                <Form onSubmit={handleAsignar}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Seleccionar Técnico Asignado</Form.Label>
                    <Form.Select 
                      required 
                      value={tecnicoAsignado}
                      onChange={(e) => setTecnicoAsignado(e.target.value)}
                      className={modoOscuro ? 'bg-dark text-light' : ''}
                    >
                      <option value="">Seleccione técnico...</option>
                      <option value="matias">Matías Carrasco (Disponible)</option>
                      <option value="camila">Camila Rojas (Disponible)</option>
                      <option value="cristian" disabled>Cristian (Ocupado)</option>
                    </Form.Select>
                  </Form.Group>

                  <Alert variant="warning" className="py-2 border-0 shadow-sm">
                    <small>Asegúrese de recibir el equipo físicamente antes de confirmar.</small>
                  </Alert>

                  <div className="d-grid mt-4">
                    <Button variant={modoOscuro ? "light" : "danger"} type="submit" size="lg" className="fw-bold">
                      Confirmar y Asignar
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className={`${cardClass} h-100 d-flex align-items-center justify-content-center border-dashed`} style={{ minHeight: '300px' }}>
              <Card.Body className="text-center text-muted p-5 d-flex flex-column justify-content-center">
                <p className="mb-0">Seleccione un equipo de la lista o busque un RUT para asignar un técnico.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}