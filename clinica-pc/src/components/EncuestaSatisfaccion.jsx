import { useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { useClinica } from '../context/clinicaContextBase.js';

// La encuesta usa datos de la MISMA instalación local del prototipo.
// En producción se necesita una API para recibir respuestas desde otro dispositivo.
export default function EncuestaSatisfaccion() {
  const { token } = useParams();
  const { datos, dispatch } = useClinica();
  const [calificacion, setCalificacion] = useState('');
  const [funcionamiento, setFuncionamiento] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [mensaje, setMensaje] = useState('');

  const atencion = datos.atenciones.find((a) => a.seguimiento?.token === token);
  const dispositivo = datos.dispositivos.find((d) => d.id === atencion?.dispositivoId);
  const respondida = Boolean(atencion?.seguimiento?.respuesta);
  const disponible = atencion?.estado === 'entregado' &&
    atencion.seguimiento?.estado === 'enviada_demo' && !respondida && !atencion.cierreTicket;

  const enviar = (event) => {
    event.preventDefault();
    if (!disponible) return;
    if (!calificacion || !['bien', 'parcial', 'mal'].includes(funcionamiento) ||
      (funcionamiento !== 'bien' && !comentarios.trim())) {
      setMensaje('Completa la evaluación y describe cualquier problema detectado.');
      return;
    }
    dispatch({
      type: 'RESPONDER_ENCUESTA',
      payload: { token, calificacion: Number(calificacion), funcionamiento, comentarios: comentarios.trim() },
    });
  };

  return (
    <main className="min-vh-100 py-4 px-3 bg-body-tertiary">
      <div className="mx-auto" style={{ maxWidth: '740px' }}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-danger text-white p-4">
            <h1 className="h4 mb-1">Clínica del PC · Seguimiento de servicio</h1>
            <p className="mb-0">Encuesta posterior a la entrega del equipo</p>
          </Card.Header>
          <Card.Body className="p-4">
            <Alert variant="info">
              Versión académica: esta encuesta funciona únicamente con los datos guardados
              en este navegador. No recibe ni envía información por correo.
            </Alert>

            {!atencion && (
              <Alert variant="warning">No se encontró esta encuesta en los datos locales del navegador.</Alert>
            )}

            {atencion && (
              <p className="text-muted">
                Equipo: <strong>{dispositivo?.marca || 'Dispositivo'} {dispositivo?.modelo || ''}</strong>
                {' · '}Atención: {atencion.id}
              </p>
            )}

            {respondida && (
              <Alert variant="success">
                <strong>¡Gracias por responder!</strong>
                <p className="mb-0">La evaluación quedó registrada en este prototipo.
                  El ticket sigue sujeto a la revisión del personal encargado.</p>
              </Alert>
            )}

            {atencion && !respondida && !disponible && (
              <Alert variant="warning">La encuesta aún no está habilitada para responder.</Alert>
            )}

            {disponible && (
              <Form onSubmit={enviar}>
                <Form.Group className="mb-4" controlId="encuesta-calificacion">
                  <Form.Label>¿Cómo calificarías la atención del servicio técnico? *</Form.Label>
                  <Form.Select required value={calificacion}
                    onChange={(e) => setCalificacion(e.target.value)}>
                    <option value="">Selecciona una nota</option>
                    <option value="5">5 · Excelente</option>
                    <option value="4">4 · Buena</option>
                    <option value="3">3 · Regular</option>
                    <option value="2">2 · Mala</option>
                    <option value="1">1 · Muy mala</option>
                  </Form.Select>
                </Form.Group>

                <fieldset className="mb-4">
                  <legend className="fs-6 fw-semibold">
                    Después de algunos días de uso, ¿cómo funciona tu computador? *
                  </legend>
                  <Form.Check type="radio" name="funcionamiento" id="enc-bien"
                    label="Sigue funcionando correctamente" value="bien"
                    checked={funcionamiento === 'bien'}
                    onChange={(e) => setFuncionamiento(e.target.value)} required />
                  <Form.Check type="radio" name="funcionamiento" id="enc-parcial"
                    label="Funciona, pero tiene algunos problemas" value="parcial"
                    checked={funcionamiento === 'parcial'}
                    onChange={(e) => setFuncionamiento(e.target.value)} />
                  <Form.Check type="radio" name="funcionamiento" id="enc-mal"
                    label="Volvió a fallar o ya no funciona correctamente" value="mal"
                    checked={funcionamiento === 'mal'}
                    onChange={(e) => setFuncionamiento(e.target.value)} />
                </fieldset>

                <Form.Group className="mb-4" controlId="encuesta-comentarios">
                  <Form.Label>
                    {funcionamiento === 'bien'
                      ? 'Comentarios o sugerencias (opcional)'
                      : 'Describe los problemas que aparecieron después de la entrega *'}
                  </Form.Label>
                  <Form.Control as="textarea" rows={4} maxLength={2000}
                    required={funcionamiento !== 'bien'}
                    value={comentarios} onChange={(e) => setComentarios(e.target.value)}
                    placeholder="Cuéntanos cómo ha funcionado el equipo después de la atención..." />
                </Form.Group>
                {mensaje && <Alert variant="warning">{mensaje}</Alert>}
                <Button variant="danger" size="lg" type="submit">Enviar evaluación</Button>
              </Form>
            )}
            <div className="mt-4">
              <Link to="/">Volver al inicio</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </main>
  );
}
