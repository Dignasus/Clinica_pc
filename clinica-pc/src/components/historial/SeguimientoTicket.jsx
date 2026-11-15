import { useState } from 'react';
import { Alert, Badge, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useClinica } from '../../context/clinicaContextBase.js';
import { estadoTicket, etiquetasTicket, puedeCerrarTicket } from '../../utils/seguimiento.js';

const fechaLegible = (valor) => valor
  ? new Date(valor).toLocaleString('es-CL') : 'No registrada';

export default function SeguimientoTicket({ atencion, puedeGestionar = false, usuarioId = '' }) {
  const { datos, dispatch } = useClinica();
  const navigate = useNavigate();
  const [resolucion, setResolucion] = useState('');
  const [aviso, setAviso] = useState('');
  const estado = estadoTicket(atencion);
  const seguimiento = atencion.seguimiento;
  const respuesta = seguimiento?.respuesta;
  const operadorCierre = datos.usuarios.find((u) => u.id === atencion.cierreTicket?.usuarioId);
  const operadorResolucion = datos.usuarios.find((u) => u.id === seguimiento?.resolucion?.usuarioId);

  const preparar = () => {
    dispatch({ type: 'INICIAR_SEGUIMIENTO', payload: {
      atencionId: atencion.id, usuarioId, token: crypto.randomUUID(),
    } });
    setAviso('Seguimiento generado para una entrega histórica.');
  };

  const simularEnvio = () => {
    dispatch({ type: 'SIMULAR_ENVIO_ENCUESTA', payload: { atencionId: atencion.id, usuarioId } });
    setAviso('Envío simulado. NO se envió ningún correo electrónico.');
  };

  const guardarResolucion = (e) => {
    e.preventDefault();
    if (!resolucion.trim()) return setAviso('Registra cómo se solucionó o gestionó la incidencia.');
    dispatch({ type: 'RESOLVER_INCIDENCIA', payload: {
      atencionId: atencion.id, usuarioId, observaciones: resolucion.trim(),
    } });
    setResolucion('');
    setAviso('Resolución registrada. Ahora se puede evaluar el cierre.');
  };

  const cerrar = () => {
    if (!window.confirm('¿Cerrar el ticket después de revisar la respuesta y resolución, si corresponde?')) return;
    dispatch({ type: 'CERRAR_TICKET', payload: { atencionId: atencion.id, usuarioId } });
    setAviso('Cierre registrado en el prototipo.');
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <span className="me-2">Estado del ticket:</span>
        <Badge bg={estado === 'cerrado' ? 'success' : estado === 'incidencia' ? 'danger' : 'warning'}
          text={['incidencia', 'cerrado'].includes(estado) ? undefined : 'dark'}>
          {etiquetasTicket[estado] || estado}
        </Badge>
      </div>

      {atencion.estado !== 'entregado' ? (
        <Alert variant="secondary">Este dispositivo todavía no ha sido entregado.
          El seguimiento comenzará después de la entrega física.</Alert>
      ) : (
        <>
          <Alert variant="info" className="mb-0">
            El equipo ya fue entregado. Esto NO significa que el ticket esté cerrado.
            La jornada presencial y el cierre del ticket son procesos diferentes.
          </Alert>

          {seguimiento ? (
            <div>
              <p className="mb-1"><strong>Encuesta programada para:</strong> {fechaLegible(seguimiento.programadaPara)}</p>
              <p className="mb-1"><strong>Estado de notificación:</strong> {
                seguimiento.fechaSimulacion ? 'Simulación realizada (sin correo real)' : 'Pendiente; no hay servicio de correo configurado'
              }</p>
              {seguimiento.fechaSimulacion && <p className="mb-0">
                <strong>Fecha de simulación:</strong> {fechaLegible(seguimiento.fechaSimulacion)}
              </p>}
            </div>
          ) : (
            <Alert variant="warning" className="mb-0">
              Esta atención se entregó en una versión anterior. Debes preparar el seguimiento.
            </Alert>
          )}

          {respuesta && (
            <div className="border rounded p-3">
              <h4 className="h6 fw-bold">Respuesta posterior del cliente</h4>
              <p className="mb-1"><strong>Fecha:</strong> {fechaLegible(respuesta.fecha)}</p>
              <p className="mb-1"><strong>Calificación:</strong> {respuesta.calificacion}/5</p>
              <p className="mb-1"><strong>Funcionamiento:</strong> {
                { bien: 'Sigue funcionando', parcial: 'Presenta problemas', mal: 'Volvió a fallar' }[respuesta.funcionamiento]
              }</p>
              <p className="mb-0"><strong>Comentarios:</strong> {respuesta.comentarios || 'Sin comentarios'}</p>
            </div>
          )}

          {seguimiento?.resolucion && (
            <Alert variant="success">
              <strong>Incidencia gestionada</strong>
              <p className="mb-1 mt-2">{seguimiento.resolucion.observaciones}</p>
              <small>{fechaLegible(seguimiento.resolucion.fecha)} · {operadorResolucion?.nombre || 'Encargado no disponible'}</small>
            </Alert>
          )}

          {atencion.cierreTicket && (
            <Alert variant="success" className="mb-0">
              <strong>Ticket cerrado:</strong> {fechaLegible(atencion.cierreTicket.fecha)}
              <p className="mb-0">{atencion.cierreTicket.motivo}
                {' · '}Responsable: {operadorCierre?.nombre || 'Encargado no disponible'}</p>
            </Alert>
          )}

          {aviso && <Alert variant="secondary" role="status" className="mb-0">{aviso}</Alert>}

          {puedeGestionar && !seguimiento && !atencion.cierreTicket && (
            <Button variant="outline-primary" onClick={preparar}>Preparar seguimiento de atención antigua</Button>
          )}

          {puedeGestionar && seguimiento?.estado === 'pendiente_envio' && !atencion.cierreTicket && (
            <div>
              <Button variant="outline-primary" onClick={simularEnvio}>Simular envío de encuesta</Button>
              <p className="small text-muted mt-2 mb-0">
                Acción de QA: permite avanzar sin esperar el plazo de demostración de 72 h.
                No crea ni envía un email.
              </p>
            </div>
          )}

          {seguimiento?.estado === 'enviada_demo' && !respuesta && (
            <div>
              <Button variant="outline-secondary" onClick={() => navigate(`/encuesta/${seguimiento.token}`)}>
                Abrir encuesta de prueba
              </Button>
              <p className="small text-muted mt-2 mb-0">
                La respuesta se guarda solo en este navegador; no compartas este enlace
                con otros dispositivos porque no existe un backend sincronizado.
              </p>
            </div>
          )}

          {puedeGestionar && estado === 'incidencia' && (
            <Form onSubmit={guardarResolucion}>
              <Form.Group className="mb-2" controlId={`resolucion-${atencion.id}`}>
                <Form.Label>Resolución o gestión de la incidencia *</Form.Label>
                <Form.Control as="textarea" rows={3} maxLength={2000} value={resolucion}
                  required onChange={(e) => setResolucion(e.target.value)}
                  placeholder="Describe el seguimiento realizado y cómo se resolvió la falla..." />
              </Form.Group>
              <Button type="submit" variant="warning">Registrar resolución</Button>
            </Form>
          )}

          {puedeGestionar && puedeCerrarTicket(atencion) && (
            <Button variant="success" onClick={cerrar}>Cerrar ticket después de revisión</Button>
          )}

          {!respuesta && !atencion.cierreTicket && (
            <p className="small text-muted mb-0">
              El cierre permanece bloqueado hasta recibir la respuesta del propietario.
            </p>
          )}
        </>
      )}
    </div>
  );
}
