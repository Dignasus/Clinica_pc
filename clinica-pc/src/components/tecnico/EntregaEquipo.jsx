
import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useClinica } from '../../context/clinicaContextBase.js';
import FormularioRetiro from './FormularioRetiro.jsx';
import FormularioCustodia from './FormularioCustodia.jsx';

export default function EntregaEquipo({
  atencion, dispositivo, propietario, usuarioId, onVolver, onEntregada, onCustodia,
}) {
  const { dispatch } = useClinica();
  const [mensaje, setMensaje] = useState('');

  const [verificacion, setVerificacion] = useState({
    encendido: '', estadoFisico: '', accesorios: '',
    diferencias: '', resultadoServicio: '',
  });

  const [contacto, setContacto] = useState({ medio: '', observaciones: '' });
  const controlClass = 'pc-tech-control';
  const cardClass = 'pc-tech-card';
  const botonVariante = 'danger';
  const inicial = atencion.inspeccionInicial || {};

  const actualizar = (setter, campo, valor) => {
    setter((prev) => ({ ...prev, [campo]: valor }));
    setMensaje('');
  };

  const guardarVerificacion = (e) => {
    e.preventDefault();

    if (Object.values(verificacion).some((v) => !String(v).trim())) {
      return setMensaje('Completa toda la verificación final.');
    }

    dispatch({
      type: 'REGISTRAR_VERIFICACION_FINAL',
      payload: { atencionId: atencion.id, verificacionFinal: verificacion },
    });

    setMensaje('Verificación guardada. Ahora registra el contacto con el propietario.');
  };

  const guardarContacto = (e) => {
    e.preventDefault();

    if (!contacto.medio || !contacto.observaciones.trim()) {
      return setMensaje('Indica el medio y el resultado del contacto.');
    }

    dispatch({
      type: 'REGISTRAR_CONTACTO',
      payload: { atencionId: atencion.id, contacto },
    });

    setMensaje('Aviso registrado. Ahora puedes documentar el retiro o la transferencia a custodia.');
  };

  return (
    <div className="pc-tech-delivery">
      <div className="pc-tech-heading">
        <div>
          <span className="pc-tech-eyebrow">CLÍNICA DEL PC / ENTREGA DEL EQUIPO</span>
          <h2>Verificación y entrega</h2>
          <p>{dispositivo.marca} {dispositivo.modelo} · {propietario.nombre} {propietario.apellidoPaterno}</p>
        </div>
        <Button type="button" variant="outline-secondary" className="pc-tech-back" onClick={onVolver}>
          Volver a la bandeja
        </Button>
      </div>

      <div className="pc-tech-progress" aria-label="Etapas de la entrega">
        <div className={atencion.estado === 'en_proceso' ? 'is-current' : 'is-done'}>
          <span>01</span><strong>Verificación</strong>
        </div>
        <div className={atencion.estado === 'listo_entrega' ? 'is-current' :
          atencion.estado === 'contactado' ? 'is-done' : ''}>
          <span>02</span><strong>Aviso</strong>
        </div>
        <div className={['contactado', 'en_custodia'].includes(atencion.estado) ? 'is-current' : ''}>
          <span>03</span><strong>Entrega</strong>
        </div>
      </div>

      {mensaje && <Alert variant="info">{mensaje}</Alert>}

      {/* PASO 1: COMPARACIÓN DEL ESTADO FINAL */}
      {atencion.estado === 'en_proceso' && (
        <Form onSubmit={guardarVerificacion}>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head"><span className="pc-tech-number">01</span>
                <div><strong>Verificación final del dispositivo</strong><small>Comparación con el estado inicial</small></div>
              </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <Alert variant="secondary">
                <strong>Inspección inicial registrada</strong>
                <p className="mb-1 mt-2">Encendido: {inicial.encendido || 'No registrado'}</p>
                <p className="mb-1">Estado físico: {inicial.estadoFisico || 'No registrado'}</p>
                <p className="mb-0">Accesorios: {inicial.accesorios || 'No informados'}</p>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Funcionamiento al finalizar *</Form.Label>
                <Form.Select required className={controlClass} value={verificacion.encendido}
                  onChange={(e) => actualizar(setVerificacion, 'encendido', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="Sí">Enciende correctamente</option>
                  <option value="Con fallas">Enciende con fallas</option>
                  <option value="No">No enciende</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Estado físico final *</Form.Label>
                <Form.Control as="textarea" rows={2} required className={controlClass}
                  placeholder="Describe pantalla, teclado, carcasa y otros componentes..."
                  value={verificacion.estadoFisico}
                  onChange={(e) => actualizar(setVerificacion, 'estadoFisico', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Accesorios que se devolverán *</Form.Label>
                <Form.Control required className={controlClass} value={verificacion.accesorios}
                  placeholder="Ej: Cargador y funda; o Ninguno"
                  onChange={(e) => actualizar(setVerificacion, 'accesorios', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Diferencias respecto al estado inicial *</Form.Label>
                <Form.Control as="textarea" rows={2} required className={controlClass}
                  placeholder="Describe las diferencias o escribe: Sin diferencias"
                  value={verificacion.diferencias}
                  onChange={(e) => actualizar(setVerificacion, 'diferencias', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="pc-tech-field-label">Resultado del servicio *</Form.Label>
                <Form.Select required className={controlClass} value={verificacion.resultadoServicio}
                  onChange={(e) => actualizar(setVerificacion, 'resultadoServicio', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="resuelto">Trabajo realizado satisfactoriamente</option>
                  <option value="parcial">Trabajo realizado parcialmente</option>
                  <option value="no_resuelto">Problema no resuelto</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant={botonVariante} className="pc-tech-primary">
                Guardar verificación final
              </Button>
            </Card.Body>
          </Card>
        </Form>
      )}

      {/* PASO 2: AVISO AL PROPIETARIO */}
      {atencion.estado === 'listo_entrega' && (
        <Form onSubmit={guardarContacto}>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head"><span className="pc-tech-number">02</span>
                <div><strong>Aviso al propietario</strong><small>Registro del contacto realizado</small></div>
              </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <Alert variant="success">
                El dispositivo está listo para coordinar su devolución.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Medio de contacto utilizado *</Form.Label>
                <Form.Select required className={controlClass} value={contacto.medio}
                  onChange={(e) => actualizar(setContacto, 'medio', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="telefono">Llamada telefónica</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="correo">Correo electrónico</option>
                  <option value="presencial">Presencial</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="pc-tech-field-label">Resultado del contacto *</Form.Label>
                <Form.Control as="textarea" rows={3} required className={controlClass}
                  placeholder="Ej: Propietario informado, acordó retirar el equipo..."
                  value={contacto.observaciones}
                  onChange={(e) => actualizar(setContacto, 'observaciones', e.target.value)} />
              </Form.Group>

              <Alert variant="warning">
                Este formulario solamente registra un aviso que ya realizaste.
                No envía WhatsApp, correos ni llamadas automáticamente.
              </Alert>

              <Button type="submit" variant={botonVariante} className="pc-tech-primary">
                Registrar aviso realizado
              </Button>
            </Card.Body>
          </Card>
        </Form>
      )}

      {/* PASO 3: ENTREGAR AHORA O TRASLADAR A CUSTODIA */}
      {atencion.estado === 'contactado' && (
        <>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">03</span>
              <div>
                <strong>Entrega física al propietario o tercero autorizado</strong>
                <small>El seguimiento comienza después del retiro efectivo.</small>
              </div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <FormularioRetiro atencion={atencion} propietario={propietario}
                usuarioId={usuarioId} onEntregada={onEntregada} />
            </Card.Body>
          </Card>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">04</span>
              <div>
                <strong>Transferir a custodia para retiro posterior</strong>
                <small>Registrar ubicación y responsable, sin marcar la entrega al cliente.</small>
              </div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <FormularioCustodia atencion={atencion} usuarioId={usuarioId}
                onCustodia={onCustodia} />
            </Card.Body>
          </Card>
        </>
      )}

      {/* RETIRO POSTERIOR DESDE CUSTODIA */}
      {atencion.estado === 'en_custodia' && (
        <Card className={cardClass}>
          <Card.Header className="pc-tech-card-head">
            <span className="pc-tech-number">05</span>
            <div>
              <strong>Retiro de equipo que permanece en custodia</strong>
              <small>Confirmar retiro efectivo e identificar a quien lo recibe.</small>
            </div>
          </Card.Header>
          <Card.Body className="pc-tech-card-body">
            <Alert variant="warning">
              <strong>Ubicación:</strong> {atencion.custodia?.ubicacion || 'No informada'}.
              {' '}<strong>Responsable:</strong> {atencion.custodia?.responsableRecepcion || 'No informado'}.
              El equipo todavía no se ha entregado al cliente.
            </Alert>
            <FormularioRetiro atencion={atencion} propietario={propietario}
              usuarioId={usuarioId} onEntregada={onEntregada} />
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
