
import { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import DatosPersonales from './inscripcion/DatosPersonales.jsx';
import DatosEquipo from './inscripcion/DatosEquipo.jsx';
import TerminosLegales from './inscripcion/TerminosLegales.jsx';
import { useClinica } from '../context/clinicaContextBase.js';
import { normalizarRut, validarRut } from '../utils/rut.js';
import { jornadaPermiteInscripcion, obtenerEstadoJornada, etiquetasEstadoJornada } from '../utils/jornadas.js';

const formularioInicial = {
  rut: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  telefono: '', correo: '', comuna: '', sector: '',
  marcaEquipo: '', modeloEquipo: '', numeroSerie: '', diagnosticoPropietario: '',
  servicios: { formateo: false, mantencionFisica: false, mantencionLogica: false },
  aceptaTerminos: false,
};

export default function InscripcionQR({ modoOscuro }) {
  const { datos, dispatch } = useClinica();
  const [formData, setFormData] = useState(formularioInicial);
  const [jornadaId, setJornadaId] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);

  const jornadasDisponibles = datos.jornadas
    .filter(jornadaPermiteInscripcion)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (Object.hasOwn(prev.servicios, name)) {
        return { ...prev, servicios: { ...prev.servicios, [name]: checked } };
      }
      return { ...prev, [name]: type === 'checkbox' ? checked : value };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const jornada = jornadasDisponibles.find((j) => j.id === jornadaId);
    if (!jornada) return alert('Selecciona una jornada disponible.');
    if (!validarRut(formData.rut)) return alert('El RUT ingresado no es válido.');

    const servicioIds = Object.entries(formData.servicios)
      .filter(([, seleccionado]) => seleccionado)
      .map(([id]) => id);

    if (!servicioIds.length) return alert('Selecciona al menos un servicio.');
    if (!formData.aceptaTerminos) return alert('Debes aceptar los términos.');

    const rut = normalizarRut(formData.rut);
    const existente = datos.propietarios.find((p) => normalizarRut(p.rut) === rut);

    const propietarioId = existente?.id ?? `PROP-${crypto.randomUUID()}`;
    const dispositivoId = `DISP-${crypto.randomUUID()}`;
    const atencionId = `AT-${crypto.randomUUID()}`;
    const fechaRegistro = new Date().toISOString();

    const propietario = {
      id: propietarioId, rut,
      nombre: formData.nombre.trim(),
      apellidoPaterno: formData.apellidoPaterno.trim(),
      apellidoMaterno: formData.apellidoMaterno.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim(),
      comuna: formData.comuna.trim(),
      sector: formData.sector.trim(),
    };

    const dispositivo = {
      id: dispositivoId, propietarioId, tipo: 'pendiente',
      marca: formData.marcaEquipo.trim(),
      modelo: formData.modeloEquipo.trim(),
      numeroSerie: formData.numeroSerie.trim(),
    };

    const atencion = {
      id: atencionId, dispositivoId, jornadaId: jornada.id, servicioIds,
      diagnosticoPropietario: formData.diagnosticoPropietario.trim(),
      fechaPreinscripcion: fechaRegistro,
      fechaAceptacionTerminos: fechaRegistro,
      tecnicoIds: [], estado: 'preinscrito',
      observaciones: [], respuestasChecklist: [],
    };

    dispatch({
      type: 'REGISTRAR_PREINSCRIPCION',
      payload: { propietario, dispositivo, atencion },
    });

    setConfirmacion({
      atencionId, nombre: `${propietario.nombre} ${propietario.apellidoPaterno}`,
      equipo: `${dispositivo.marca} ${dispositivo.modelo}`,
      jornada: `${jornada.periodo} — ${jornada.fecha}`,
      fechaRegistro,
    });

    setFormData((prev) => ({
      ...prev,
      marcaEquipo: '', modeloEquipo: '', numeroSerie: '', diagnosticoPropietario: '',
      servicios: { formateo: false, mantencionFisica: false, mantencionLogica: false },
      aceptaTerminos: false,
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const agregarOtroEquipo = () => {
    setConfirmacion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nuevaInscripcion = () => {
    setFormData(formularioInicial);
    setJornadaId('');
    setConfirmacion(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CONFIRMACIÓN: reemplaza el formulario después del registro.
  if (confirmacion) {
    return (
      <Card className={cardClass}>
        <Card.Body className="p-4 p-md-5 text-center" aria-live="polite">
          <div className="fs-1 mb-3" aria-hidden="true">✓</div>
          <h3 className="text-success fw-bold">¡Preinscripción registrada!</h3>
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>
            Tu dispositivo quedó registrado para la jornada seleccionada.
          </p>

          <div className={`text-start p-4 rounded-3 my-4 ${modoOscuro ? 'bg-secondary' : 'bg-light'}`}>
            <p><strong>Propietario:</strong> {confirmacion.nombre}</p>
            <p><strong>Equipo:</strong> {confirmacion.equipo}</p>
            <p><strong>Jornada:</strong> {confirmacion.jornada}</p>
            <p><strong>Fecha de registro:</strong> {
              new Date(confirmacion.fechaRegistro).toLocaleString('es-CL')
            }</p>
            <p className="mb-0"><strong>N.º de atención:</strong> {confirmacion.atencionId}</p>
          </div>

          <Alert variant="info" className="text-start">
            Esta confirmación corresponde a la preinscripción. Debes presentar el
            dispositivo en recepción durante la jornada para continuar la atención.
          </Alert>

          <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
            <Button variant={modoOscuro ? 'light' : 'danger'}
              onClick={agregarOtroEquipo} className="fw-bold">
              Agregar otro dispositivo
            </Button>
            <Button variant="outline-secondary" onClick={nuevaInscripcion}>
              Nueva inscripción
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Preinscripción de Equipos</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Selecciona una jornada y registra los datos del propietario y su dispositivo.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className={cardClass}>
          <Card.Header className={headerClass}>1. Jornada de Atención</Card.Header>
          <Card.Body className="p-4">
            <Form.Label className="fw-bold">Selecciona la jornada *</Form.Label>
            <Form.Select required value={jornadaId} className={controlClass}
              onChange={(e) => setJornadaId(e.target.value)}>
              <option value="">Seleccione una jornada...</option>
              {jornadasDisponibles.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.periodo} — {j.fecha} ({etiquetasEstadoJornada[obtenerEstadoJornada(j)]})
                </option>
              ))}
            </Form.Select>

            {!jornadasDisponibles.length && (
              <Alert variant="warning" className="mt-3 mb-0">
                No hay jornadas disponibles para preinscripción.
              </Alert>
            )}
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>2. Datos del Propietario</Card.Header>
          <Card.Body className="p-4">
            <DatosPersonales formData={formData} onChange={handleChange} modoOscuro={modoOscuro} />
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>3. Información del Dispositivo</Card.Header>
          <Card.Body className="p-4">
            <DatosEquipo formData={formData} onChange={handleChange} modoOscuro={modoOscuro} />
          </Card.Body>
        </Card>

        <Card className={cardClass}>
          <Card.Header className={headerClass}>4. Términos y Condiciones</Card.Header>
          <Card.Body className="p-4">
            <TerminosLegales formData={formData} onChange={handleChange} modoOscuro={modoOscuro} />
          </Card.Body>
        </Card>

        <div className="d-grid mb-5">
          <Button type="submit" variant={modoOscuro ? 'light' : 'danger'}
            size="lg" className="fw-bold py-3" disabled={!jornadasDisponibles.length}>
            Registrar Preinscripción
          </Button>
        </div>
      </Form>
    </>
  );
}
