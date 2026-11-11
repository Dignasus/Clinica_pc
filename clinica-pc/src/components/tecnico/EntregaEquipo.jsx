
import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useClinica } from '../../context/clinicaContextBase.js';

export default function EntregaEquipo({
  atencion, dispositivo, propietario, modoOscuro, onVolver, onEntregada,
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

  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const botonVariante = modoOscuro ? 'light' : 'danger';
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
    <>
      <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-danger mb-1">Verificación y Entrega</h3>
          <p className={modoOscuro ? 'text-light mb-0' : 'text-muted mb-0'}>
            {dispositivo.marca} {dispositivo.modelo} · {propietario.nombre} {propietario.apellidoPaterno}
          </p>
        </div>
        <Button variant="secondary" onClick={onVolver}>Volver</Button>
      </div>

      {mensaje && <Alert variant="info">{mensaje}</Alert>}

      {/* PASO 1: COMPARACIÓN DEL ESTADO FINAL */}
      {atencion.estado === 'en_proceso' && (
        <Form onSubmit={guardarVerificacion}>
          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">1. Verificación final del dispositivo</Card.Header>
            <Card.Body className="p-4">
              <Alert variant="secondary">
                <strong>Inspección inicial registrada</strong>
                <p className="mb-1 mt-2">Encendido: {inicial.encendido || 'No registrado'}</p>
                <p className="mb-1">Estado físico: {inicial.estadoFisico || 'No registrado'}</p>
                <p className="mb-0">Accesorios: {inicial.accesorios || 'No informados'}</p>
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Funcionamiento al finalizar *</Form.Label>
                <Form.Select required className={controlClass} value={verificacion.encendido}
                  onChange={(e) => actualizar(setVerificacion, 'encendido', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="Sí">Enciende correctamente</option>
                  <option value="Con fallas">Enciende con fallas</option>
                  <option value="No">No enciende</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Estado físico final *</Form.Label>
                <Form.Control as="textarea" rows={2} required className={controlClass}
                  placeholder="Describe pantalla, teclado, carcasa y otros componentes..."
                  value={verificacion.estadoFisico}
                  onChange={(e) => actualizar(setVerificacion, 'estadoFisico', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Accesorios que se devolverán *</Form.Label>
                <Form.Control required className={controlClass} value={verificacion.accesorios}
                  placeholder="Ej: Cargador y funda; o Ninguno"
                  onChange={(e) => actualizar(setVerificacion, 'accesorios', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Diferencias respecto al estado inicial *</Form.Label>
                <Form.Control as="textarea" rows={2} required className={controlClass}
                  placeholder="Describe las diferencias o escribe: Sin diferencias"
                  value={verificacion.diferencias}
                  onChange={(e) => actualizar(setVerificacion, 'diferencias', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Resultado del servicio *</Form.Label>
                <Form.Select required className={controlClass} value={verificacion.resultadoServicio}
                  onChange={(e) => actualizar(setVerificacion, 'resultadoServicio', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="resuelto">Trabajo realizado satisfactoriamente</option>
                  <option value="parcial">Trabajo realizado parcialmente</option>
                  <option value="no_resuelto">Problema no resuelto</option>
                </Form.Select>
              </Form.Group>

              <Button type="submit" variant={botonVariante} className="fw-bold">
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
            <Card.Header className="fw-bold py-3">2. Aviso al propietario</Card.Header>
            <Card.Body className="p-4">
              <Alert variant="success">
                El dispositivo está listo para coordinar su devolución.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Medio de contacto utilizado *</Form.Label>
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
                <Form.Label className="fw-bold">Resultado del contacto *</Form.Label>
                <Form.Control as="textarea" rows={3} required className={controlClass}
                  placeholder="Ej: Propietario informado, acordó retirar el equipo..."
                  value={contacto.observaciones}
                  onChange={(e) => actualizar(setContacto, 'observaciones', e.target.value)} />
              </Form.Group>

              <Alert variant="warning">
                Este formulario solamente registra un aviso que ya realizaste.
                No envía WhatsApp, correos ni llamadas automáticamente.
              </Alert>

              <Button type="submit" variant={botonVariante} className="fw-bold">
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
            <Card.Header className="fw-bold py-3">3. Entrega y cierre de atención</Card.Header>
            <Card.Body className="p-4">
              <Alert variant="info">
                El contacto está registrado. Verifica el dispositivo junto al
                propietario antes de cerrar esta atención.
              </Alert>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Nombre de quien recibe *</Form.Label>
                <Form.Control required className={controlClass}
                  placeholder="Persona que recibe el equipo"
                  value={entrega.recibidoPor}
                  onChange={(e) => actualizar(setEntrega, 'recibidoPor', e.target.value)} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Conformidad de la entrega *</Form.Label>
                <Form.Select required className={controlClass} value={entrega.conformidad}
                  onChange={(e) => actualizar(setEntrega, 'conformidad', e.target.value)}>
                  <option value="">Seleccione...</option>
                  <option value="conforme">Entregado conforme</option>
                  <option value="con_observaciones">Entregado con observaciones</option>
                  <option value="no_conforme">Recibido sin conformidad</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Observaciones de la entrega</Form.Label>
                <Form.Control as="textarea" rows={3} className={controlClass}
                  placeholder="Dudas, observaciones del propietario o escribe Sin observaciones"
                  value={entrega.observaciones}
                  onChange={(e) => actualizar(setEntrega, 'observaciones', e.target.value)} />
              </Form.Group>

              <Form.Check type="checkbox" id={`prueba-propietario-${atencion.id}`}
                className="mb-4" required checked={entrega.pruebaConPropietario}
                label="Confirmo que el dispositivo fue probado junto al propietario."
                onChange={(e) => actualizar(setEntrega, 'pruebaConPropietario', e.target.checked)} />

              <Button type="submit" variant={botonVariante} size="lg" className="fw-bold">
                Confirmar entrega y cerrar atención
              </Button>
            </Card.Body>
          </Card>
        </Form>
      )}
    </>
  );
}
