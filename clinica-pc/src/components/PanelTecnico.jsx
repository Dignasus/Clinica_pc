import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert, Badge } from 'react-bootstrap';

export default function PanelTecnico({ modoOscuro }) {
  const [vista, setVista] = useState('bandeja'); // 'bandeja' o 'diagnostico'
  
  // Lista de equipos asignados al técnico que inició sesión
  const bandejaEquipos = [
    { id: 1, marca: 'Lenovo', modelo: 'IdeaPad 5', servicio: 'Mantención Lógica', propietario: 'Camila Rojas', estado: 'Pendiente' },
    { id: 2, marca: 'HP', modelo: 'Pavilion Gaming', servicio: 'Formateo', propietario: 'Luis Pérez', estado: 'En proceso' }
  ];

  const [equipoActual, setEquipoActual] = useState(null);
  const [sistemaOperativo, setSistemaOperativo] = useState('');
  const [checklist, setChecklist] = useState([
    { id: 1, tarea: 'El equipo enciende correctamente', estado: '', observacion: '' },
    { id: 2, tarea: 'Respaldo de información', estado: '', observacion: '' }
  ]);

  const iniciarAtencion = (equipo) => {
    setEquipoActual(equipo);
    setVista('diagnostico');
  };

  const handleChecklistChange = (id, campo, valor) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Trabajo guardado exitosamente.');
    setVista('bandeja'); // Vuelve a la bandeja tras terminar
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  if (vista === 'bandeja') {
    return (
      <>
        <div className="mb-4">
          <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Bandeja de Tareas</h3>
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>Seleccione un equipo asignado para comenzar la atención técnica.</p>
        </div>
        <Card className={cardClass}>
          <Card.Body className="p-0">
            <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead>
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="py-3">Equipo</th>
                  <th className="py-3">Servicio</th>
                  <th className="py-3">Propietario</th>
                  <th className="py-3">Estado</th>
                  <th className="px-4 py-3 text-end">Acción</th>
                </tr>
              </thead>
              <tbody>
                {bandejaEquipos.map(eq => (
                  <tr key={eq.id}>
                    <td className="px-4">#{eq.id}</td>
                    <td>{eq.marca} {eq.modelo}</td>
                    <td>{eq.servicio}</td>
                    <td>{eq.propietario}</td>
                    <td><Badge bg={eq.estado === 'Pendiente' ? 'danger' : 'warning'} text={eq.estado === 'Pendiente' ? 'white' : 'dark'}>{eq.estado}</Badge></td>
                    <td className="px-4 text-end">
                      <Button variant="dark" size="sm" onClick={() => iniciarAtencion(eq)}>Atender</Button>
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

  // Vista del formulario de diagnóstico
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Panel de Trabajo</h3>
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>Complete el diagnóstico del equipo seleccionado.</p>
        </div>
        <Button variant="secondary" onClick={() => setVista('bandeja')}>Volver a Bandeja</Button>
      </div>

      <Alert variant={modoOscuro ? "dark" : "secondary"} className={`border-0 shadow-sm mb-4 ${modoOscuro ? 'text-light border-secondary' : ''}`}>
        <h5 className="fw-bold mb-3">Revisando: {equipoActual.marca} {equipoActual.modelo}</h5>
        <p className="mb-0"><strong>Propietario:</strong> {equipoActual.propietario} | <strong>Servicio:</strong> {equipoActual.servicio}</p>
      </Alert>

      <Form onSubmit={handleSubmit}>
        <Card className={cardClass}>
          <Card.Header className={headerClass}>1. Checklist Obligatorio</Card.Header>
          <Card.Body className="p-0">
            <Table responsive variant={modoOscuro ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead><tr><th className="px-4 py-3">Tarea</th><th className="py-3">Estado</th></tr></thead>
              <tbody>
                {checklist.map(item => (
                  <tr key={item.id}>
                    <td className="px-4">{item.tarea}</td>
                    <td>
                      <Form.Check inline type="radio" label="Sí" name={`estado-${item.id}`} required />
                      <Form.Check inline type="radio" label="No" name={`estado-${item.id}`} required />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" size="lg" variant={modoOscuro ? "light" : "danger"}>Guardar y Finalizar</Button>
        </div>
      </Form>
    </>
  );
}