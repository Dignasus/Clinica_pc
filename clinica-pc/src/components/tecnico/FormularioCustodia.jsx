import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useClinica } from '../../context/clinicaContextBase.js';
import { validarCustodia } from '../../utils/entregaCustodia.js';

export default function FormularioCustodia({ atencion, usuarioId, onCustodia }) {
  const { dispatch } = useClinica();
  const [ubicacion, setUbicacion] = useState('Sala de profesores, piso 2');
  const [responsableRecepcion, setResponsableRecepcion] = useState('');
  const [motivo, setMotivo] = useState('Cliente retirará después del horario de la clínica');
  const [confirmacionRecepcion, setConfirmacionRecepcion] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const registrar = (e) => {
    e.preventDefault();
    const custodia = { ubicacion, responsableRecepcion, motivo, confirmacionRecepcion };
    const error = validarCustodia(custodia);
    if (error) return setMensaje(error);
    dispatch({ type: 'REGISTRAR_CUSTODIA', payload: {
      atencionId: atencion.id, usuarioId, custodia,
    } });
    onCustodia?.();
  };

  return (
    <Form onSubmit={registrar}>
      <Alert variant="warning">
        Utiliza este procedimiento solo después de trasladar físicamente el equipo
        y confirmar quién lo recibe. Guardarlo en custodia NO equivale a entregarlo
        al propietario y NO activa la encuesta.
      </Alert>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Ubicación de custodia *</Form.Label>
        <Form.Control required maxLength={140} value={ubicacion}
          onChange={(e) => setUbicacion(e.target.value)}
          placeholder="Ej.: sala de profesores, segundo piso" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Persona que recibe el equipo en custodia *</Form.Label>
        <Form.Control required maxLength={120} value={responsableRecepcion}
          onChange={(e) => setResponsableRecepcion(e.target.value)}
          placeholder="Nombre del docente o funcionario que recibe" />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Motivo del traslado *</Form.Label>
        <Form.Control as="textarea" rows={2} required maxLength={700}
          value={motivo} onChange={(e) => setMotivo(e.target.value)} />
      </Form.Group>
      <Form.Check type="checkbox" id={`custodia-confirmada-${atencion.id}`}
        className="mb-3" checked={confirmacionRecepcion}
        label="Confirmo que entregué el equipo a la persona responsable de la custodia."
        onChange={(e) => setConfirmacionRecepcion(e.target.checked)} />
      {mensaje && <Alert variant="warning" role="alert">{mensaje}</Alert>}
      <Button type="submit" variant="outline-primary">
        Registrar traslado a custodia
      </Button>
    </Form>
  );
}
