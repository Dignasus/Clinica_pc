import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import './recepcion/AtencionVisual.css';
import { useClinica } from '../context/clinicaContextBase.js';
import { personalTecnico } from '../data/roles.js';
import { fechaLocal, obtenerEstadoJornada, etiquetasEstadoJornada } from '../utils/jornadas.js';

const normalizar = (valor) =>
  String(valor || '').toLowerCase().replace(/[.\s-]/g, '');

export default function RecepcionEquipos({
  modoOscuro, periodoGlobal = 'Todos', seleccionInicial = null,
}) {
  const { datos, dispatch } = useClinica();

  const [rutBusqueda, setRutBusqueda] = useState(() => seleccionInicial?.rut || '');
  const [seleccionId, setSeleccionId] = useState(() => seleccionInicial?.atencionId || null);
  const [tecnicoId, setTecnicoId] = useState('');
  const [aviso, setAviso] = useState(() => seleccionInicial
    ? { tipo: 'success', texto: 'Registro presencial guardado. Selecciona el técnico para completar la recepción.' }
    : null
  );

  const tecnicos = personalTecnico(datos);

  const pendientes = datos.atenciones
    .filter((a) => a.estado === 'preinscrito')
    .map((atencion) => {
      const dispositivo = datos.dispositivos.find((d) => d.id === atencion.dispositivoId);
      const propietario = datos.propietarios.find((p) => p.id === dispositivo?.propietarioId);
      const jornada = datos.jornadas.find((j) => j.id === atencion.jornadaId);

      if (!dispositivo || !propietario || !jornada) return null;
      if (periodoGlobal !== 'Todos' && jornada.periodo !== periodoGlobal) return null;

      return {
        id: atencion.id,
        rut: propietario.rut,
        nombre: [propietario.nombre, propietario.apellidoPaterno,
          propietario.apellidoMaterno].filter(Boolean).join(' '),
        equipo: `${dispositivo.marca} ${dispositivo.modelo}`,
        falla: atencion.diagnosticoPropietario || 'No informada',
        servicios: (atencion.servicioIds || [])
          .map((id) => datos.servicios.find((s) => s.id === id)?.nombre || id)
          .join(', '),
        jornada: jornada.fecha,
        periodo: jornada.periodo,
        estadoJornada: obtenerEstadoJornada(jornada),
        origen: atencion.origenRegistro || 'qr',
      };
    })
    .filter(Boolean);

  const filtrados = pendientes.filter((equipo) =>
    normalizar(equipo.rut).includes(normalizar(rutBusqueda)) ||
    normalizar(equipo.nombre).includes(normalizar(rutBusqueda))
  );

  const seleccionado = pendientes.find((equipo) => equipo.id === seleccionId);
  const puedeRecibir = seleccionado?.jornada === fechaLocal() &&
    seleccionado?.estadoJornada === 'activa';

  const seleccionarEquipo = (equipo) => {
    setSeleccionId(equipo.id);
    setRutBusqueda(equipo.rut);
    setTecnicoId('');
    setAviso(null);
  };

  const buscarCliente = (e) => {
    e.preventDefault();

    if (filtrados.length === 1) {
      seleccionarEquipo(filtrados[0]);
    } else if (filtrados.length > 1) {
      setSeleccionId(null);
      setAviso({
        tipo: 'info',
        texto: 'Se encontraron varios dispositivos. Selecciona el equipo correspondiente.',
      });
    } else {
      setSeleccionId(null);
      setAviso({
        tipo: 'warning',
        texto: 'No hay preinscripciones con esos datos. Usa Registrar sin QR en el menú izquierdo.',
      });
    }
  };

  const asignarEquipo = (e) => {
    e.preventDefault();

    if (!seleccionado || !puedeRecibir) {
      setAviso({
        tipo: 'warning',
        texto: 'La jornada debe estar iniciada y corresponder a la fecha de hoy.',
      });
      return;
    }

    if (!tecnicos.some((t) => t.id === tecnicoId)) {
      setAviso({ tipo: 'warning', texto: 'Selecciona un técnico válido.' });
      return;
    }

    dispatch({
      type: 'ASIGNAR_TECNICO',
      payload: {
        atencionId: seleccionado.id,
        tecnicoId,
        fechaRecepcion: new Date().toISOString(),
      },
    });

    setSeleccionId(null);
    setRutBusqueda('');
    setTecnicoId('');
    setAviso({
      tipo: 'success',
      texto: 'Dispositivo recepcionado y asignado correctamente.',
    });
  };

  return (
    <section className="cp-flow cp-reception" data-cp-theme={modoOscuro ? 'dark' : 'light'}>
      <div className="cp-page-header">
        <div className="cp-page-heading">
          <div className="cp-eyebrow">CLÍNICA DEL PC / OPERACIONES</div>
          <h1>Recepción de equipos</h1>
          <p>Busca preinscripciones, verifica los datos del dispositivo y asígnalo a un técnico.</p>
        </div>
        <div className="cp-header-meta" aria-label="Resumen de la recepción">
          <span className="cp-period-chip">Período: {periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}</span>
          <span className="cp-count-chip"><strong>{pendientes.length}</strong> pendientes</span>
        </div>
      </div>

      {aviso && (
        <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)} className="cp-notice">
          {aviso.texto}
        </Alert>
      )}

      <Row className="g-3 g-xl-4 align-items-start">
        <Col lg={7}>
          <Card className="cp-card">
            <Card.Header className="cp-section-head">
              <span className="cp-step">01</span>
              <div className="cp-section-heading">
                <h2>Buscar preinscripción</h2>
                <p>Encuentra una atención pendiente por RUT o nombre.</p>
              </div>
            </Card.Header>
            <Card.Body className="cp-section-body">
              <Form onSubmit={buscarCliente} className="cp-search-form">
                <Form.Label htmlFor="cp-rut-busqueda" className="cp-field-label">RUT o nombre del propietario</Form.Label>
                <div className="cp-search-row">
                  <Form.Control
                    id="cp-rut-busqueda"
                    value={rutBusqueda}
                    placeholder="Ej.: 12.345.678-9 o nombre"
                    onChange={(e) => {
                      setRutBusqueda(e.target.value);
                      setSeleccionId(null);
                    }}
                  />
                  <Button type="submit" className="cp-primary-button">Buscar</Button>
                </div>
              </Form>

              <div className="cp-list-heading">
                <div>
                  <h3>Equipos pendientes</h3>
                  <p>Selecciona el equipo que llegó a la clínica.</p>
                </div>
                <span className="cp-list-count">{filtrados.length} resultado{filtrados.length === 1 ? '' : 's'}</span>
              </div>

              <Table responsive hover className="cp-results-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>RUT</th>
                    <th>Propietario</th>
                    <th>Equipo</th>
                    <th>Jornada</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((equipo) => (
                    <tr key={equipo.id} className={seleccionId === equipo.id ? 'cp-row-selected' : ''}>
                      <td className="cp-cell-nowrap">{equipo.rut}</td>
                      <td className="cp-cell-strong">{equipo.nombre}</td>
                      <td>{equipo.equipo}</td>
                      <td className="cp-cell-nowrap">{equipo.jornada}</td>
                      <td className="text-end">
                        <Button
                          size="sm"
                          className="cp-outline-button"
                          onClick={() => seleccionarEquipo(equipo)}
                        >
                          {seleccionId === equipo.id ? 'Seleccionado' : 'Seleccionar'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <div className="cp-table-empty">
                          <span className="cp-empty-symbol" aria-hidden="true">⌕</span>
                          <strong>No hay equipos pendientes</strong>
                          <p>No encontramos coincidencias para esta búsqueda y período.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          {seleccionado ? (
            <Card className="cp-card cp-assignment-card">
              <Card.Header className="cp-section-head">
                <span className="cp-step">02</span>
                <div className="cp-section-heading">
                  <h2>Recepción y asignación</h2>
                  <p>Revisa los datos antes de confirmar.</p>
                </div>
              </Card.Header>
              <Card.Body className="cp-section-body">
                <div className="cp-selected-owner">
                  <span className="cp-owner-label">PROPIETARIO</span>
                  <h3>{seleccionado.nombre}</h3>
                  <span>{seleccionado.rut}</span>
                </div>

                <dl className="cp-detail-list">
                  <div><dt>Equipo</dt><dd>{seleccionado.equipo}</dd></div>
                  <div><dt>Falla informada</dt><dd>{seleccionado.falla}</dd></div>
                  <div><dt>Servicios</dt><dd>{seleccionado.servicios || 'No informados'}</dd></div>
                  <div><dt>Período</dt><dd>{seleccionado.periodo}</dd></div>
                  <div><dt>Jornada</dt><dd>{seleccionado.jornada}</dd></div>
                  <div><dt>Origen</dt><dd>{seleccionado.origen === 'presencial' ? 'Presencial' : 'Preinscripción QR'}</dd></div>
                  <div>
                    <dt>Estado de jornada</dt>
                    <dd>
                      <Badge bg={puedeRecibir ? 'success' : 'secondary'}>
                        {etiquetasEstadoJornada[seleccionado.estadoJornada] || seleccionado.estadoJornada}
                      </Badge>
                    </dd>
                  </div>
                </dl>

                {!puedeRecibir && (
                  <Alert variant="warning" className="cp-notice">
                    Para recepcionar este dispositivo, la jornada debe estar iniciada y corresponder a la fecha de hoy.
                  </Alert>
                )}

                <Form onSubmit={asignarEquipo}>
                  <Form.Group className="mb-3" controlId="cp-tecnico-asignado">
                    <Form.Label className="cp-field-label">Asignar técnico <span className="cp-required">*</span></Form.Label>
                    <Form.Select
                      required
                      value={tecnicoId}
                      disabled={!puedeRecibir}
                      onChange={(e) => setTecnicoId(e.target.value)}
                    >
                      <option value="">Seleccione técnico...</option>
                      {tecnicos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Button
                    type="submit"
                    className="cp-primary-button cp-wide-button"
                    disabled={!puedeRecibir || !tecnicoId}
                  >
                    Confirmar recepción y asignar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className="cp-card cp-waiting-card">
              <Card.Body className="cp-waiting-content">
                <div className="cp-waiting-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="14" rx="2" />
                    <path d="M8 22h8M12 18v4M8 10h8M8 13h5" />
                  </svg>
                </div>
                <span className="cp-eyebrow">SIGUIENTE PASO</span>
                <h2>Recepción y asignación</h2>
                <p>Selecciona un dispositivo de la lista para revisar su ficha y asignarle un técnico.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </section>
  );
}
