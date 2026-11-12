import { Alert, Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';

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

const mostrar = (valor) => {
  if (valor === null || valor === undefined || valor === '') return 'No registrado';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (Array.isArray(valor)) return valor.length ? valor.join(', ') : 'No registrado';
  return String(valor).trim() || 'No registrado';
};

const mostrarFecha = (valor) => {
  if (!valor) return 'No registrada';
  const resultado = new Date(valor);
  return Number.isNaN(resultado.getTime())
    ? String(valor) : resultado.toLocaleString('es-CL');
};

const fechaJornada = (valor) => {
  if (!valor) return 'No registrada';
  const partes = String(valor).split('-');
  return partes.length === 3
    ? `${partes[2]}/${partes[1]}/${partes[0]}`
    : String(valor);
};

function Estado({ valor }) {
  const estado = estados[valor] || { nombre: valor || 'Sin estado', color: 'secondary' };

  return (
    <Badge bg={estado.color} className="hist-status"
      text={['warning', 'info'].includes(estado.color) ? 'dark' : undefined}>
      {estado.nombre}
    </Badge>
  );
}

function Campo({ nombre, valor }) {
  return (
    <div className="hist-field">
      <span className="hist-field__name">{nombre}</span>
      <span className="hist-field__value">{mostrar(valor)}</span>
    </div>
  );
}

function Seccion({ numero, titulo, subtitulo, children }) {
  return (
    <Card as="section" className="hist-card hist-detail-section">
      <Card.Header className="hist-card__header">
        <span className="hist-step">{String(numero).padStart(2, '0')}</span>
        <div>
          <h2>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
      </Card.Header>
      <Card.Body className="hist-card__body">{children}</Card.Body>
    </Card>
  );
}

export default function DetalleAtencion({ registro, datos, modoOscuro, onVolver }) {
  const dispositivo = registro.dispositivo || {};
  const propietario = registro.propietario || {};
  const jornada = registro.jornada || {};

  const inspeccion = registro.inspeccionInicial || {};
  const verificacion = registro.verificacionFinal || {};
  const contacto = registro.contacto || {};
  const entrega = registro.entrega || {};

  const checklist = Array.isArray(registro.respuestasChecklist)
    ? registro.respuestasChecklist : [];

  const servicioNombre = (id) =>
    datos.servicios.find((s) => s.id === id)?.nombre || id;

  const tecnicos = (registro.tecnicoIds || [])
    .map((id) => datos.usuarios.find((u) => u.id === id)?.nombre || id)
    .join(', ');

  const nombrePropietario = [
    propietario.nombre,
    propietario.apellidoPaterno,
    propietario.apellidoMaterno,
  ].filter(Boolean).join(' ');

  const nombreEquipo = [
    dispositivo.marca,
    dispositivo.modelo,
  ].filter(Boolean).join(' ');

  const atencionesEquipo = datos.atenciones
    .filter((a) => a.dispositivoId === registro.dispositivoId)
    .map((a) => ({
      ...a,
      jornada: datos.jornadas.find((j) => j.id === a.jornadaId),
    }))
    .sort((a, b) =>
      (b.jornada?.fecha || '').localeCompare(a.jornada?.fecha || '') ||
      (b.fechaPreinscripcion || '').localeCompare(a.fechaPreinscripcion || '')
    );

  const otrasAtenciones = atencionesEquipo.filter((a) => a.id !== registro.id);
  const servicioIds = registro.servicioIds || [];

  // Las respuestas pueden guardar solo el ID: mostrar la descripción de la plantilla.
  const tareaNombre = (item) => {
    const plantilla = datos.plantillasChecklist?.find((p) => p.servicioId === item.servicioId);
    return item.descripcion || plantilla?.items?.find((tarea) => tarea.id === item.itemId)?.descripcion;
  };

  return (
    <div className="hist-detail">
      <div className="hist-detail-title">
        <div>
          <p className="hist-eyebrow">DETALLE DEL SERVICIO</p>
          <h2>Ficha de atención</h2>
          <div className="hist-detail-badges">
            <Estado valor={registro.estado} />
            {registro.esReingreso && <Badge bg="info" text="dark" className="hist-status">Dispositivo recurrente</Badge>}
          </div>
          <span className="hist-id">Atención: {registro.id}</span>
        </div>
        <Button variant="link" className="hist-btn hist-btn--outline" onClick={onVolver}>
          ← Volver al historial
        </Button>
      </div>

      <Card className="hist-card hist-detail-hero">
        <Card.Body className="hist-card__body">
          <div className="hist-detail-hero__layout">
            <div>
              <p className="hist-label">DISPOSITIVO</p>
              <h3>{nombreEquipo || 'Dispositivo sin identificar'}</h3>
              <p>{mostrar(nombrePropietario)}</p>
              <span className="hist-id">Dispositivo ID: {mostrar(dispositivo.id)}</span>
            </div>
            <div className="hist-detail-metadata">
              <div><span>Período</span><strong>{mostrar(jornada.periodo)}</strong></div>
              <div><span>Jornada</span><strong>{fechaJornada(jornada.fecha)}</strong></div>
              <div><span>Visitas registradas</span><strong>{atencionesEquipo.length}</strong></div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Seccion numero={1} titulo="Propietario y dispositivo"
        subtitulo="Identificación y datos de contacto registrados.">
        <Row className="g-4">
          <Col lg={6}>
            <div className="hist-detail-group">
              <h3>Datos del propietario</h3>
              <Campo nombre="Nombre" valor={nombrePropietario} />
              <Campo nombre="RUT" valor={propietario.rut} />
              <Campo nombre="Teléfono" valor={propietario.telefono} />
              <Campo nombre="Correo" valor={propietario.correo} />
              <Campo nombre="Comuna" valor={propietario.comuna} />
              <Campo nombre="Sector" valor={propietario.sector} />
            </div>
          </Col>
          <Col lg={6}>
            <div className="hist-detail-group">
              <h3>Identificación del equipo</h3>
              <Campo nombre="Marca" valor={dispositivo.marca} />
              <Campo nombre="Modelo" valor={dispositivo.modelo} />
              <Campo nombre="Tipo" valor={dispositivo.tipo} />
              <Campo nombre="N.º de serie" valor={dispositivo.numeroSerie} />
              <Campo nombre="Origen" valor={registro.origenRegistro === 'presencial' ? 'Registro presencial' : 'Preinscripción'} />
              <Campo nombre="Fecha de registro" valor={mostrarFecha(registro.fechaPreinscripcion)} />
            </div>
          </Col>
        </Row>
      </Seccion>

      <Seccion numero={2} titulo="Recepción y diagnóstico"
        subtitulo="Información del ingreso e inspección inicial.">
        <div className="hist-section-lead">
          <span>Estado de la atención</span>
          <Estado valor={registro.estado} />
        </div>
        <Row className="g-4">
          <Col lg={6}>
            <div className="hist-detail-group">
              <h3>Ingreso a taller</h3>
              <Campo nombre="Fecha de recepción" valor={mostrarFecha(registro.fechaRecepcion)} />
              <Campo nombre="Técnico(s)" valor={tecnicos} />
              <Campo nombre="Falla informada" valor={registro.diagnosticoPropietario} />
              <Campo nombre="Servicios solicitados" valor={servicioIds.map(servicioNombre).join(', ')} />
            </div>
          </Col>
          <Col lg={6}>
            <div className="hist-detail-group">
              <h3>Inspección inicial del técnico</h3>
              <Campo nombre="Encendido" valor={inspeccion.encendido} />
              <Campo nombre="Estado físico" valor={inspeccion.estadoFisico} />
              <Campo nombre="Accesorios" valor={inspeccion.accesorios} />
              {!registro.inspeccionInicial && (
                <Alert variant="secondary" className="hist-note mt-3 mb-0">
                  El técnico todavía no registra la inspección inicial.
                </Alert>
              )}
            </div>
          </Col>
        </Row>
      </Seccion>

      <Seccion numero={3} titulo="Checklist y trabajo técnico"
        subtitulo="Resultado de las tareas aplicadas a los servicios.">
        <div className="hist-section-lead">
          <span>Tareas registradas</span>
          <span className="hist-count-pill">{checklist.length} {checklist.length === 1 ? 'tarea' : 'tareas'}</span>
        </div>
        <div className="hist-table-area hist-checklist-table">
          <Table responsive hover size="sm" variant={modoOscuro ? 'dark' : 'light'}
            className="hist-table align-middle mb-0">
            <thead><tr><th>Servicio</th><th>Tarea</th><th>Resultado</th><th>Observación</th></tr></thead>
            <tbody>
              {checklist.map((item, indice) => {
                const respuesta = item.estado ?? item.respuesta ?? item.resultado;
                return (
                  <tr key={`${item.servicioId}-${item.itemId}-${indice}`}>
                    <td>{servicioNombre(item.servicioId)}</td>
                    <td>{mostrar(tareaNombre(item))}</td>
                    <td><span className="hist-result">{mostrar(respuesta)}</span></td>
                    <td>{mostrar(item.observacion)}</td>
                  </tr>
                );
              })}
              {checklist.length === 0 && (
                <tr><td colSpan={4} className="hist-table-empty">Todavía no se han registrado tareas del checklist.</td></tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="hist-detail-footer-fields">
          <Campo nombre="Observaciones técnicas" valor={registro.observacionesTecnicas} />
          <Campo nombre="Última actualización" valor={mostrarFecha(registro.fechaUltimaActualizacion)} />
        </div>
      </Seccion>

      <Seccion numero={4} titulo="Comparación inicial y final"
        subtitulo="Comprueba las diferencias antes y después del servicio.">
        <Row className="g-3">
          <Col md={6}>
            <div className="hist-compare hist-compare--initial">
              <div className="hist-compare__heading">Estado inicial</div>
              <Campo nombre="Encendido" valor={inspeccion.encendido} />
              <Campo nombre="Estado físico" valor={inspeccion.estadoFisico} />
              <Campo nombre="Accesorios" valor={inspeccion.accesorios} />
            </div>
          </Col>
          <Col md={6}>
            <div className="hist-compare hist-compare--final">
              <div className="hist-compare__heading">Estado final</div>
              <Campo nombre="Encendido" valor={verificacion.encendido} />
              <Campo nombre="Estado físico" valor={verificacion.estadoFisico} />
              <Campo nombre="Accesorios" valor={verificacion.accesorios} />
            </div>
          </Col>
        </Row>
        <div className="hist-detail-footer-fields">
          <Campo nombre="Diferencias detectadas" valor={verificacion.diferencias} />
          <Campo nombre="Resultado del servicio" valor={verificacion.resultadoServicio} />
          <Campo nombre="Fecha de verificación" valor={mostrarFecha(registro.fechaVerificacionFinal)} />
        </div>
        {!registro.verificacionFinal && (
          <Alert variant="info" className="hist-note mt-3 mb-0">La verificación final todavía no ha sido registrada.</Alert>
        )}
      </Seccion>

      <Seccion numero={5} titulo="Contacto y entrega"
        subtitulo="Comunicación con el propietario y cierre de la atención.">
        <Row className="g-4">
          <Col md={6}>
            <div className="hist-detail-group">
              <h3>Aviso al propietario</h3>
              <Campo nombre="Medio" valor={contacto.medio} />
              <Campo nombre="Resultado" valor={contacto.observaciones} />
              <Campo nombre="Fecha" valor={mostrarFecha(contacto.fecha)} />
            </div>
          </Col>
          <Col md={6}>
            <div className="hist-detail-group">
              <h3>Entrega del dispositivo</h3>
              <Campo nombre="Recibido por" valor={entrega.recibidoPor} />
              <Campo nombre="Conformidad" valor={entrega.conformidad} />
              <Campo nombre="Prueba conjunta" valor={
                entrega.pruebaConPropietario === undefined
                  ? 'No registrada'
                  : entrega.pruebaConPropietario ? 'Confirmada' : 'No confirmada'
              } />
              <Campo nombre="Observaciones" valor={entrega.observaciones} />
              <Campo nombre="Fecha" valor={mostrarFecha(entrega.fecha)} />
            </div>
          </Col>
        </Row>
        {registro.estado === 'entregado' && (
          <Alert variant="success" className="hist-note mt-3 mb-0">
            Esta atención figura como entregada al propietario.
          </Alert>
        )}
      </Seccion>

      <Seccion numero={6} titulo="Relación con otras atenciones"
        subtitulo="Visitas independientes que comparten el mismo dispositivo.">
        <p className="hist-section-explanation">
          Todas estas atenciones comparten el mismo identificador de dispositivo.
          Cada una conserva su propio diagnóstico, servicios y estado.
        </p>
        <div className="hist-visit-entry hist-visit-entry--current">
          <div className="hist-visit-entry__heading">
            <strong>Atención que estás consultando</strong>
            <Estado valor={registro.estado} />
          </div>
          <p>{mostrar(jornada.periodo)} — {fechaJornada(jornada.fecha)}</p>
          <span className="hist-id">{registro.id}</span>
        </div>

        {otrasAtenciones.length > 0 ? (
          <>
            <h3 className="hist-other-title">Otras visitas registradas ({otrasAtenciones.length})</h3>
            {otrasAtenciones.map((atencion) => (
              <div key={atencion.id} className="hist-visit-entry">
                <div className="hist-visit-entry__heading">
                  <strong>{mostrar(atencion.jornada?.periodo)} — {fechaJornada(atencion.jornada?.fecha)}</strong>
                  <Estado valor={atencion.estado} />
                </div>
                <p className="hist-id">Atención: {atencion.id}</p>
                <p>Servicios: {(atencion.servicioIds || []).map(servicioNombre).join(', ') || 'No informados'}</p>
              </div>
            ))}
            <p className="hist-section-explanation mt-3 mb-0">
              Para abrir la ficha de otra visita, utiliza la tabla «Historial del dispositivo» situada arriba.
            </p>
          </>
        ) : (
          <Alert variant="info" className="hist-note mb-0">
            Este dispositivo todavía no tiene otras visitas registradas.
          </Alert>
        )}
      </Seccion>
    </div>
  );
}
