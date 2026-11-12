
import { Fragment, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import DetalleAtencion from './historial/DetalleAtencion.jsx';

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
    <Badge bg={estado.color}
      text={['warning', 'info'].includes(estado.color) ? 'dark' : undefined}>
      {estado.nombre}
    </Badge>
  );
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

export default function HistorialConsultas({ modoOscuro, periodoGlobal = 'Todos' }) {
  const { datos } = useClinica();

  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [grupoAbiertoId, setGrupoAbiertoId] = useState(null);
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

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
  const activos = filtrados.filter((r) => estadosActivos.includes(r.estado)).length;

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

  // Tabla reutilizable para mostrar visitas del mismo equipo.
  const tablaVisitas = (visitas) => (
    <Table responsive hover size="sm"
      variant={modoOscuro ? 'dark' : 'light'}
      className="align-middle mb-0">
      <thead>
        <tr>
          <th>Atención</th>
          <th>Jornada</th>
          <th>Período</th>
          <th>Servicio</th>
          <th>Estado</th>
          <th className="text-end">Acción</th>
        </tr>
      </thead>
      <tbody>
        {visitas.map((visita) => (
          <tr key={visita.id}>
            <td>
              <small title={visita.id}>{visita.id.slice(0, 12)}...</small>
            </td>
            <td>{visita.jornada?.fecha || 'Sin fecha'}</td>
            <td>{visita.jornada?.periodo || 'Sin período'}</td>
            <td>{serviciosDe(visita)}</td>
            <td><EstadoBadge valor={visita.estado} /></td>
            <td className="text-end">
              <Button size="sm"
                variant={seleccionadoId === visita.id ? 'danger' : 'outline-danger'}
                onClick={() => setSeleccionadoId(visita.id)}>
                Ver ficha
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: titleColor }}>
          Historial y Consultas
        </h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Consulta dispositivos, atenciones anteriores y seguimiento de visitas.
        </p>
      </div>

      {seleccionado ? (
        <>
          <Card className={cardClass}>
            <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
              <strong>Historial del dispositivo</strong>
              <Button variant="outline-secondary" size="sm"
                onClick={() => setSeleccionadoId(null)}>
                Volver a resultados
              </Button>
            </Card.Header>

            <Card.Body className="p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <h5 className="fw-bold mb-1">
                    {nombreDispositivo(seleccionado.dispositivo)}
                  </h5>
                  <p className="mb-1">{nombrePropietario(seleccionado.propietario)}</p>
                  <small className={modoOscuro ? 'text-light' : 'text-muted'}>
                    ID del dispositivo: {seleccionado.dispositivo?.id || 'No disponible'}
                  </small>
                </div>

                <Badge bg="primary" className="px-3 py-2">
                  {visitasSeleccionado.length} atenciones históricas
                </Badge>
              </div>

              <Alert variant="info" className="small">
                Este historial incluye todas las visitas asociadas al dispositivo,
                incluso cuando corresponden a otros períodos académicos.
              </Alert>

              {tablaVisitas(visitasSeleccionado)}
            </Card.Body>
          </Card>

          <DetalleAtencion
            registro={seleccionado}
            datos={datos}
            modoOscuro={modoOscuro}
            onVolver={() => setSeleccionadoId(null)}
          />
        </>
      ) : (
        <>
          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">
              Buscar y filtrar dispositivos
            </Card.Header>

            <Card.Body className="p-4">
              <Row className="g-3">
                <Col lg={6}>
                  <Form.Label className="fw-bold">Buscar registro</Form.Label>
                  <Form.Control value={busqueda} className={controlClass}
                    placeholder="RUT, propietario, dispositivo, serie o atención"
                    onChange={(e) => setBusqueda(e.target.value)} />
                </Col>

                <Col lg={3}>
                  <Form.Label className="fw-bold">Estado</Form.Label>
                  <Form.Select value={estadoFiltro} className={controlClass}
                    onChange={(e) => setEstadoFiltro(e.target.value)}>
                    <option value="Todos">Todos los estados</option>
                    {Object.entries(estados).map(([clave, estado]) => (
                      <option key={clave} value={clave}>{estado.nombre}</option>
                    ))}
                  </Form.Select>
                </Col>

                <Col lg={3}>
                  <Form.Label className="fw-bold">Período</Form.Label>
                  <Form.Control value={periodoGlobal === 'Todos'
                    ? 'Todos los períodos' : periodoGlobal}
                    readOnly className={controlClass} />
                </Col>

                <Col md={4}>
                  <Form.Label className="fw-bold">Jornada desde</Form.Label>
                  <Form.Control type="date" value={fechaInicio}
                    max={fechaFin || undefined} className={controlClass}
                    onChange={(e) => setFechaInicio(e.target.value)} />
                </Col>

                <Col md={4}>
                  <Form.Label className="fw-bold">Jornada hasta</Form.Label>
                  <Form.Control type="date" value={fechaFin}
                    min={fechaInicio || undefined} className={controlClass}
                    onChange={(e) => setFechaFin(e.target.value)} />
                </Col>

                <Col md={4} className="d-flex align-items-end">
                  <Button variant="outline-secondary" className="w-100"
                    onClick={limpiarFiltros}>
                    Limpiar filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex flex-wrap gap-3 mb-4">
            <Badge bg="secondary" className="px-3 py-2">
              Dispositivos: {grupos.length}
            </Badge>
            <Badge bg="info" text="dark" className="px-3 py-2">
              Atenciones filtradas: {filtrados.length}
            </Badge>
            <Badge bg="success" className="px-3 py-2">
              Entregados: {entregados}
            </Badge>
            <Badge bg="primary" className="px-3 py-2">
              Activos: {activos}
            </Badge>
          </div>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">
              Dispositivos y visitas registradas
            </Card.Header>

            <Card.Body className="p-0">
              <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}
                className="align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-3 py-3">Propietario</th>
                    <th>Dispositivo</th>
                    <th>Serie</th>
                    <th>Visitas totales</th>
                    <th>Última jornada</th>
                    <th>Último estado</th>
                    <th className="text-end px-3">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {grupos.map((grupo) => {
                    const ultima = grupo.visitas[0];
                    const abierto = grupoAbiertoId === grupo.id;

                    return (
                      <Fragment key={grupo.id}>
                        <tr>
                          <td className="px-3">
                            <strong>{nombrePropietario(grupo.propietario)}</strong>
                            <div className="small text-muted">
                              {grupo.propietario?.rut || ''}
                            </div>
                          </td>

                          <td>
                            <strong>{nombreDispositivo(grupo.dispositivo)}</strong>
                            <div className="small text-muted"
                              title={grupo.dispositivo?.id}>
                              {grupo.dispositivo?.id?.slice(0, 18) || 'Sin ID'}
                            </div>
                          </td>

                          <td>{grupo.dispositivo?.numeroSerie || 'No informada'}</td>

                          <td>
                            <Badge bg={grupo.visitas.length > 1 ? 'info' : 'secondary'}
                              text={grupo.visitas.length > 1 ? 'dark' : undefined}>
                              {grupo.visitas.length} visitas
                            </Badge>
                          </td>

                          <td>{ultima?.jornada?.fecha || 'Sin fecha'}</td>
                          <td><EstadoBadge valor={ultima?.estado} /></td>

                          <td className="text-end px-3">
                            <Button size="sm" variant="outline-danger"
                              aria-expanded={abierto}
                              onClick={() => setGrupoAbiertoId(
                                abierto ? null : grupo.id
                              )}>
                              {abierto ? 'Ocultar visitas' : 'Ver visitas'}
                            </Button>
                          </td>
                        </tr>

                        {abierto && (
                          <tr>
                            <td colSpan={7} className="p-3 p-md-4">
                              <div className={`rounded-3 border p-3 ${
                                modoOscuro ? 'bg-dark' : 'bg-light'
                              }`}>
                                <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
                                  <strong>
                                    Historial completo — {nombreDispositivo(grupo.dispositivo)}
                                  </strong>
                                  <small>
                                    {grupo.coincidencias.length} coincidencias con los filtros
                                  </small>
                                </div>

                                {tablaVisitas(grupo.visitas)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}

                  {grupos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        No se encontraron dispositivos con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {registros.length === 0 && (
            <Alert variant="info">
              Todavía no existen atenciones registradas.
            </Alert>
          )}
        </>
      )}
    </>
  );
}
