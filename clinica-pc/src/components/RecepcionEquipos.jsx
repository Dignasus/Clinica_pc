
import { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
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

  const tecnicos = datos.usuarios.filter((u) => u.rol === 'tecnico');

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

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 className="fw-bold" style={{ color: titleColor }}>Recepción de Equipos</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Busca propietarios y confirma la llegada de dispositivos.
          Período: {periodoGlobal === 'Todos' ? 'Todos' : periodoGlobal}.
        </p>
      </div>

      {aviso && (
        <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)}>
          {aviso.texto}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Card className={cardClass}>
            <Card.Header className={headerClass}>1. Buscar preinscripción</Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={buscarCliente} className="mb-4">
                <div className="d-flex gap-2">
                  <Form.Control value={rutBusqueda} className={controlClass}
                    placeholder="Ingrese RUT o nombre..."
                    onChange={(e) => {
                      setRutBusqueda(e.target.value);
                      setSeleccionId(null);
                    }} />
                  <Button type="submit" variant={modoOscuro ? 'light' : 'danger'}>
                    Buscar
                  </Button>
                </div>
              </Form>

              <h6 className="fw-bold mb-3">Equipos pendientes de recepción</h6>

              <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}
                className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>RUT</th><th>Propietario</th><th>Equipo</th>
                    <th>Jornada</th><th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((equipo) => (
                    <tr key={equipo.id}>
                      <td>{equipo.rut}</td>
                      <td>{equipo.nombre}</td>
                      <td>{equipo.equipo}</td>
                      <td>{equipo.jornada}</td>
                      <td className="text-end">
                        <Button size="sm" variant="outline-danger"
                          onClick={() => seleccionarEquipo(equipo)}>
                          Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filtrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        No hay equipos pendientes con esa búsqueda.
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
            <Card className={cardClass}>
              <Card.Header className={headerClass}>2. Recepción y asignación</Card.Header>
              <Card.Body className="p-4">
                <h4 className="fw-bold text-danger">{seleccionado.nombre}</h4>

                <div className={`rounded-3 p-3 mb-3 ${
                  modoOscuro ? 'bg-secondary text-light' : 'bg-light'
                }`}>
                  <p><strong>RUT:</strong> {seleccionado.rut}</p>
                  <p><strong>Equipo:</strong> {seleccionado.equipo}</p>
                  <p><strong>Falla:</strong> {seleccionado.falla}</p>
                  <p><strong>Servicios:</strong> {seleccionado.servicios}</p>
                  <p><strong>Período:</strong> {seleccionado.periodo}</p>
                  <p><strong>Jornada:</strong> {seleccionado.jornada}</p>
                  <p><strong>Origen:</strong> {
                    seleccionado.origen === 'presencial' ? 'Presencial' : 'Preinscripción QR'
                  }</p>
                  <p className="mb-0"><strong>Estado:</strong>{' '}
                    <Badge bg={puedeRecibir ? 'success' : 'secondary'}>
                      {etiquetasEstadoJornada[seleccionado.estadoJornada]}
                    </Badge>
                  </p>
                </div>

                {!puedeRecibir && (
                  <Alert variant="warning">
                    Para recepcionar este dispositivo, la jornada debe estar
                    iniciada y corresponder a la fecha de hoy.
                  </Alert>
                )}

                <Form onSubmit={asignarEquipo}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Asignar técnico *</Form.Label>
                    <Form.Select required value={tecnicoId} className={controlClass}
                      disabled={!puedeRecibir}
                      onChange={(e) => setTecnicoId(e.target.value)}>
                      <option value="">Seleccione técnico...</option>
                      {tecnicos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nombre}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Button type="submit" className="w-100 fw-bold"
                    variant={modoOscuro ? 'light' : 'danger'}
                    disabled={!puedeRecibir || !tecnicoId}>
                    Confirmar recepción y asignar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className={cardClass}>
              <Card.Body className="text-center p-5">
                Selecciona un dispositivo para confirmar su recepción y asignar un técnico.
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}
