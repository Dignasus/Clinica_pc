import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';

export default function EncuestaSatisfaccion({ modoOscuro }) {
  const [enviado, setEnviado] = useState(false);
  const [evaluacion, setEvaluacion] = useState({
    calificacion: '',
    resuelto: '',
    comentarios: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvaluacion(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Encuesta enviada:", evaluacion);
    setEnviado(true);
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 text-white`;
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  if (enviado) {
    return (
      <Alert variant="success" className="text-center p-5 shadow-sm border-0">
        <h4 className="fw-bold mb-3">¡Gracias por su opinión!</h4>
        <p className="mb-0">Sus respuestas nos ayudan a mejorar la calidad de servicio en la Clínica del PC INACAP.</p>
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Encuesta de Satisfacción</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Por favor, califique la atención recibida al momento de retirar su equipo.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className={cardClass}>
          <Card.Header className={headerClass} style={{ backgroundColor: '#cc0000' }}>
            Evaluación del Servicio Técnico
          </Card.Header>
          <Card.Body className="p-4">
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">1. ¿Cómo calificaría la atención general del técnico que le entregó el equipo? *</Form.Label>
              <Form.Select name="calificacion" required onChange={handleChange} value={evaluacion.calificacion} className={modoOscuro ? 'bg-dark text-light' : ''}>
                <option value="">Seleccione una nota...</option>
                <option value="5">⭐⭐⭐⭐⭐ - Excelente</option>
                <option value="4">⭐⭐⭐⭐ - Buena</option>
                <option value="3">⭐⭐⭐ - Regular</option>
                <option value="2">⭐⭐ - Mala</option>
                <option value="1">⭐ - Muy Mala</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold d-block">2. Tras realizar las pruebas junto al técnico, ¿su equipo quedó funcionando correctamente? *</Form.Label>
              <div className="d-flex gap-4">
                <Form.Check type="radio" label="Sí, problema resuelto" name="resuelto" value="si" required onChange={handleChange} />
                <Form.Check type="radio" label="No, sigue con fallas" name="resuelto" value="no" required onChange={handleChange} />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">3. Comentarios o sugerencias (Opcional)</Form.Label>
              <Form.Control as="textarea" rows={3} name="comentarios" value={evaluacion.comentarios} onChange={handleChange} placeholder="Cuéntenos más sobre su experiencia..." className={modoOscuro ? 'bg-dark text-light' : ''} />
            </Form.Group>

            <div className="d-grid">
              <Button type="submit" size="lg" variant={modoOscuro ? "light" : "danger"} className="fw-bold">
                Enviar Evaluación
              </Button>
            </div>

          </Card.Body>
        </Card>
      </Form>
    </>
  );
}