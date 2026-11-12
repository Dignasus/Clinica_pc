
import { useState } from 'react';
import { Alert, Badge, Button, Card, Form } from 'react-bootstrap';

import DatosPersonales from '../inscripcion/DatosPersonales.jsx';
import DatosEquipo from '../inscripcion/DatosEquipo.jsx';
import TerminosLegales from '../inscripcion/TerminosLegales.jsx';

import { useClinica } from '../../context/clinicaContextBase.js';
import { normalizarRut, validarRut } from '../../utils/rut.js';
import { fechaLocal, obtenerEstadoJornada } from '../../utils/jornadas.js';
import {
  encontrarRegionDeComuna,
  comunasDeRegion,
} from '../../data/regionesChile.js';
import {
  buscarDispositivoPrevio,
  normalizarRutIdentidad,
  obtenerVisitasDispositivo,
} from '../../utils/dispositivos.js';

// Datos iniciales del formulario
const formularioBase = {
  rut: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  telefono: '',
  correo: '',
  region: '',
  comuna: '',
  sector: '',
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
};

// Estados que no mantienen una atención técnica abierta
const estadosFinales = new Set([
  'entregado',
  'no_presentado',
  'cancelado',
]);

const normalizarTexto = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

// Recuperar los datos guardados de un propietario
function datosPropietario(propietario) {
  if (!propietario) return {};

  const region =
    propietario.region ||
    encontrarRegionDeComuna(propietario.comuna) ||
    '';

  const comuna =
    comunasDeRegion(region).find(
      (c) =>
        normalizarTexto(c) === normalizarTexto(propietario.comuna)
    ) || '';

  return {
    nombre: propietario.nombre || '',
    apellidoPaterno: propietario.apellidoPaterno || '',
    apellidoMaterno: propietario.apellidoMaterno || '',
    telefono: propietario.telefono || '',
    correo: propietario.correo || '',
    region,
    comuna,
    sector: propietario.sector || '',
  };
}

function nombreEquipo(equipo) {
  return (
    [equipo.marca, equipo.modelo]
      .filter(Boolean)
      .join(' ') || 'Equipo sin identificar'
  );
}

// Recuperar visitas de un dispositivo, ordenadas por jornada
function ultimaVisita(datos, dispositivoId) {
  const visitas = obtenerVisitasDispositivo(
    datos.atenciones,
    dispositivoId
  )
    .map((atencion) => ({
      ...atencion,
      jornada: datos.jornadas.find(
        (j) => j.id === atencion.jornadaId
      ),
    }))
    .sort(
      (a, b) =>
        (b.jornada?.fecha || '').localeCompare(
          a.jornada?.fecha || ''
        ) ||
        (b.fechaPreinscripcion || '').localeCompare(
          a.fechaPreinscripcion || ''
        )
    );

  return {
    visitas,
    ultima: visitas[0] || null,
  };
}

