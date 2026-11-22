import { Fragment, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import DetalleAtencion from './historial/DetalleAtencion.jsx';
import { estadoTicket, etiquetasTicket } from '../utils/seguimiento.js';
import './historial/HistorialVisual.css';

const estados = {
  preinscrito: { nombre: 'Preinscrito', color: 'secondary' },
  asignado: { nombre: 'Asignado', color: 'warning' },
  en_proceso: { nombre: 'En proceso', color: 'info' },
  listo_entrega: { nombre: 'Listo para entrega', color: 'primary' },
  contactado: { nombre: 'Contactado', color: 'primary' },
  entregado: { nombre: 'Entregado', color: 'success' },
  no_presentado: { nombre: 'No presentado', color: 'danger' },
  cancelado: { nombre: 'Cancelado', color: 'secondary' },
};

const estadosActivos = [
  'preinscrito', 'asignado', 'en_proceso', 'listo_entrega', 'contactado',
];

const obtenerClave = (registro) =>
  registro.dispositivo?.id || `sin-dispositivo-${registro.id}`;

const ordenarAtenciones = (a, b) => {
  const fechaA = a.jornada?.fecha || '';
  const fechaB = b.jornada?.fecha || '';

  return fechaB.localeCompare(fechaA) ||
    (b.fechaPreinscripcion || '').localeCompare(a.fechaPreinscripcion || '');
};

function EstadoBadge({ valor }) {
  const estado = estados[valor] || { nombre: valor || 'Sin estado', color: 'secondary' };

  return (
    <Badge bg={estado.color} className="hist-status"
      text={['warning', 'info'].includes(estado.color) ? 'dark' : undefined}>
      {estado.nombre}
    </Badge>
  );
}

function TicketBadge({ atencion }) {
  const estado = estadoTicket(atencion);
  const color = estado === 'cerrado' ? 'success' : estado === 'incidencia' ? 'danger' : 'warning';
  return <Badge bg={color} text={color === 'warning' ? 'dark' : undefined}>
    {etiquetasTicket[estado] || estado}
  </Badge>;
}

function nombrePropietario(propietario) {
  if (!propietario) return 'Sin propietario';
  return [
    propietario.nombre,
    propietario.apellidoPaterno,
    propietario.apellidoMaterno,
  ].filter(Boolean).join(' ');
}

function nombreDispositivo(dispositivo) {
  if (!dispositivo) return 'Sin dispositivo';
  return [dispositivo.marca, dispositivo.modelo].filter(Boolean).join(' ') ||
    'Equipo sin identificar';
}

function IconoBusqueda() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function IconoArchivo() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export default function HistorialConsultas({ modoOscuro, periodoGlobal = 'Todos', puedeGestionarSeguimiento = false, usuarioId = '' }) {
  const { datos } = useClinica();

  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [grupoAbiertoId, setGrupoAbiertoId] = useState(null);
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  // Relacionar atenciones con dispositivos, propietarios y jornadas.
  const registros = datos.atenciones.map((atencion) => {
    const dispositivo = datos.dispositivos.find(
      (d) => d.id === atencion.dispositivoId
    );

    const propietario = datos.propietarios.find(
      (p) => p.id === dispositivo?.propietarioId
    );

    const jornada = datos.jornadas.find(
      (j) => j.id === atencion.jornadaId
    );

    return { ...atencion, dispositivo, propietario, jornada };
  });

  // Índice histórico completo por dispositivo, sin aplicar filtros.
  const visitasPorDispositivo = new Map();

  registros.forEach((registro) => {
    const clave = obtenerClave(registro);
    if (!visitasPorDispositivo.has(clave)) {
      visitasPorDispositivo.set(clave, []);
    }

    visitasPorDispositivo.get(clave).push(registro);
  });

  visitasPorDispositivo.forEach((visitas) => {
    visitas.sort(ordenarAtenciones);
  });

  // Los filtros determinan qué dispositivos aparecen en el listado.
  const filtrados = registros.filter((registro) => {
    const { propietario, dispositivo, jornada } = registro;

    const texto = [
      registro.id, propietario?.rut,
      propietario?.nombre, propietario?.apellidoPaterno,
      propietario?.apellidoMaterno,
      dispositivo?.id, dispositivo?.marca,
      dispositivo?.modelo, dispositivo?.numeroSerie,
    ].filter(Boolean).join(' ').toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.trim().toLowerCase());
    const coincidePeriodo = periodoGlobal === 'Todos' ||
      jornada?.periodo === periodoGlobal;
    const coincideEstado = estadoFiltro === 'Todos' ||
      registro.estado === estadoFiltro;
    const coincideInicio = !fechaInicio ||
      (jornada?.fecha && jornada.fecha >= fechaInicio);
    const coincideFin = !fechaFin ||
      (jornada?.fecha && jornada.fecha <= fechaFin);

    return coincideBusqueda && coincidePeriodo && coincideEstado &&
      coincideInicio && coincideFin;
  }).sort(ordenarAtenciones);

  // Agrupar los resultados filtrados por el ID del dispositivo.
  const gruposMap = new Map();

  filtrados.forEach((registro) => {
    const clave = obtenerClave(registro);

    if (!gruposMap.has(clave)) {
      gruposMap.set(clave, {
        id: clave,
        dispositivo: registro.dispositivo,
        propietario: registro.propietario,
        coincidencias: [],
        visitas: visitasPorDispositivo.get(clave) || [],
      });
    }

    gruposMap.get(clave).coincidencias.push(registro);
  });

  const grupos = Array.from(gruposMap.values());

  const seleccionado = registros.find((r) => r.id === seleccionadoId);
  const visitasSeleccionado = seleccionado
    ? visitasPorDispositivo.get(obtenerClave(seleccionado)) || [seleccionado]
    : [];

  const entregados = filtrados.filter((r) => r.estado === 'entregado').length;
  const activos = filtrados.filter((r) => estadosActivos.includes(r.estado) || (r.estado === 'entregado' && estadoTicket(r) !== 'cerrado')).length;

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('Todos');
    setFechaInicio('');
    setFechaFin('');
    setGrupoAbiertoId(null);
  };

  const serviciosDe = (registro) => {
    const nombres = (registro.servicioIds || []).map((id) =>
      datos.servicios.find((s) => s.id === id)?.nombre || id
    );

    return nombres.join(', ') || 'No informado';
  };

  // Solo identifica técnicos asignados a la atención; no atribuye quién ejecutó cada tarea.
  const tecnicosDe = (registro) =>
    (registro?.tecnicoIds || [])
      .map((id) => datos.usuarios.find((usuario) => usuario.id === id)?.nombre || id)
      .join(', ') || 'Sin asignar';

  // Las visitas se muestran completas incluso si el usuario filtró un solo período.
  const tablaVisitas = (visitas) => (
    <Table responsive hover size="sm" variant={modoOscuro ? 'dark' : 'light'}
      className="hist-table hist-table--visitas align-middle mb-0">
      <thead>
        <tr>
          <th>Atención</th>
          <th>Jornada</th>
          <th>Período</th>
          <th>Técnico asignado</th>
          <th>Servicio</th>
          <th>Estado del equipo</th>
          <th>Estado del ticket</th>
          <th className="text-end">Acción</th>
        </tr>
      </thead>
      <tbody>
        {visitas.map((visita) => (
          <tr key={visita.id}>
            <td><span className="hist-id" title={visita.id}>{visita.id.slice(0, 12)}...</span></td>
            <td>{visita.jornada?.fecha || 'Sin fecha'}</td>
            <td>{visita.jornada?.periodo || 'Sin período'}</td>
            <td>{tecnicosDe(visita)}</td>
            <td>{serviciosDe(visita)}</td>
            <td><EstadoBadge valor={visita.estado} /></td>
            <td><TicketBadge atencion={visita} /></td>
            <td className="text-end">
              <Button size="sm" className={`hist-btn ${seleccionadoId === visita.id ? 'hist-btn--red' : 'hist-btn--outline'}`}
                variant="link" onClick={() => setSeleccionadoId(visita.id)}>
                Ver ficha <span aria-hidden="true">↗</span>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <div className={`hc ${modoOscuro ? 'hc--dark' : 'hc--light'}`}>
      <header className="hist-page-header">
        <div>
          <p className="hist-eyebrow">CLÍNICA DEL PC / CONSULTAS</p>
          <h1>Historial y consultas</h1>
          <p className="hist-subtitle">Consulta dispositivos, atenciones anteriores y seguimiento de visitas.</p>
        </div>
        <div className="hist-period-tag">
          <span>Período académico</span>
          <strong>{periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}</strong>
        </div>
      </header>

      {seleccionado ? (
        <>
          <Card className="hist-card hist-card--history">
            <Card.Header className="hist-card__header hist-card__header--between">
              <div>
                <p className="hist-eyebrow">HISTORIAL COMPLETO</p>
                <h2>Historial del dispositivo</h2>
              </div>
              <Button variant="link" className="hist-btn hist-btn--outline"
                onClick={() => setSeleccionadoId(null)}>
                ← Volver a resultados
              </Button>
            </Card.Header>
            <Card.Body className="hist-card__body">
              <div className="hist-device-summary">
                <div>
                  <p className="hist-label">EQUIPO REGISTRADO</p>
                  <h3>{nombreDispositivo(seleccionado.dispositivo)}</h3>
                  <p>{nombrePropietario(seleccionado.propietario)}</p>
                  <span className="hist-id">ID del dispositivo: {seleccionado.dispositivo?.id || 'No disponible'}</span>
                </div>
                <span className="hist-count-pill">
                  {visitasSeleccionado.length} {visitasSeleccionado.length === 1 ? 'atención histórica' : 'atenciones históricas'}
                </span>
              </div>
              <Alert variant="info" className="hist-note mb-3">
                Se incluyen todas las visitas de este dispositivo, aunque correspondan a otros períodos académicos.
              </Alert>
              <div className="hist-table-area">{tablaVisitas(visitasSeleccionado)}</div>
            </Card.Body>
          </Card>

          <DetalleAtencion registro={seleccionado} datos={datos}
            modoOscuro={modoOscuro} onVolver={() => setSeleccionadoId(null)}
            puedeGestionarSeguimiento={puedeGestionarSeguimiento} usuarioId={usuarioId} />
        </>
      ) : (
        <>
          <Card className="hist-card hist-card--filters">
            <Card.Header className="hist-card__header">
              <span className="hist-head-symbol"><IconoBusqueda /></span>
              <div>
                <h2>Buscar y filtrar dispositivos</h2>
                <p>Encuentra un equipo por propietario, RUT, serie o número de atención.</p>
              </div>
            </Card.Header>
            <Card.Body className="hist-card__body">
              <Row className="g-3">
                <Col lg={6}>
                  <Form.Group controlId="hist-busqueda">
                    <Form.Label>Buscar registro</Form.Label>
                    <Form.Control value={busqueda} className="hist-control"
                      placeholder="RUT, propietario, equipo, serie o atención"
                      onChange={(e) => setBusqueda(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col lg={3}>
                  <Form.Group controlId="hist-estado">
                    <Form.Label>Estado de la atención</Form.Label>
                    <Form.Select value={estadoFiltro} className="hist-control"
                      onChange={(e) => setEstadoFiltro(e.target.value)}>
                      <option value="Todos">Todos los estados</option>
                      {Object.entries(estados).map(([clave, estado]) => (
                        <option key={clave} value={clave}>{estado.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={3}>
                  <Form.Group controlId="hist-periodo">
                    <Form.Label>Período</Form.Label>
                    <Form.Control value={periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}
                      readOnly className="hist-control hist-control--readonly" />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="hist-inicio">
                    <Form.Label>Jornada desde</Form.Label>
                    <Form.Control type="date" value={fechaInicio} className="hist-control"
                      max={fechaFin || undefined}
                      onChange={(e) => setFechaInicio(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="hist-fin">
                    <Form.Label>Jornada hasta</Form.Label>
                    <Form.Control type="date" value={fechaFin} className="hist-control"
                      min={fechaInicio || undefined}
                      onChange={(e) => setFechaFin(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="link" className="hist-btn hist-btn--outline hist-btn--full"
                    onClick={limpiarFiltros}>Limpiar filtros</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <section className="hist-stats" aria-label="Indicadores del historial filtrado">
            <div className="hist-stat hist-stat--devices">
              <span>Dispositivos</span><strong>{grupos.length}</strong><small>Equipos encontrados</small>
            </div>
            <div className="hist-stat hist-stat--visits">
              <span>Atenciones filtradas</span><strong>{filtrados.length}</strong><small>Coinciden con los filtros</small>
            </div>
            <div className="hist-stat hist-stat--delivered">
              <span>Entregados</span><strong>{entregados}</strong><small>Equipos entregados físicamente</small>
            </div>
            <div className="hist-stat hist-stat--active">
              <span>Tickets abiertos</span><strong>{activos}</strong><small>Incluye equipos entregados sin cierre</small>
            </div>
          </section>

          <Card className="hist-card hist-card--list">
            <Card.Header className="hist-card__header hist-card__header--between">
              <div>
                <p className="hist-eyebrow">REGISTROS</p>
                <h2>Dispositivos y visitas registradas</h2>
              </div>
              <span className="hist-count-pill">{grupos.length} {grupos.length === 1 ? 'dispositivo' : 'dispositivos'}</span>
            </Card.Header>
            <Card.Body className="hist-card__body hist-card__body--flush">
              {grupos.length > 0 ? (
                <div className="hist-table-area">
                  <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}
                    className="hist-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Propietario</th>
                        <th>Dispositivo</th>
                        <th>Serie</th>
                        <th>Visitas totales</th>
                        <th>Última jornada</th>
                        <th>Técnico asignado</th>
                        <th>Último estado físico</th>
                         <th>Estado del ticket</th>
                        <th className="text-end">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grupos.map((grupo) => {
                        const ultima = grupo.visitas[0];
                        const abierto = grupoAbiertoId === grupo.id;

                        return (
                          <Fragment key={grupo.id}>
                            <tr>
                              <td>
                                <strong className="hist-cell-title">{nombrePropietario(grupo.propietario)}</strong>
                                <span className="hist-cell-subtitle">{grupo.propietario?.rut || ''}</span>
                              </td>
                              <td>
                                <strong className="hist-cell-title">{nombreDispositivo(grupo.dispositivo)}</strong>
                                <span className="hist-cell-subtitle" title={grupo.dispositivo?.id}>
                                  {grupo.dispositivo?.id?.slice(0, 18) || 'Sin ID'}
                                </span>
                              </td>
                              <td>{grupo.dispositivo?.numeroSerie || 'No informada'}</td>
                              <td><span className="hist-count-pill hist-count-pill--small">
                                {grupo.visitas.length} {grupo.visitas.length === 1 ? 'visita' : 'visitas'}
                              </span></td>
                              <td>{ultima?.jornada?.fecha || 'Sin fecha'}</td>
                              <td>{tecnicosDe(ultima)}</td>
                              <td><EstadoBadge valor={ultima?.estado} /></td>
                              <td><TicketBadge atencion={ultima} /></td>
                              <td className="text-end">
                                <Button size="sm" variant="link" className="hist-btn hist-btn--outline"
                                  aria-expanded={abierto}
                                  aria-label={`${abierto ? 'Ocultar' : 'Ver'} visitas de ${nombreDispositivo(grupo.dispositivo)}`}
                                  onClick={() => setGrupoAbiertoId(abierto ? null : grupo.id)}>
                                  {abierto ? 'Ocultar visitas' : 'Ver visitas'}
                                  <span aria-hidden="true">{abierto ? '⌃' : '⌄'}</span>
                                </Button>
                              </td>
                            </tr>
                            {abierto && (
                              <tr className="hist-expanded-row">
                                <td colSpan={9}>
                                  <div className="hist-expanded">
                                    <div className="hist-expanded__heading">
                                      <strong>Historial completo · {nombreDispositivo(grupo.dispositivo)}</strong>
                                      <span>{grupo.coincidencias.length} {grupo.coincidencias.length === 1 ? 'coincidencia' : 'coincidencias'} con los filtros</span>
                                    </div>
                                    {tablaVisitas(grupo.visitas)}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="hist-empty">
                  <span className="hist-empty__icon"><IconoArchivo /></span>
                  <h3>{registros.length === 0 ? 'Todavía no hay atenciones registradas' : 'No encontramos dispositivos'}</h3>
                  <p>{registros.length === 0
                    ? 'Las atenciones aparecerán aquí cuando se registren en el sistema.'
                    : 'Prueba con otro RUT, estado, período o rango de fechas.'}</p>
                  {registros.length > 0 && (
                    <Button variant="link" className="hist-btn hist-btn--outline"
                      onClick={limpiarFiltros}>Restablecer filtros</Button>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          {registros.length === 0 && (
            <Alert variant="info" className="hist-note">Todavía no existen atenciones registradas.</Alert>
          )}
        </>
      )}
    </div>
  );
}
