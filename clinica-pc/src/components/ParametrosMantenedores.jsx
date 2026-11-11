
import { Card, Form, Row, Col, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import { fechaLocal, obtenerEstadoJornada, etiquetasEstadoJornada } from '../utils/jornadas.js';

const estadosFinales = ['entregado', 'no_presentado', 'cancelado', 'cerrada', 'finalizada'];

export default function ParametrosMantenedores({ modoOscuro }) {
  const { datos, dispatch } = useClinica();

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const botonVariante = modoOscuro ? 'light' : 'danger';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  const jornadas = [...datos.jornadas].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const colores = {
    programada: 'primary', activa: 'success',
    pendiente_cierre: 'warning', finalizada: 'secondary',
  };

  const ejemplos = datos.atenciones.filter((a) =>
    a.jornadaId === 'JOR-001' && a.estado === 'preinscrito' &&
    ((a.id === 'AT-001' && a.dispositivoId === 'DISP-001') ||
     (a.id === 'AT-002' && a.dispositivoId === 'DISP-002'))
  );

  const pendientesPasados = datos.atenciones.filter((a) => {
    const jornada = datos.jornadas.find((j) => j.id === a.jornadaId);
    return a.estado === 'preinscrito' && jornada?.fecha < fechaLocal();
  });

  const handleCrearJornada = (e) => {
    e.preventDefault();
    const formulario = e.currentTarget;
    const campos = new FormData(formulario);
    const periodo = String(campos.get('periodo') || '').trim();
    const fecha = String(campos.get('fecha') || '');

    if (!periodo || !fecha) return;
    if (fecha < fechaLocal()) return alert('No puedes programar jornadas en el pasado.');

    const existe = datos.jornadas.some((j) =>
      j.periodo.toLowerCase() === periodo.toLowerCase() && j.fecha === fecha
    );
    if (existe) return alert('Ya existe esa jornada.');

    dispatch({
      type: 'CREAR_JORNADA',
      payload: { id: `JOR-${crypto.randomUUID()}`, periodo, fecha, estado: 'programada' },
    });

    formulario.reset();
    alert('Jornada registrada.');
  };

  const iniciarJornada = (jornada) => {
    if (window.confirm(`¿Iniciar la jornada del ${jornada.fecha}?`)) {
      dispatch({ type: 'INICIAR_JORNADA', payload: jornada.id });
    }
  };

  const cerrarJornada = (jornada) => {
    const abiertas = datos.atenciones.filter((a) =>
      a.jornadaId === jornada.id && !estadosFinales.includes(a.estado)
    );

    if (abiertas.length) {
      alert(`No se puede cerrar: hay ${abiertas.length} atención(es) sin resolver.`);
      return;
    }

    if (window.confirm(`¿Finalizar administrativamente la jornada del ${jornada.fecha}?`)) {
      dispatch({ type: 'CERRAR_JORNADA', payload: jornada.id });
    }
  };

  const marcarNoPresentado = (atencion) => {
    if (!window.confirm('¿Confirmas que este equipo no se presentó a la jornada?')) return;
    dispatch({ type: 'MARCAR_NO_PRESENTADO', payload: atencion.id });
  };

  const limpiarEjemplos = () => {
    if (!ejemplos.length) return;

    const mensaje = `Se eliminarán ${ejemplos.length} atención(es) de ejemplo originales. ` +
      'Los registros nuevos de Primavera se conservarán. ¿Continuar?';

    if (window.confirm(mensaje)) {
      dispatch({ type: 'LIMPIAR_DATOS_DEMO' });
    }
  };

  const handleCargaMasiva = (e) => {
    e.preventDefault();
    alert('La importación CSV/Excel todavía no está implementada.');
  };

  const handleCrearChecklist = (e) => {
    e.preventDefault();
    const formulario = e.currentTarget;
    const campos = new FormData(formulario);
    const servicioId = String(campos.get('servicioId') || '');
    const descripcion = String(campos.get('descripcion') || '').trim();

    if (!servicioId || !descripcion) return;
    if (!datos.servicios.some((s) => s.id === servicioId)) {
      return alert('Servicio no válido.');
    }

    dispatch({
      type: 'AGREGAR_ITEM_CHECKLIST',
      payload: {
        servicioId,
        item: { id: `ITEM-${crypto.randomUUID()}`, descripcion },
      },
    });

    formulario.reset();
    alert('Ítem agregado al checklist.');
  };

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>Parámetros y Mantenedores</h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Administración de jornadas, personal y servicios de Clínica del PC.
        </p>
      </div>

      {/* 1. JORNADAS */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>1. Administración de Jornadas</Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleCrearJornada}>
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Label className="fw-bold">Período Académico *</Form.Label>
                <Form.Control name="periodo" placeholder="Ej: Primavera 2026"
                  required className={controlClass} />
              </Col>
              <Col md={5}>
                <Form.Label className="fw-bold">Fecha de Ejecución *</Form.Label>
                <Form.Control type="date" name="fecha" min={fechaLocal()}
                  required className={controlClass} />
              </Col>
              <Col md={2} className="d-grid">
                <Button type="submit" variant={botonVariante}>Registrar</Button>
              </Col>
            </Row>
          </Form>

          <h6 className="fw-bold mt-4 mb-3">Jornadas registradas</h6>
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="align-middle">
            <thead>
              <tr><th>Período</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {jornadas.map((j) => {
                const estado = obtenerEstadoJornada(j);
                const iniciar = estado === 'programada' && j.fecha === fechaLocal();
                const cerrar = ['activa', 'pendiente_cierre'].includes(estado);

                return (
                  <tr key={j.id}>
                    <td>{j.periodo}</td>
                    <td>{j.fecha}</td>
                    <td>
                      <Badge bg={colores[estado]} text={estado === 'pendiente_cierre' ? 'dark' : undefined}>
                        {etiquetasEstadoJornada[estado]}
                      </Badge>
                    </td>
                    <td>
                      {iniciar && (
                        <Button size="sm" variant="outline-success" onClick={() => iniciarJornada(j)}>
                          Iniciar
                        </Button>
                      )}
                      {cerrar && (
                        <Button size="sm" variant="outline-danger" onClick={() => cerrarJornada(j)}>
                          Cerrar
                        </Button>
                      )}
                      {!iniciar && !cerrar && '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 2. ATENCIONES NO PRESENTADAS */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>2. Preinscripciones de Jornadas Pasadas</Card.Header>
        <Card.Body className="p-4">
          <Alert variant="info">
            Un dispositivo no presentado se conserva en el historial, pero deja
            de contarse como una preinscripción pendiente.
          </Alert>

          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}>
            <thead>
              <tr><th>Equipo</th><th>Jornada</th><th>Estado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {pendientesPasados.map((a) => {
                const dispositivo = datos.dispositivos.find((d) => d.id === a.dispositivoId);
                const jornada = datos.jornadas.find((j) => j.id === a.jornadaId);

                return (
                  <tr key={a.id}>
                    <td>{dispositivo ? `${dispositivo.marca} ${dispositivo.modelo}` : 'Sin dispositivo'}</td>
                    <td>{jornada?.periodo} — {jornada?.fecha}</td>
                    <td><Badge bg="warning" text="dark">Sin recepción</Badge></td>
                    <td>
                      <Button size="sm" variant="outline-danger"
                        onClick={() => marcarNoPresentado(a)}>
                        No presentado
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {pendientesPasados.length === 0 && (
                <tr><td colSpan={4} className="text-center">Sin preinscripciones vencidas.</td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* 3. CARGA MASIVA */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>3. Carga Masiva de Usuarios</Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleCargaMasiva}>
            <Row className="g-3 align-items-end">
              <Col md={10}>
                <Form.Label className="fw-bold">Técnicos y Profesores (CSV o Excel)</Form.Label>
                <Form.Control type="file" accept=".csv,.xlsx,.xls"
                  required className={controlClass} />
                <Form.Text className={modoOscuro ? 'text-light' : 'text-muted'}>
                  Importación pendiente de implementación.
                </Form.Text>
              </Col>
              <Col md={2} className="d-grid">
                <Button type="submit" variant={botonVariante}>Procesar</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* 4. CHECKLISTS */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>4. Mantenedor de Checklists Dinámicos</Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleCrearChecklist}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label className="fw-bold">Tipo de Servicio *</Form.Label>
                <Form.Select name="servicioId" defaultValue="" required className={controlClass}>
                  <option value="">Seleccione servicio...</option>
                  {datos.servicios.map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Nueva Tarea *</Form.Label>
                <Form.Control name="descripcion" maxLength={200} required
                  placeholder="Ej: Revisar estado térmico" className={controlClass} />
              </Col>
              <Col md={2} className="d-grid">
                <Button type="submit" variant={botonVariante}>Agregar Ítem</Button>
              </Col>
            </Row>
          </Form>

          <h6 className="fw-bold mt-4 mb-3">Plantillas registradas</h6>
          {datos.plantillasChecklist.map((plantilla) => {
            const servicio = datos.servicios.find((s) => s.id === plantilla.servicioId);

            return (
              <div key={plantilla.id} className="border rounded-3 p-3 mb-3">
                <h6 className="fw-bold">{servicio?.nombre || plantilla.servicioId}</h6>
                <ol className="mb-0">
                  {plantilla.items.map((item) => <li key={item.id}>{item.descripcion}</li>)}
                </ol>
              </div>
            );
          })}
        </Card.Body>
      </Card>

      {/* 5. LIMPIEZA DE DATOS DE EJEMPLO */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>5. Datos Iniciales de Demostración</Card.Header>
        <Card.Body className="p-4">
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>
            Elimina únicamente las dos atenciones de ejemplo originales de Otoño 2026.
            No modifica las atenciones nuevas de Primavera.
          </p>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <span>Registros de ejemplo detectados: <strong>{ejemplos.length}</strong></span>
            <Button variant="outline-danger" disabled={!ejemplos.length} onClick={limpiarEjemplos}>
              Eliminar ejemplos originales
            </Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
