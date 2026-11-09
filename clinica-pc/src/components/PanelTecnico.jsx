import { useState } from 'react';
import { Card, Form, Button, Row, Col, Table, Alert } from 'react-bootstrap';

export default function PanelTecnico({ modoOscuro }) {
  const equipoAsignado = {
    propietario: 'Camila Rojas',
    marca: 'Lenovo',
    modelo: 'IdeaPad 5',
    problemaReportado: 'El equipo se apaga de forma repentina después de unos minutos de uso.',
    servicio: 'Mantención Lógica',
    accesorios: 'Cargador original'
  };

  const [sistemaOperativo, setSistemaOperativo] = useState('');
  const [soDetalle, setSoDetalle] = useState('');
  const [observacionFinal, setObservacionFinal] = useState('');
  const [checklist, setChecklist] = useState([
    { id: 1, tarea: 'El equipo enciende correctamente', estado: '', observacion: '' },
    { id: 2, tarea: 'Respaldo de información', estado: '', observacion: '' },
    { id: 3, tarea: 'Limpieza de temporales y registro', estado: '', observacion: '' },
    { id: 4, tarea: 'Actualización de controladores', estado: '', observacion: '' }
  ]);

  const handleChecklistChange = (id, campo, valor) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, [campo]: valor } : item));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Trabajo guardado exitosamente.');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light border-secondary' : 'bg-white'}`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Panel de Trabajo Técnico</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>Complete el diagnóstico y el checklist obligatorio para finalizar la atención.</p>
      </div>

      <Alert variant={modoOscuro ? "dark" : "secondary"} className={`border-0 shadow-sm mb-4 ${modoOscuro ? 'text-light border-secondary' : ''}`}>
        <h5 className="fw-bold mb-3">Equipo en Revisión: {equipoAsignado.marca} {equipoAsignado.modelo}</h5>
        <Row>
          <Col md={3}><p className="mb-1"><strong>Propietario:</strong><br/>{equipoAsignado.propietario}</p></Col>
          <Col md={3}><p className="mb-1"><strong>Servicio:</strong><br/>{equipoAsignado.servicio}</p></Col>
          <Col md={3}><p className="mb-1"><strong>Accesorios:</strong><br/>{equipoAsignado.accesorios}</p></Col>
          <Col md={3}><p className={`mb-1 ${modoOscuro ? 'text-warning' : 'text-danger'}`}><strong>Falla Reportada:</strong><br/>{equipoAsignado.problemaReportado}</p></Col>
        </Row>
      </Alert>

      <Form onSubmit={handleSubmit}>
        <Card className={cardClass}>
          <Card.Header className={headerClass}>1. Diagnóstico del Técnico</Card.Header>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Sistema Operativo</Form.Label>
                  <Form.Select value={sistemaOperativo} onChange={(e) => setSistemaOperativo(e.target.value)} required className={modoOscuro ? 'bg-dark text-light' : ''}>
                    <option value="">Seleccione OS...</option>
                    <option value="Windows 11">Windows 11</option>
                    <option value="Windows 10">Windows 10</option>
                    <option value="Linux">Linux</option>
                    <option value="Otro">Otro</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold">Detalle SO (Opcional)</Form.Label>
                  <Form.Control type="text" placeholder="Ej: Single Language" value={soDetalle} onChange={(e) => setSoDetalle(e.target.value)} className={modoOscuro ? 'bg-dark text-light' : ''} />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>2. Checklist: {equipoAsignado.servicio}</Card.Header>
          <Card.Body className="p-0">
            <Table responsive variant={modoOscuro ? 'dark' : 'light'} className="mb-0 align-middle">
              <thead>
                <tr>
                  <th className="px-4 py-3">Tarea</th>
                  <th className="py-3" style={{ width: '250px' }}>Estado</th>
                  <th className="px-4 py-3">Observación Técnica</th>
                </tr>
              </thead>
              <tbody>
                {checklist.map(item => (
                  <tr key={item.id}>
                    <td className="px-4">{item.tarea}</td>
                    <td>
                      <Form.Check inline type="radio" label="Sí" name={`estado-${item.id}`} value="Sí" onChange={(e) => handleChecklistChange(item.id, 'estado', e.target.value)} required />
                      <Form.Check inline type="radio" label="No" name={`estado-${item.id}`} value="No" onChange={(e) => handleChecklistChange(item.id, 'estado', e.target.value)} required />
                      <Form.Check inline type="radio" label="N/A" name={`estado-${item.id}`} value="N/A" onChange={(e) => handleChecklistChange(item.id, 'estado', e.target.value)} required />
                    </td>
                    <td className="px-4">
                      <Form.Control type="text" placeholder="Detalle obligatorio..." required value={item.observacion} onChange={(e) => handleChecklistChange(item.id, 'observacion', e.target.value)} className={modoOscuro ? 'bg-dark text-light' : ''} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>3. Cierre de Atención</Card.Header>
          <Card.Body className="p-4">
            <Form.Group>
              <Form.Label className="fw-bold">Observaciones finales y trabajos realizados</Form.Label>
              <Form.Control as="textarea" rows={4} required placeholder="Describa todo..." value={observacionFinal} onChange={(e) => setObservacionFinal(e.target.value)} className={modoOscuro ? 'bg-dark text-light' : ''} />
            </Form.Group>
          </Card.Body>
        </Card>

        <div className="d-flex justify-content-end mb-5">
          <Button type="submit" size="lg" variant={modoOscuro ? "light" : "danger"} className="fw-bold">Guardar y Finalizar Trabajo</Button>
        </div>
      </Form>
    </>
  );
}