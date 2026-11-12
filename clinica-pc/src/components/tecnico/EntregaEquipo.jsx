
import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useClinica } from '../../context/clinicaContextBase.js';

export default function EntregaEquipo({
  atencion, dispositivo, propietario, onVolver, onEntregada,
}) {
  const { dispatch } = useClinica();
  const [mensaje, setMensaje] = useState('');

  const [verificacion, setVerificacion] = useState({
    encendido: '', estadoFisico: '', accesorios: '',
    diferencias: '', resultadoServicio: '',
  });

  const [contacto, setContacto] = useState({ medio: '', observaciones: '' });
  const [entrega, setEntrega] = useState({
    recibidoPor: '', conformidad: '',
    pruebaConPropietario: false, observaciones: '',
  });

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

    setMensaje('Aviso registrado. Falta realizar la prueba y entrega conjunta.');
  };

  const confirmarEntrega = (e) => {
    e.preventDefault();

    if (!entrega.pruebaConPropietario || !entrega.recibidoPor.trim() ||
        !entrega.conformidad) {
      return setMensaje('Completa los datos y confirma la prueba con el propietario.');
    }

    if (entrega.conformidad !== 'conforme' && !entrega.observaciones.trim()) {
      return setMensaje('Registra las observaciones de la entrega.');
    }

    dispatch({
      type: 'CONFIRMAR_ENTREGA',
      payload: { atencionId: atencion.id, entrega },
    });

    onEntregada();
  };

  return (
    <div className="pc-tech-delivery">
      <div className="pc-tech-heading">
        <div>
          <span className="pc-tech-eyebrow">CLÍNICA DEL PC / CIERRE DE ATENCIÓN</span>
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
        <div className={atencion.estado === 'contactado' ? 'is-current' : ''}>
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

      {/* PASO 3: ENTREGA CONJUNTA */}
      {atencion.estado === 'contactado' && (
        <Form onSubmit={confirmarEntrega}>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head"><span className="pc-tech-number">03</span>
                <div><strong>Entrega y cierre de atención</strong><small>Confirmación conjunta con el propietario</small></div>
              </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <Alert variant="info">
                El contacto está registrado. Verifica el dispositivo junto al
                propietario antes de cerrar esta atención.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Nombre de quien recibe *</Form.Label>
                <Form.Control required className={controlClass}
                  placeholder="Persona que recibe el equipo"
                  value={entrega.recibidoPor}
                  onChange={(e) => actualizar(setEntrega, 'recibidoPor', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Conformidad de la entrega *</Form.Label>
                <Form.Select required className={controlClass} value={entrega.conformidad}
                  onChange={(e) => actualizar(setEntrega, 'conformidad', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="conforme">Entregado conforme</option>
                  <option value="con_observaciones">Entregado con observaciones</option>
                  <option value="no_conforme">Recibido sin conformidad</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="pc-tech-field-label">Observaciones de la entrega</Form.Label>
                <Form.Control as="textarea" rows={3} className={controlClass}
                  placeholder="Dudas, observaciones del propietario o escribe Sin observaciones"
                  value={entrega.observaciones}
                  onChange={(e) => actualizar(setEntrega, 'observaciones', e.target.value)} />
              </Form.Group>

              <Form.Check type="checkbox" id={`prueba-propietario-${atencion.id}`}
                className="mb-4" required checked={entrega.pruebaConPropietario}
                label="Confirmo que el dispositivo fue probado junto al propietario."
                onChange={(e) => actualizar(setEntrega, 'pruebaConPropietario', e.target.checked)} />

              <Button type="submit" variant={botonVariante} size="lg" className="pc-tech-primary">
                Confirmar entrega y cerrar atención
              </Button>
            </Card.Body>
          </Card>
        </Form>
      )}
    </div>
  );
}
