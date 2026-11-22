
import { useEffect, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import './inscripcion/InscripcionQRVisual.css';

import DatosPersonales from './inscripcion/DatosPersonales.jsx';
import DatosEquipo from './inscripcion/DatosEquipo.jsx';
import TerminosLegales from './inscripcion/TerminosLegales.jsx';

import { useClinica } from '../context/clinicaContextBase.js';
import { normalizarRut, validarRut } from '../utils/rut.js';
import { normalizarCampoRegistro, validarFormularioRegistro } from '../utils/validacionEntradas.js';
import {
  jornadaPermiteInscripcion,
  obtenerEstadoJornada,
  etiquetasEstadoJornada,
} from '../utils/jornadas.js';
import {
  encontrarRegionDeComuna,
  comunasDeRegion,
} from '../data/regionesChile.js';
import {
  buscarDispositivoPrevio,
  normalizarRutIdentidad,
} from '../utils/dispositivos.js';

const formularioInicial = {
  rut: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '',
  telefono: '', correo: '',
  region: '', comuna: '', sector: '',
  marcaEquipo: '', modeloEquipo: '', numeroSerie: '',
  diagnosticoPropietario: '',
  servicios: {
    formateo: false,
    mantencionFisica: false,
    mantencionLogica: false,
  },
  aceptaTerminos: false,
};


const TEMA_KEY = 'clinica-pc-tema';

export default function InscripcionQR({ modoOscuro: modoOscuroInicial = false }) {
  // La ruta pública no tiene el Header del panel, por eso gestiona su propio botón.
  const [modoOscuro, setModoOscuro] = useState(() => {
    try {
      const preferencia = localStorage.getItem(TEMA_KEY);
      if (preferencia === 'oscuro') return true;
      if (preferencia === 'claro') return false;
    } catch {
      // Sin acceso a localStorage, sigue funcionando con el valor inicial.
    }
    return Boolean(modoOscuroInicial);
  });

  useEffect(() => {
    try {
      localStorage.setItem(TEMA_KEY, modoOscuro ? 'oscuro' : 'claro');
    } catch {
      // El tema sigue siendo seleccionable sin persistencia.
    }
  }, [modoOscuro]);

  const botonTema = (
    <button
      type="button"
      className="cp-qr__theme-toggle"
      onClick={() => setModoOscuro((anterior) => !anterior)}
      aria-label={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-pressed={modoOscuro}
    >
      <span aria-hidden="true">{modoOscuro ? '☀' : '☾'}</span>
      {modoOscuro ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
  const { datos, dispatch } = useClinica();

  const [formData, setFormData] = useState(formularioInicial);
  const [jornadaId, setJornadaId] = useState('');
  const [confirmacion, setConfirmacion] = useState(null);
  const [error, setError] = useState('');

  const jornadasDisponibles = [...datos.jornadas]
    .filter(jornadaPermiteInscripcion)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (Object.hasOwn(prev.servicios, name)) {
        return {
          ...prev,
          servicios: {
            ...prev.servicios,
            [name]: checked,
          },
        };
      }

      return {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
    });

    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const jornada = jornadasDisponibles.find(
      (j) => j.id === jornadaId
    );

    if (!jornada) {
      return setError('Selecciona una jornada disponible.');
    }

    if (!validarRut(formData.rut)) {
      return setError('El RUT ingresado no es válido.');
    }

    // Validar región y comuna como una combinación coherente.
    const region = formData.region ||
      encontrarRegionDeComuna(formData.comuna);

    if (!region) {
      return setError('Selecciona una región.');
    }

    if (!comunasDeRegion(region).includes(formData.comuna)) {
      return setError('Selecciona una comuna válida para la región.');
    }

    const servicioIds = Object.entries(formData.servicios)
      .filter(([, seleccionado]) => seleccionado)
      .map(([id]) => id);

    if (!servicioIds.length) {
      return setError('Selecciona al menos un servicio.');
    }

    if (!formData.aceptaTerminos) {
      return setError('Debes aceptar los términos y condiciones.');
    }

    const camposTextoObligatorios = [
      'nombre',
      'apellidoPaterno',
      'apellidoMaterno',
      'telefono',
      'correo',
      'sector',
      'marcaEquipo',
      'modeloEquipo',
      'diagnosticoPropietario',
    ];

    if (camposTextoObligatorios.some((campo) =>
      !String(formData[campo] ?? '').trim()
    )) {
      return setError(
        'Completa los campos obligatorios con información válida; no uses solo espacios.'
      );
    }

    // Validación compartida de longitudes, formatos y caracteres de control.
    // React presenta diagnósticos/observaciones como texto, nunca como HTML.
    const errorEntrada = validarFormularioRegistro(formData);
    if (errorEntrada) return setError(errorEntrada);

    const rut = normalizarRut(formData.rut);

    const existente = datos.propietarios.find(
      (p) => normalizarRutIdentidad(p.rut) ===
        normalizarRutIdentidad(rut)
    );

    const propietarioId = existente?.id ||
      `PROP-${crypto.randomUUID()}`;

    // Reconocer un equipo anterior por propietario y número de serie.
    const dispositivoAnterior = buscarDispositivoPrevio(
      datos.dispositivos,
      propietarioId,
      {
        marca: formData.marcaEquipo,
        numeroSerie: formData.numeroSerie,
      }
    );

    // Impedir la duplicación identificable dentro de la misma jornada.
    const yaInscrito = dispositivoAnterior &&
      datos.atenciones.some((a) =>
        a.dispositivoId === dispositivoAnterior.id &&
        a.jornadaId === jornada.id &&
        a.estado !== 'cancelado'
      );

    if (yaInscrito) {
      return setError(
        'Este dispositivo ya tiene una inscripción para la jornada ' +
        'seleccionada. No es necesario registrarlo nuevamente.'
      );
    }

    const dispositivoId = `DISP-${crypto.randomUUID()}`;
    const atencionId = `AT-${crypto.randomUUID()}`;
    const fechaRegistro = new Date().toISOString();

    const propietario = {
      id: propietarioId,
      rut,
      nombre: normalizarCampoRegistro('nombre', formData.nombre),
      apellidoPaterno: normalizarCampoRegistro('apellidoPaterno', formData.apellidoPaterno),
      apellidoMaterno: normalizarCampoRegistro('apellidoMaterno', formData.apellidoMaterno),
      telefono: normalizarCampoRegistro('telefono', formData.telefono),
      correo: normalizarCampoRegistro('correo', formData.correo),
      region,
      comuna: normalizarCampoRegistro('comuna', formData.comuna),
      sector: normalizarCampoRegistro('sector', formData.sector),
    };

    const dispositivo = {
      id: dispositivoId,
      propietarioId,
      tipo: 'pendiente',
      marca: normalizarCampoRegistro('marcaEquipo', formData.marcaEquipo),
      modelo: normalizarCampoRegistro('modeloEquipo', formData.modeloEquipo),
      numeroSerie: normalizarCampoRegistro('numeroSerie', formData.numeroSerie),
    };

    const atencion = {
      id: atencionId,
      dispositivoId,
      jornadaId: jornada.id,
      servicioIds,
      origenRegistro: 'qr',
      diagnosticoPropietario:
        normalizarCampoRegistro('diagnosticoPropietario', formData.diagnosticoPropietario),
      fechaPreinscripcion: fechaRegistro,
      fechaAceptacionTerminos: fechaRegistro,
      tecnicoIds: [],
      estado: 'preinscrito',
      observaciones: [],
      respuestasChecklist: [],
    };

    dispatch({
      type: 'REGISTRAR_PREINSCRIPCION',
      payload: { propietario, dispositivo, atencion },
    });

    setConfirmacion({
      atencionId,
      nombre: `${propietario.nombre} ${propietario.apellidoPaterno}`,
      equipo: `${dispositivo.marca} ${dispositivo.modelo}`,
      jornada: `${jornada.periodo} — ${jornada.fecha}`,
      region,
      comuna: propietario.comuna,
      fechaRegistro,
      esReingreso: Boolean(dispositivoAnterior),
    });

    // Mantener al propietario para registrar otro dispositivo.
    setFormData((prev) => ({
      ...prev,
      marcaEquipo: '',
      modeloEquipo: '',
      numeroSerie: '',
      diagnosticoPropietario: '',
      servicios: {
        formateo: false,
        mantencionFisica: false,
        mantencionLogica: false,
      },
      aceptaTerminos: false,
    }));

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const agregarOtroEquipo = () => {
    setConfirmacion(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nuevaInscripcion = () => {
    setFormData({ ...formularioInicial });
    setJornadaId('');
    setConfirmacion(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (confirmacion) {
    return (
      <div className="cp-qr" data-cp-qr-theme={modoOscuro ? 'dark' : 'light'} data-bs-theme={modoOscuro ? 'dark' : 'light'}>
        <div className="cp-qr__theme-row">{botonTema}</div>
        <div className="cp-qr__confirmation" aria-live="polite">
          <div className="cp-qr__success-symbol" aria-hidden="true">✓</div>
          <p className="cp-qr__eyebrow">CLÍNICA DEL PC / REGISTRO COMPLETADO</p>
          <h1>¡Preinscripción registrada!</h1>
          <p className="cp-qr__lead">
            Tu equipo quedó preinscrito para la jornada seleccionada.
            Presenta el dispositivo en recepción durante esa jornada.
          </p>

          <section className="cp-qr__receipt" aria-label="Resumen de la preinscripción">
            <div className="cp-qr__receipt-head">
              <div>
                <span className="cp-qr__caption">COMPROBANTE</span>
                <h2>Resumen de la inscripción</h2>
              </div>
              <span className="cp-qr__receipt-status">Registrada</span>
            </div>
            <dl className="cp-qr__receipt-grid">
              <div><dt>Propietario</dt><dd>{confirmacion.nombre}</dd></div>
              <div><dt>Dispositivo</dt><dd>{confirmacion.equipo}</dd></div>
              <div><dt>Región</dt><dd>{confirmacion.region}</dd></div>
              <div><dt>Comuna</dt><dd>{confirmacion.comuna}</dd></div>
              <div><dt>Jornada</dt><dd>{confirmacion.jornada}</dd></div>
              <div>
                <dt>Fecha de registro</dt>
                <dd>{new Date(confirmacion.fechaRegistro).toLocaleString('es-CL')}</dd>
              </div>
              <div className="cp-qr__receipt-id">
                <dt>Número de atención</dt>
                <dd>{confirmacion.atencionId}</dd>
              </div>
            </dl>
          </section>

          {confirmacion.esReingreso && (
            <Alert variant="success" className="cp-qr__notice">
              El equipo fue reconocido como un dispositivo registrado anteriormente.
              Se creó una nueva atención conservando la ficha del dispositivo.
            </Alert>
          )}

          <Alert variant="info" className="cp-qr__notice">
            Esta confirmación corresponde a una <strong>preinscripción</strong>.
            Debes presentar el equipo en recepción durante la jornada para continuar la atención.
          </Alert>

          <div className="cp-qr__receipt-actions">
            <Button variant="danger" className="cp-qr__primary" onClick={agregarOtroEquipo}>
              Agregar otro dispositivo
            </Button>
            <Button variant="outline-secondary" className="cp-qr__secondary" onClick={nuevaInscripcion}>
              Nueva inscripción
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-qr" data-cp-qr-theme={modoOscuro ? 'dark' : 'light'} data-bs-theme={modoOscuro ? 'dark' : 'light'}>
      <header className="cp-qr__intro">
        <div className="cp-qr__intro-text">
          <span className="cp-qr__eyebrow">CLÍNICA DEL PC / INSCRIPCIÓN</span>
          <h1>Preinscripción de equipos</h1>
          <p>
            Selecciona una jornada y registra tus datos y los del dispositivo
            para solicitar una atención.
          </p>
        </div>
        <div className="cp-qr__header-actions">
          {botonTema}
          <div className="cp-qr__steps-label" aria-label="Formulario de cuatro pasos">
            <span className="cp-qr__steps-icon" aria-hidden="true">✓</span>
            <span><strong>4 pasos</strong><small>Formulario de inscripción</small></span>
          </div>
        </div>
      </header>

      <Alert variant="secondary" className="small" role="note">
        <strong>Demostración académica:</strong> usa datos ficticios. La información se
        guarda únicamente en este navegador; no ingreses RUT ni contactos reales.
      </Alert>

      {error && (
        <Alert variant="danger" role="alert" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} className="cp-qr__form">
        <section className="cp-qr__section" aria-labelledby="qr-paso-jornada">
          <div className="cp-qr__section-header">
            <span className="cp-qr__step-number" aria-hidden="true">01</span>
            <div>
              <h2 id="qr-paso-jornada">Jornada de atención</h2>
              <p>Elige la fecha en que llevarás tu equipo a la clínica.</p>
            </div>
          </div>
          <div className="cp-qr__section-body">
            <Form.Group controlId="qr-jornada">
              <Form.Label>Selecciona la jornada <span aria-hidden="true">*</span></Form.Label>
              <Form.Select
                required
                value={jornadaId}
                onChange={(e) => setJornadaId(e.target.value)}
              >
                <option value="">Seleccione una jornada...</option>
                {jornadasDisponibles.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.periodo} — {j.fecha}{' '}
                    ({etiquetasEstadoJornada[obtenerEstadoJornada(j)]})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            {!jornadasDisponibles.length && (
              <Alert variant="warning" className="mt-3 mb-0">
                No hay jornadas disponibles para preinscripción.
              </Alert>
            )}
          </div>
        </section>

        <section className="cp-qr__section" aria-labelledby="qr-paso-propietario">
          <div className="cp-qr__section-header">
            <span className="cp-qr__step-number" aria-hidden="true">02</span>
            <div>
              <h2 id="qr-paso-propietario">Datos del propietario</h2>
              <p>Ingresa la información de contacto de quien llevará el equipo.</p>
            </div>
          </div>
          <div className="cp-qr__section-body">
            <DatosPersonales formData={formData} onChange={handleChange} modoOscuro={modoOscuro} />
          </div>
        </section>

        <div className="cp-qr__embedded" aria-label="Paso 3: Datos del dispositivo">
          <DatosEquipo
            formData={formData}
            onChange={handleChange}
            modoOscuro={modoOscuro}
            numeroPaso="03"
          />
        </div>

        <div className="cp-qr__embedded" aria-label="Paso 4: Consentimiento">
          <TerminosLegales
            formData={formData}
            onChange={handleChange}
            modoOscuro={modoOscuro}
            numeroPaso="04"
          />
        </div>

        <div className="cp-qr__submit-bar">
          <div>
            <strong>Antes de finalizar</strong>
            <p>Revisa tus datos, el servicio solicitado y las condiciones de atención.</p>
          </div>
          <Button
            type="submit"
            variant="danger"
            size="lg"
            className="cp-qr__primary"
            disabled={!jornadasDisponibles.length}
          >
            Registrar preinscripción
          </Button>
        </div>
      </Form>
    </div>
  );
}
