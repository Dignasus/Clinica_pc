import { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useClinica } from '../../context/clinicaContextBase.js';
import { validarRetiro } from '../../utils/entregaCustodia.js';

// Formulario compartido entre el panel técnico y la ficha histórica.
// Los datos quedan en el navegador; no constituye una firma ni verificación legal de identidad.
export default function FormularioRetiro({ atencion, propietario, usuarioId, onEntregada }) {
  const { dispatch } = useClinica();
  const [tipoReceptor, setTipoReceptor] = useState('propietario');
  const [recibidoPor, setRecibidoPor] = useState('');
  const [identidadVerificada, setIdentidadVerificada] = useState(false);
  const [relacion, setRelacion] = useState('');
  const [medioAutorizacion, setMedioAutorizacion] = useState('');
  const [autorizacionConfirmada, setAutorizacionConfirmada] = useState(false);
  const [pruebaConPropietario, setPruebaConPropietario] = useState(false);
  const [pruebaConReceptor, setPruebaConReceptor] = useState(false);
  const [conformidad, setConformidad] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  const nombrePropietario = [
    propietario?.nombre, propietario?.apellidoPaterno, propietario?.apellidoMaterno,
  ].filter(Boolean).join(' ');

  const cambiarTipo = (nuevo) => {
    setTipoReceptor(nuevo);
    setIdentidadVerificada(false);
    setPruebaConPropietario(false);
    setPruebaConReceptor(false);
    setAutorizacionConfirmada(false);
    setMedioAutorizacion('');
    setMensaje('');
  };

  const confirmar = (e) => {
    e.preventDefault();
    const entrega = {
      tipoReceptor,
      recibidoPor: tipoReceptor === 'propietario' ? nombrePropietario : recibidoPor.trim(),
      identidadVerificada,
      relacion: tipoReceptor === 'tercero' ? relacion.trim() : '',
      medioAutorizacion: tipoReceptor === 'tercero' ? medioAutorizacion : '',
      autorizacionConfirmada: tipoReceptor === 'tercero' && autorizacionConfirmada,
      pruebaConPropietario: tipoReceptor === 'propietario' && pruebaConPropietario,
      pruebaConReceptor: tipoReceptor === 'tercero' && pruebaConReceptor,
      conformidad,
      observaciones: observaciones.trim(),
    };
    const error = validarRetiro(entrega);
    if (error) return setMensaje(error);
    dispatch({
      type: 'CONFIRMAR_ENTREGA',
      payload: { atencionId: atencion.id, entrega, usuarioId, token: crypto.randomUUID() },
    });
    onEntregada?.();
  };

  return (
    <Form onSubmit={confirmar}>
      <Alert variant="info">
        El ticket continuará abierto hasta recibir y revisar la encuesta posterior.
        El seguimiento comienza al confirmar el retiro efectivo, no al guardar el equipo en custodia.
      </Alert>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">¿Quién retira el computador? *</Form.Label>
        <Form.Check type="radio" name={`receptor-${atencion.id}`} id={`prop-${atencion.id}`}
          label="Propietario registrado" checked={tipoReceptor === 'propietario'}
          onChange={() => cambiarTipo('propietario')} />
        <Form.Check type="radio" name={`receptor-${atencion.id}`} id={`terc-${atencion.id}`}
          label="Tercero autorizado por el propietario" checked={tipoReceptor === 'tercero'}
          onChange={() => cambiarTipo('tercero')} />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Nombre de quien recibe *</Form.Label>
        <Form.Control required maxLength={120}
          readOnly={tipoReceptor === 'propietario'}
          value={tipoReceptor === 'propietario' ? nombrePropietario : recibidoPor}
          onChange={(e) => setRecibidoPor(e.target.value)}
          placeholder="Nombre completo de la persona autorizada" />
      </Form.Group>

      <Form.Check type="checkbox" className="mb-3" id={`identidad-${atencion.id}`}
        checked={identidadVerificada}
        label="Confirmo que verifiqué presencialmente la identidad de quien retira."
        onChange={(e) => setIdentidadVerificada(e.target.checked)} />

      {tipoReceptor === 'tercero' && (
        <div className="border rounded p-3 mb-3">
          <strong className="d-block mb-3">Autorización del propietario</strong>
          <Form.Group className="mb-3">
            <Form.Label>Relación con el propietario *</Form.Label>
            <Form.Control required maxLength={100} value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              placeholder="Ej.: familiar, compañero o persona designada" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Medio utilizado para confirmar la autorización *</Form.Label>
            <Form.Select required value={medioAutorizacion}
              onChange={(e) => setMedioAutorizacion(e.target.value)}>
              <option value="">Seleccione...</option>
              <option value="telefono">Llamada al propietario</option>
              <option value="whatsapp">WhatsApp del propietario</option>
            </Form.Select>
          </Form.Group>
          <Form.Check type="checkbox" id={`autor-${atencion.id}`}
            checked={autorizacionConfirmada}
            label="Contacté directamente al propietario por los datos registrados y confirmó que esta persona puede retirar el equipo."
            onChange={(e) => setAutorizacionConfirmada(e.target.checked)} />
          <Form.Check type="checkbox" className="mt-2" id={`prueba-terc-${atencion.id}`}
            checked={pruebaConReceptor} label="Se realizó una prueba del equipo con el tercero (opcional)."
            onChange={(e) => setPruebaConReceptor(e.target.checked)} />
          <Alert variant="warning" className="mt-3 mb-0">
            No se registrará una prueba con el propietario si este no estuvo presente.
            No entregar el equipo sin autorización confirmada.
          </Alert>
        </div>
      )}

      {tipoReceptor === 'propietario' && (
        <Form.Check type="checkbox" className="mb-3" id={`prueba-prop-${atencion.id}`}
          checked={pruebaConPropietario}
          label="Confirmo que probamos el computador junto al propietario."
          onChange={(e) => setPruebaConPropietario(e.target.checked)} />
      )}

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Conformidad de la entrega *</Form.Label>
        <Form.Select value={conformidad} required onChange={(e) => setConformidad(e.target.value)}>
          <option value="">Seleccione...</option>
          <option value="conforme">Conforme</option>
          <option value="con_observaciones">Con observaciones</option>
          <option value="no_conforme">Sin conformidad</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Observaciones del retiro</Form.Label>
        <Form.Control as="textarea" rows={3} maxLength={2000}
          value={observaciones} required={conformidad !== 'conforme'}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Ej.: estado del equipo, accesorios entregados y observaciones de la persona que retira" />
      </Form.Group>

      {mensaje && <Alert variant="warning" role="alert">{mensaje}</Alert>}
      <Button type="submit" variant="danger">Confirmar retiro efectivo e iniciar seguimiento</Button>
    </Form>
  );
}
