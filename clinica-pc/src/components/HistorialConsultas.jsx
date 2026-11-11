
import { useState } from 'react';
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

export default function HistorialConsultas({ modoOscuro, periodoGlobal = 'Todos' }) {
  const { datos } = useClinica();
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  // Relacionar cada atención con su dispositivo, propietario y jornada.
  const registros = datos.atenciones.map((atencion) => {
    const dispositivo = datos.dispositivos.find((d) => d.id === atencion.dispositivoId);
    const propietario = datos.propietarios.find((p) => p.id === dispositivo?.propietarioId);
    const jornada = datos.jornadas.find((j) => j.id === atencion.jornadaId);

    return { ...atencion, dispositivo, propietario, jornada };
  });

  // Los filtros se calculan directamente desde el estado compartido.
  const filtrados = registros.filter((registro) => {
    const { propietario, dispositivo, jornada } = registro;

    const texto = [
      registro.id, propietario?.rut, propietario?.nombre,
      propietario?.apellidoPaterno, propietario?.apellidoMaterno,
      dispositivo?.marca, dispositivo?.modelo, dispositivo?.numeroSerie,
    ].filter(Boolean).join(' ').toLowerCase();

    const coincideBusqueda = texto.includes(busqueda.trim().toLowerCase());
    const coincidePeriodo = periodoGlobal === 'Todos' || jornada?.periodo === periodoGlobal;
    const coincideEstado = estadoFiltro === 'Todos' || registro.estado === estadoFiltro;
    const coincideInicio = !fechaInicio || (jornada?.fecha && jornada.fecha >= fechaInicio);
    const coincideFin = !fechaFin || (jornada?.fecha && jornada.fecha <= fechaFin);

    return coincideBusqueda && coincidePeriodo && coincideEstado &&
      coincideInicio && coincideFin;
  }).sort((a, b) =>
    (b.fechaPreinscripcion || '').localeCompare(a.fechaPreinscripcion || '')
  );

  const seleccionado = filtrados.find((r) => r.id === seleccionadoId);
  const entregados = filtrados.filter((r) => r.estado === 'entregado').length;
  const activos = filtrados.filter((r) =>
    ['preinscrito', 'asignado', 'en_proceso', 'listo_entrega', 'contactado'].includes(r.estado)
  ).length;

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: titleColor }}>Historial y Consultas</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Seguimiento de atenciones y consulta de registros de Clínica del PC.
        </p>
      </div>

      {seleccionado ? (
        <DetalleAtencion registro={seleccionado} datos={datos}
          modoOscuro={modoOscuro} onVolver={() => setSeleccionadoId(null)} />
      ) : (
        <>
          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">Buscar y filtrar atenciones</Card.Header>
            <Card.Body className="p-4">
              <Row className="g-3">
                <Col lg={6}>
                  <Form.Label className="fw-bold">Buscar registro</Form.Label>
                  <Form.Control value={busqueda} className={controlClass}
                    placeholder="RUT, propietario, equipo, serie o atención"
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
                    ? 'Todos los períodos' : periodoGlobal} readOnly className={controlClass} />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-bold">Jornada desde</Form.Label>
                  <Form.Control type="date" value={fechaInicio} max={fechaFin || undefined}
                    className={controlClass} onChange={(e) => setFechaInicio(e.target.value)} />
                </Col>
                <Col md={4}>
                  <Form.Label className="fw-bold">Jornada hasta</Form.Label>
                  <Form.Control type="date" value={fechaFin} min={fechaInicio || undefined}
                    className={controlClass} onChange={(e) => setFechaFin(e.target.value)} />
                </Col>
                <Col md={4} className="d-flex align-items-end">
                  <Button variant="outline-secondary" className="w-100"
                    onClick={() => { setBusqueda(''); setEstadoFiltro('Todos');
                      setFechaInicio(''); setFechaFin(''); }}>
                    Limpiar filtros
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex flex-wrap gap-3 mb-4">
            <Badge bg="secondary" className="px-3 py-2">Resultados: {filtrados.length}</Badge>
            <Badge bg="success" className="px-3 py-2">Entregados: {entregados}</Badge>
            <Badge bg="primary" className="px-3 py-2">Activos: {activos}</Badge>
          </div>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">Registros de atención</Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}
                className="align-middle mb-0">
                <thead>
                  <tr>
                    <th className="px-3 py-3">Atención</th>
                    <th>Propietario</th><th>Dispositivo</th>
                    <th>Jornada</th><th>Estado</th>
                    <th className="text-end px-3">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((r) => {
                    const estado = estados[r.estado] || {
                      nombre: r.estado, color: 'secondary',
                    };

                    return (
                      <tr key={r.id}>
                        <td className="px-3"><small>{r.id.slice(0, 12)}...</small></td>
                        <td>{r.propietario
                          ? `${r.propietario.nombre} ${r.propietario.apellidoPaterno}`
                          : 'Sin propietario'}</td>
                        <td>{r.dispositivo
                          ? `${r.dispositivo.marca} ${r.dispositivo.modelo}`
                          : 'Sin dispositivo'}</td>
                        <td>{r.jornada?.fecha || 'Sin jornada'}</td>
                        <td>
                          <Badge bg={estado.color}
                            text={['warning', 'info'].includes(estado.color) ? 'dark' : undefined}>
                            {estado.nombre}
                          </Badge>
                        </td>
                        <td className="text-end px-3">
                          <Button size="sm" variant="outline-danger"
                            onClick={() => setSeleccionadoId(r.id)}>
                            Ver ficha
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filtrados.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-4">
                      No se encontraron atenciones con los filtros seleccionados.
                    </td></tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {registros.length === 0 && (
            <Alert variant="info">Todavía no existen atenciones registradas.</Alert>
          )}
        </>
      )}
    </>
  );
}
