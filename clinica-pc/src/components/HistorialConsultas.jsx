import { useState, useEffect } from 'react';
import { Card, Form, Row, Col, Button, Table, Badge } from 'react-bootstrap';

// Recibimos periodoGlobal como prop desde el panel principal
export default function HistorialConsultas({ modoOscuro, periodoGlobal }) {
  const [filtros, setFiltros] = useState({ busquedaGeneral: '', fechaInicio: '', fechaFin: '' });

  // Agregamos la propiedad "periodo" a los datos simulados
  const historialMock = [
    { id: 1, fecha: '2025-10-15', periodo: 'Otoño 2025', rut: '11222333-4', propietario: 'Luis Pérez', equipo: 'HP Pavilion', servicio: 'Formateo', tecnico: 'Matías Carrasco', estado: 'Entregado' },
    { id: 2, fecha: '2025-10-16', periodo: 'Otoño 2025', rut: '44555666-7', propietario: 'Ana Soto', equipo: 'Dell Inspiron', servicio: 'Mantención Física', tecnico: 'Cristian', estado: 'Entregado' },
    { id: 3, fecha: '2026-04-10', periodo: 'Otoño 2026', rut: '12345678-9', propietario: 'Camila Rojas', equipo: 'Asus ZenBook', servicio: 'Mantención Lógica', tecnico: 'Matías Carrasco', estado: 'Entregado' }
  ];

  const [resultados, setResultados] = useState([]);

  // Centralizamos la lógica de filtrado
  const aplicarFiltros = () => {
    const termino = filtros.busquedaGeneral.toLowerCase();
    
    const datosFiltrados = historialMock.filter(registro => {
      // 1. Filtrar por el selector del menú principal de arriba
      const coincidePeriodo = periodoGlobal === 'Todos' || registro.periodo === periodoGlobal;

      // 2. Filtrar por texto (AHORA INCLUYE LA FECHA)
      const coincideTexto = 
        registro.rut.toLowerCase().includes(termino) || 
        registro.propietario.toLowerCase().includes(termino) || 
        registro.tecnico.toLowerCase().includes(termino) || 
        registro.equipo.toLowerCase().includes(termino) || 
        registro.servicio.toLowerCase().includes(termino) ||
        registro.fecha.includes(termino); // Magia para que busque años

      // 3. Filtrar por rango de fechas
      let coincideFecha = true;
      const fechaRegistro = new Date(registro.fecha);
      if (filtros.fechaInicio) coincideFecha = coincideFecha && fechaRegistro >= new Date(filtros.fechaInicio);
      if (filtros.fechaFin) coincideFecha = coincideFecha && fechaRegistro <= new Date(filtros.fechaFin);

      return coincidePeriodo && coincideTexto && coincideFecha;
    });
    
    setResultados(datosFiltrados);
  };

  // Se ejecuta automáticamente si cambias el "Período Activo" en el menú de arriba
  useEffect(() => {
    // Solo filtra si periodoGlobal ya cargó (por si acaso)
    if (periodoGlobal) aplicarFiltros();
  }, [periodoGlobal]); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Se ejecuta si el usuario aprieta el botón de buscar
  const handleBuscar = (e) => {
    e.preventDefault();
    aplicarFiltros();
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Historial y Consultas</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>Busque atenciones por nombre, RUT, equipo o filtre por rango de fechas.</p>
      </div>

      <Card className={cardClass}>
        <Card.Body className="p-4">
          <Form onSubmit={handleBuscar}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Búsqueda General</Form.Label>
                  <Form.Control type="text" name="busquedaGeneral" value={filtros.busquedaGeneral} onChange={handleChange} placeholder="RUT, nombre, técnico, año..." className={modoOscuro ? 'bg-dark text-light' : ''} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha Inicio</Form.Label>
                  <Form.Control type="date" name="fechaInicio" value={filtros.fechaInicio} onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha Fin</Form.Label>
                  <Form.Control type="date" name="fechaFin" value={filtros.fechaFin} onChange={handleChange} className={modoOscuro ? 'bg-dark text-light' : ''} />
                </Form.Group>
              </Col>
              <Col md={2} className="d-grid">
                <Button variant={modoOscuro ? "light" : "danger"} type="submit" className="fw-bold">Buscar</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className={`shadow-sm border-0 ${modoOscuro ? 'bg-dark text-light' : ''}`}>
        <Card.Body className="p-0">
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="mb-0 align-middle">
            <thead>
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
              {resultados.length > 0 ? (
                resultados.map(registro => (
                  <tr key={registro.id}>
                    <td className="px-4">{registro.fecha}</td>
                    <td>{registro.rut}</td>
                    <td>{registro.propietario}</td>
                    <td>{registro.equipo}</td>
                    <td>{registro.servicio}</td>
                    <td>{registro.tecnico}</td>
                    <td className="px-4"><Badge bg="success" className="px-3 py-2 rounded-pill">{registro.estado}</Badge></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No se encontraron registros en este período.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}