export default function RegistroPresencial({
  rutInicial = '',
  periodoGlobal = 'Todos',
  modoOscuro = false,
  onCancelar,
  onRegistrado,
}) {
  const { datos, dispatch } = useClinica();

  // Buscar propietario por RUT normalizado
  const buscarPropietario = (rut) => {
    const identidad = normalizarRutIdentidad(rut);

    if (!identidad) return null;

    return (
      datos.propietarios.find(
        (p) =>
          normalizarRutIdentidad(p.rut) === identidad
      ) || null
    );
  };

  const propietarioInicial = buscarPropietario(rutInicial);

  // Solo jornadas iniciadas en la fecha actual
  const jornadasAbiertas = datos.jornadas.filter(
    (j) =>
      j.fecha === fechaLocal() &&
      obtenerEstadoJornada(j) === 'activa' &&
      (periodoGlobal === 'Todos' ||
        j.periodo === periodoGlobal)
  );

  const [formData, setFormData] = useState(() => ({
    ...formularioBase,
    ...datosPropietario(propietarioInicial),
    rut: rutInicial || propietarioInicial?.rut || '',
  }));

  const [jornadaId, setJornadaId] = useState(
    () => jornadasAbiertas[0]?.id || ''
  );

  const [dispositivoAnteriorId, setDispositivoAnteriorId] =
    useState('');

  const [error, setError] = useState('');

  // Detectar propietario existente
  const propietarioActual = buscarPropietario(formData.rut);

  // Dispositivos asociados al propietario
  const dispositivosAnteriores = datos.dispositivos.filter(
    (d) => d.propietarioId === propietarioActual?.id
  );

  // Dispositivo seleccionado manualmente
  const seleccionadoAnterior = dispositivosAnteriores.find(
    (d) => d.id === dispositivoAnteriorId
  );

  // Búsqueda automática por número de serie
  const detectadoPorSerie = buscarDispositivoPrevio(
    datos.dispositivos,
    propietarioActual?.id,
    {
      marca: formData.marcaEquipo,
      numeroSerie: formData.numeroSerie,
    }
  );

  const equipoReutilizado =
    seleccionadoAnterior || detectadoPorSerie;

  const { visitas: visitasPrevias } = equipoReutilizado
    ? ultimaVisita(datos, equipoReutilizado.id)
    : { visitas: [] };

  // Estilos
  const cardClass = `shadow-sm border-0 mb-4 ${
    modoOscuro ? 'bg-dark text-light' : ''
  }`;

  const headerClass = `fw-bold py-3 ${
    modoOscuro ? 'bg-secondary text-light' : 'bg-white'
  }`;

  const controlClass = modoOscuro
    ? 'bg-dark text-light'
    : '';

  // Cambios de campos y precarga por RUT
  const cambiarDato = (e) => {
    const { name, value, checked, type } = e.target;

    setError('');

    if (name === 'rut') {
      const anterior = buscarPropietario(formData.rut);
      const nuevo = buscarPropietario(value);

      setDispositivoAnteriorId('');

      setFormData((prev) => {
        if (nuevo) {
          const cambioPropietario =
            anterior?.id !== nuevo.id;

          return {
            ...(cambioPropietario ? formularioBase : prev),
            ...datosPropietario(nuevo),
            rut: value,
          };
        }

        if (
          anterior &&
          normalizarRutIdentidad(prev.rut) !==
            normalizarRutIdentidad(value)
        ) {
          return {
            ...formularioBase,
            rut: value,
          };
        }

        return {
          ...prev,
          rut: value,
        };
      });

      return;
    }

    // Servicios, términos y campos generales
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
  };

  // Seleccionar un equipo registrado anteriormente
  const seleccionarDispositivo = (id) => {
    const equipo = dispositivosAnteriores.find(
      (d) => d.id === id
    );

    setDispositivoAnteriorId(id);
    setError('');

    setFormData((prev) => ({
      ...prev,
      marcaEquipo: equipo?.marca || '',
      modeloEquipo: equipo?.modelo || '',
      numeroSerie: equipo?.numeroSerie || '',
    }));
  };

  // Registrar nueva atención
  const registrar = (e) => {
    e.preventDefault();
    setError('');

    const jornada = jornadasAbiertas.find(
      (j) => j.id === jornadaId
    );

    if (!jornada) {
      return setError(
        'Debes seleccionar una jornada iniciada hoy.'
      );
    }

    if (!validarRut(formData.rut)) {
      return setError(
        'El RUT ingresado no es válido.'
      );
    }

    // Validar región y comuna
    const region =
      formData.region ||
      encontrarRegionDeComuna(formData.comuna);

    if (
      !region ||
      !comunasDeRegion(region).includes(formData.comuna)
    ) {
      return setError(
        'Selecciona una región y una comuna válidas.'
      );
    }

    // Servicios seleccionados
    const servicioIds = Object.entries(formData.servicios)
      .filter(([, activo]) => activo)
      .map(([id]) => id);

    if (!servicioIds.length) {
      return setError(
        'Selecciona al menos un servicio.'
      );
    }

    if (!formData.aceptaTerminos) {
      return setError(
        'Debes aceptar los términos y condiciones.'
      );
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

    const propietarioId =
      propietarioActual?.id ||
      `PROP-${crypto.randomUUID()}`;

    // Reconocer dispositivo anterior
    const anterior =
      seleccionadoAnterior ||
      buscarDispositivoPrevio(
        datos.dispositivos,
        propietarioId,
        {
          marca: formData.marcaEquipo,
          numeroSerie: formData.numeroSerie,
        }
      );

    // Verificar datos de un dispositivo seleccionado
    if (seleccionadoAnterior) {
      const campos = [
        [
          seleccionadoAnterior.marca,
          formData.marcaEquipo,
        ],
        [
          seleccionadoAnterior.modelo,
          formData.modeloEquipo,
        ],
        [
          seleccionadoAnterior.numeroSerie,
          formData.numeroSerie,
        ],
      ];

      const datosDiferentes = campos.some(
        ([guardado, ingresado]) =>
          normalizarTexto(guardado) !==
          normalizarTexto(ingresado)
      );

      if (datosDiferentes) {
        return setError(
          'Los datos del equipo seleccionado cambiaron. ' +
          'Vuelve a seleccionarlo o registra un equipo nuevo.'
        );
      }
    }

    // Validaciones de dispositivo recurrente
    if (anterior) {
      const { visitas } = ultimaVisita(
        datos,
        anterior.id
      );

      // Evitar dos atenciones del equipo en la misma jornada
      const duplicada = visitas.some(
        (a) =>
          a.jornadaId === jornada.id &&
          a.estado !== 'cancelado'
      );

      if (duplicada) {
        return setError(
          'Este dispositivo ya tiene una atención en la jornada ' +
          'seleccionada. Consulta su ficha en Recepción o Historial.'
        );
      }

      // Evitar visitas con fechas incoherentes
      const fechaIncoherente = visitas.some(
        (a) =>
          a.estado !== 'cancelado' &&
          a.jornada?.fecha &&
          a.jornada.fecha > jornada.fecha
      );

      if (fechaIncoherente) {
        return setError(
          'Este dispositivo tiene una atención registrada en una ' +
          'jornada posterior. Revisa las fechas en el Historial ' +
          'antes de generar un reingreso.'
        );
      }

      // No permitir reingreso mientras otra visita esté abierta
      const pendiente = visitas.some(
        (a) => !estadosFinales.has(a.estado)
      );

      if (pendiente) {
        return setError(
          'Este dispositivo todavía tiene una atención pendiente. ' +
          'Debes finalizarla antes de registrar una nueva visita.'
        );
      }
    }

    // Identificadores de los nuevos registros
    const rut = normalizarRut(formData.rut);
    const ahora = new Date().toISOString();

    const dispositivoId =
      `DISP-${crypto.randomUUID()}`;

    const atencionId =
      `AT-${crypto.randomUUID()}`;

    // Datos del propietario
    const propietario = {
      id: propietarioId,
      rut,
      nombre: formData.nombre.trim(),
      apellidoPaterno: formData.apellidoPaterno.trim(),
      apellidoMaterno: formData.apellidoMaterno.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim(),
      region,
      comuna: formData.comuna.trim(),
      sector: formData.sector.trim(),
    };

    // Datos del dispositivo
    const dispositivo = {
      id: dispositivoId,
      dispositivoExistenteId: anterior?.id || null,
      propietarioId,
      tipo: 'pendiente',
      marca: formData.marcaEquipo.trim(),
      modelo: formData.modeloEquipo.trim(),
      numeroSerie: formData.numeroSerie.trim(),
    };

    // Nueva atención independiente
    const atencion = {
      id: atencionId,
      dispositivoId,
      jornadaId: jornada.id,
      servicioIds,
      estado: 'preinscrito',
      origenRegistro: 'presencial',
      diagnosticoPropietario:
        formData.diagnosticoPropietario.trim(),
      fechaPreinscripcion: ahora,
      fechaAceptacionTerminos: ahora,
      tecnicoIds: [],
      observaciones: [],
      respuestasChecklist: [],
    };

    // Guardar en el contexto compartido
    dispatch({
      type: 'REGISTRAR_PREINSCRIPCION',
      payload: {
        propietario,
        dispositivo,
        atencion,
      },
    });

    // Regresar a Recepción con la atención seleccionada
    onRegistrado({
      atencionId,
      rut,
      esReingreso: Boolean(anterior),
      visitasPrevias: anterior
        ? obtenerVisitasDispositivo(
            datos.atenciones,
            anterior.id
          ).length
        : 0,
    });
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-danger mb-1">
            Registro presencial
          </h3>

          <p className={
            modoOscuro
              ? 'text-light mb-0'
              : 'text-muted mb-0'
          }>
            Registra un equipo nuevo o una nueva atención
            de un dispositivo existente.
          </p>
        </div>

        <Button
          variant="outline-secondary"
          onClick={onCancelar}
        >
          Volver
        </Button>
      </div>

      <Form onSubmit={registrar}>
        {/* 1. JORNADA */}
        <Card className={cardClass}>
          <Card.Header className={headerClass}>
            1. Jornada de atención
          </Card.Header>

          <Card.Body className="p-4">
            <Form.Label className="fw-bold">
              Jornada iniciada *
            </Form.Label>

            <Form.Select
              required
              value={jornadaId}
              className={controlClass}
              onChange={(e) => {
                setJornadaId(e.target.value);
                setError('');
              }}
            >
              <option value="">
                Seleccione una jornada...
              </option>

              {jornadasAbiertas.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.periodo} — {j.fecha}
                </option>
              ))}
            </Form.Select>

            {!jornadasAbiertas.length && (
              <Alert variant="warning" className="mt-3 mb-0">
                No hay jornadas iniciadas hoy para el
                período seleccionado. Inicia una jornada
                desde Mantenedores.
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* 2. PROPIETARIO */}
        <Card className={cardClass}>
          <Card.Header className={headerClass}>
            2. Datos del propietario
          </Card.Header>

          <Card.Body className="p-4">
            <DatosPersonales
              formData={formData}
              onChange={cambiarDato}
              modoOscuro={modoOscuro}
            />
          </Card.Body>
        </Card>

        {/* PROPIETARIO RECONOCIDO */}
        {propietarioActual && (
          <Alert variant="info">
            <strong>Propietario encontrado:</strong>{' '}
            {propietarioActual.nombre}{' '}
            {propietarioActual.apellidoPaterno}.

            {' '}Tiene {dispositivosAnteriores.length}{' '}
            dispositivos registrados.

            {' '}Sus datos se han precargado automáticamente.
          </Alert>
        )}

        {/* 3. DISPOSITIVOS ANTERIORES */}
        {dispositivosAnteriores.length > 0 && (
          <Card className={cardClass}>
            <Card.Header className={headerClass}>
              3. Dispositivos registrados anteriormente
            </Card.Header>

            <Card.Body className="p-4">
              <Form.Label className="fw-bold">
                ¿El equipo ya fue atendido?
              </Form.Label>

              <Form.Select
                value={dispositivoAnteriorId}
                className={controlClass}
                onChange={(e) =>
                  seleccionarDispositivo(e.target.value)
                }
              >
                <option value="">
                  Registrar nuevo equipo / reconocer por serie
                </option>

                {dispositivosAnteriores.map((equipo) => {
                  const { visitas, ultima } =
                    ultimaVisita(datos, equipo.id);

                  return (
                    <option
                      key={equipo.id}
                      value={equipo.id}
                    >
                      {nombreEquipo(equipo)}
                      {' · '}{equipo.id.slice(0, 13)}
                      {' · '}{visitas.length} visitas
                      {' · '}{ultima?.jornada?.fecha || 'Sin jornada'}
                      {' · '}{(ultima?.estado || 'Sin estado')
                        .replaceAll('_', ' ')}
                    </option>
                  );
                })}
              </Form.Select>

              <p className={`small mt-2 mb-0 ${
                modoOscuro ? 'text-light' : 'text-muted'
              }`}>
                Utiliza el identificador y la última jornada
                para distinguir equipos de la misma marca
                y modelo.
              </p>

              {equipoReutilizado && (
                <div className={`rounded-3 p-3 mt-3 ${
                  modoOscuro
                    ? 'bg-secondary text-light'
                    : 'bg-light'
                }`}>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <strong>
                      {nombreEquipo(equipoReutilizado)}
                    </strong>

                    <Badge bg="info" text="dark">
                      {visitasPrevias.length} visitas anteriores
                    </Badge>
                  </div>

                  <p className="small text-break mb-2">
                    ID: {equipoReutilizado.id}
                  </p>

                  {visitasPrevias.map((visita) => (
                    <div
                      key={visita.id}
                      className="border-top py-2 small"
                    >
                      <strong>
                        {visita.jornada?.periodo || 'Sin período'}
                        {' — '}
                        {visita.jornada?.fecha || 'Sin fecha'}
                      </strong>

                      <div>
                        Estado: {
                          (visita.estado || '')
                            .replaceAll('_', ' ')
                        }
                      </div>

                      <div className="text-break">
                        Atención: {visita.id}
                      </div>
                    </div>
                  ))}

                  <p className="small mb-0 mt-2">
                    Si el reingreso está permitido, se
                    conservará el mismo dispositivo y se
                    creará una atención independiente.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* 4. EQUIPO Y SERVICIOS */}
        <Card className={cardClass}>
          <Card.Header className={headerClass}>
            4. Datos del dispositivo y servicio
          </Card.Header>

          <Card.Body className="p-4">
            <DatosEquipo
              formData={formData}
              onChange={cambiarDato}
              modoOscuro={modoOscuro}
            />
          </Card.Body>
        </Card>

        {/* COINCIDENCIA DE NÚMERO DE SERIE */}
        {detectadoPorSerie && !seleccionadoAnterior && (
          <Alert variant="info">
            Se encontró un dispositivo anterior con ese
            número de serie. Se reutilizará su ficha
            si cumple las reglas de reingreso.
          </Alert>
        )}

        {/* 5. CONSENTIMIENTO */}
        <Card className={cardClass}>
          <Card.Header className={headerClass}>
            5. Consentimiento
          </Card.Header>

          <Card.Body className="p-4">
            <TerminosLegales
              formData={formData}
              onChange={cambiarDato}
              modoOscuro={modoOscuro}
            />
          </Card.Body>
        </Card>

        {/* MENSAJES Y BOTÓN DE REGISTRO */}
        <div className="d-grid gap-3 mb-5">
          {error && (
            <Alert
              variant="danger"
              role="alert"
              className="mb-0"
              dismissible
              onClose={() => setError('')}
            >
              <strong>
                No se pudo completar el registro.
              </strong>

              <p className="mb-0 mt-1">
                {error}
              </p>
            </Alert>
          )}

          <Button
            type="submit"
            size="lg"
            className="fw-bold py-3"
            variant={modoOscuro ? 'light' : 'danger'}
            disabled={!jornadasAbiertas.length}
          >
            {equipoReutilizado
              ? 'Registrar nueva atención del dispositivo'
              : 'Registrar equipo y continuar a recepción'}
          </Button>
        </div>
      </Form>
    </>
  );
}
