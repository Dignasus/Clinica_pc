
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
  const estado = estados[valor] || {
    nombre: valor || 'Sin estado', color: 'secondary',
  };

  return (
    <Badge bg={estado.color}
      text={['warning', 'info'].includes(estado.color) ? 'dark' : undefined}>
      {estado.nombre}
    </Badge>
  );
}

function Campo({ nombre, valor }) {
  return (
    <p className="mb-2">
      <strong>{nombre}:</strong> {mostrar(valor)}
    </p>
  );
}

export default function DetalleAtencion({
  registro, datos, modoOscuro, onVolver,
}) {
  const dispositivo = registro.dispositivo || {};
  const propietario = registro.propietario || {};
  const jornada = registro.jornada || {};

  const inspeccion = registro.inspeccionInicial || {};
  const verificacion = registro.verificacionFinal || {};
  const contacto = registro.contacto || {};
  const entrega = registro.entrega || {};

  const checklist = Array.isArray(registro.respuestasChecklist)
    ? registro.respuestasChecklist : [];

  const cardClass = `shadow-sm border-0 mb-4 ${
    modoOscuro ? 'bg-dark text-light' : ''
  }`;

  const headerClass = `fw-bold py-3 ${
    modoOscuro ? 'bg-secondary text-light' : 'bg-white'
  }`;

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

  const otrasAtenciones = atencionesEquipo.filter(
    (a) => a.id !== registro.id
  );

  const servicioIds = registro.servicioIds || [];

  return (
    <>
      {/* CABECERA DE LA ATENCIÓN */}
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-2">Ficha de atención</h4>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
            <Estado valor={registro.estado} />
            {registro.esReingreso && (
              <Badge bg="info" text="dark">Dispositivo recurrente</Badge>
            )}
          </div>
          <small className={modoOscuro ? 'text-light' : 'text-muted'}>
            Atención: {registro.id}
          </small>
        </div>

        <Button variant="outline-secondary" onClick={onVolver}>
          Volver al historial
        </Button>
      </div>

      {/* RESUMEN */}
      <Card className={cardClass}>
        <Card.Body className="p-4">
          <Row className="g-4 align-items-center">
            <Col md={7}>
              <h5 className="fw-bold mb-2">
                {nombreEquipo || 'Dispositivo sin identificar'}
              </h5>
              <p className="mb-1">{mostrar(nombrePropietario)}</p>
              <small className={modoOscuro ? 'text-light' : 'text-muted'}>
                Dispositivo ID: {mostrar(dispositivo.id)}
              </small>
            </Col>

            <Col md={5}>
              <div className={`rounded-3 p-3 ${
                modoOscuro ? 'bg-secondary' : 'bg-light'
              }`}>
                <Campo nombre="Período" valor={jornada.periodo} />
                <Campo nombre="Jornada" valor={fechaJornada(jornada.fecha)} />
                <p className="mb-0">
                  <strong>Visitas registradas:</strong> {atencionesEquipo.length}
                </p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 1. PROPIETARIO Y DISPOSITIVO */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>1. Propietario y dispositivo</Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            <Col lg={6}>
              <h6 className="fw-bold mb-3">Datos del propietario</h6>
              <Campo nombre="Nombre" valor={nombrePropietario} />
              <Campo nombre="RUT" valor={propietario.rut} />
              <Campo nombre="Teléfono" valor={propietario.telefono} />
              <Campo nombre="Correo" valor={propietario.correo} />
              <Campo nombre="Comuna" valor={propietario.comuna} />
              <Campo nombre="Sector" valor={propietario.sector} />
            </Col>

            <Col lg={6}>
              <h6 className="fw-bold mb-3">Identificación del equipo</h6>
              <Campo nombre="Marca" valor={dispositivo.marca} />
              <Campo nombre="Modelo" valor={dispositivo.modelo} />
              <Campo nombre="Tipo" valor={dispositivo.tipo} />
              <Campo nombre="N.º de serie" valor={dispositivo.numeroSerie} />
              <Campo nombre="Origen" valor={
                registro.origenRegistro === 'presencial'
                  ? 'Registro presencial'
                  : 'Preinscripción'
              } />
              <Campo nombre="Fecha de registro" valor={
                mostrarFecha(registro.fechaPreinscripcion)
              } />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 2. RECEPCIÓN Y DIAGNÓSTICO */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>2. Recepción y diagnóstico</Card.Header>
        <Card.Body className="p-4">
          <div className="mb-3">
            <strong>Estado de la atención: </strong>
            <Estado valor={registro.estado} />
          </div>

          <Campo nombre="Fecha de recepción"
            valor={mostrarFecha(registro.fechaRecepcion)} />
          <Campo nombre="Técnico(s)" valor={tecnicos} />
          <Campo nombre="Falla informada"
            valor={registro.diagnosticoPropietario} />
          <Campo nombre="Servicios solicitados"
            valor={servicioIds.map(servicioNombre).join(', ')} />

          <hr />

          <h6 className="fw-bold mb-3">Inspección inicial del técnico</h6>

          <Campo nombre="Encendido" valor={inspeccion.encendido} />
          <Campo nombre="Estado físico" valor={inspeccion.estadoFisico} />
          <Campo nombre="Accesorios" valor={inspeccion.accesorios} />

          {!registro.inspeccionInicial && (
            <Alert variant="secondary" className="small mt-3 mb-0">
              El técnico todavía no registra la inspección inicial.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* 3. CHECKLIST */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>3. Checklist y trabajo técnico</Card.Header>
        <Card.Body className="p-4">
          <div className="d-flex flex-wrap justify-content-between gap-2 mb-3">
            <h6 className="fw-bold mb-0">Tareas registradas</h6>
            <Badge bg="secondary">{checklist.length} tareas</Badge>
          </div>

          <Table responsive bordered hover size="sm"
            variant={modoOscuro ? 'dark' : 'light'}
            className="align-middle">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Tarea</th>
                <th>Resultado</th>
                <th>Observación</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item, indice) => {
                const respuesta = item.estado ?? item.respuesta ?? item.resultado;

                return (
                  <tr key={`${item.servicioId}-${item.itemId}-${indice}`}>
                    <td>{servicioNombre(item.servicioId)}</td>
                    <td>{mostrar(item.descripcion)}</td>
                    <td>{mostrar(respuesta)}</td>
                    <td>{mostrar(item.observacion)}</td>
                  </tr>
                );
              })}

              {checklist.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Todavía no se han registrado tareas del checklist.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <Campo nombre="Observaciones técnicas"
            valor={registro.observacionesTecnicas} />
          <Campo nombre="Última actualización"
            valor={mostrarFecha(registro.fechaUltimaActualizacion)} />
        </Card.Body>
      </Card>

      {/* 4. COMPARACIÓN INICIAL Y FINAL */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>
          4. Comparación del estado inicial y final
        </Card.Header>

        <Card.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <div className={`h-100 rounded-3 border p-3 ${
                modoOscuro ? 'bg-dark' : 'bg-light'
              }`}>
                <h6 className="fw-bold mb-3">Estado inicial</h6>
                <Campo nombre="Encendido" valor={inspeccion.encendido} />
                <Campo nombre="Estado físico" valor={inspeccion.estadoFisico} />
                <Campo nombre="Accesorios" valor={inspeccion.accesorios} />
              </div>
            </Col>

            <Col md={6}>
              <div className={`h-100 rounded-3 border p-3 ${
                modoOscuro ? 'bg-dark' : 'bg-light'
              }`}>
                <h6 className="fw-bold mb-3">Estado final</h6>
                <Campo nombre="Encendido" valor={verificacion.encendido} />
                <Campo nombre="Estado físico" valor={verificacion.estadoFisico} />
                <Campo nombre="Accesorios" valor={verificacion.accesorios} />
              </div>
            </Col>
          </Row>

          <div className="mt-4">
            <Campo nombre="Diferencias detectadas"
              valor={verificacion.diferencias} />
            <Campo nombre="Resultado del servicio"
              valor={verificacion.resultadoServicio} />
            <Campo nombre="Fecha de verificación"
              valor={mostrarFecha(registro.fechaVerificacionFinal)} />
          </div>

          {!registro.verificacionFinal && (
            <Alert variant="info" className="small mt-3 mb-0">
              La verificación final todavía no ha sido registrada.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* 5. CONTACTO Y ENTREGA */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>5. Contacto y entrega</Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            <Col md={6}>
              <h6 className="fw-bold mb-3">Aviso al propietario</h6>
              <Campo nombre="Medio" valor={contacto.medio} />
              <Campo nombre="Resultado" valor={contacto.observaciones} />
              <Campo nombre="Fecha" valor={mostrarFecha(contacto.fecha)} />
            </Col>

            <Col md={6}>
              <h6 className="fw-bold mb-3">Entrega del dispositivo</h6>
              <Campo nombre="Recibido por" valor={entrega.recibidoPor} />
              <Campo nombre="Conformidad" valor={entrega.conformidad} />
              <Campo nombre="Prueba conjunta" valor={
                entrega.pruebaConPropietario === undefined
                  ? 'No registrada'
                  : entrega.pruebaConPropietario
                    ? 'Confirmada'
                    : 'No confirmada'
              } />
              <Campo nombre="Observaciones" valor={entrega.observaciones} />
              <Campo nombre="Fecha" valor={mostrarFecha(entrega.fecha)} />
            </Col>
          </Row>

          {registro.estado === 'entregado' && (
            <Alert variant="success" className="mt-3 mb-0">
              Esta atención figura como entregada al propietario.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* 6. OTRAS VISITAS */}
      <Card className={cardClass}>
        <Card.Header className={headerClass}>
          6. Relación con otras atenciones del dispositivo
        </Card.Header>

        <Card.Body className="p-4">
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>
            Todas estas atenciones comparten el mismo identificador de dispositivo.
            Cada una conserva su propio diagnóstico, servicios y estado.
          </p>

          <div className={`rounded-3 border p-3 mb-3 ${
            modoOscuro ? 'bg-secondary text-light' : 'bg-light'
          }`}>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
              <strong>Atención que estás consultando</strong>
              <Estado valor={registro.estado} />
            </div>

            <div className="small mb-1">
              {mostrar(jornada.periodo)} — {fechaJornada(jornada.fecha)}
            </div>

            <div className="small text-break">{registro.id}</div>
          </div>

          {otrasAtenciones.length > 0 ? (
            <>
              <h6 className="fw-bold mb-3">
                Otras visitas registradas ({otrasAtenciones.length})
              </h6>

              {otrasAtenciones.map((atencion) => (
                <div key={atencion.id} className="border-bottom py-3">
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <strong>
                      {mostrar(atencion.jornada?.periodo)} — {
                        fechaJornada(atencion.jornada?.fecha)
                      }
                    </strong>
                    <Estado valor={atencion.estado} />
                  </div>

                  <p className="small mb-1 text-break">
                    Atención: {atencion.id}
                  </p>

                  <p className="small mb-0">
                    Servicios: {(atencion.servicioIds || [])
                      .map(servicioNombre).join(', ') || 'No informados'}
                  </p>
                </div>
              ))}

              <p className={`small mt-3 mb-0 ${
                modoOscuro ? 'text-light' : 'text-muted'
              }`}>
                Para abrir la ficha de otra visita, utiliza la tabla
                «Historial del dispositivo» situada arriba de esta ficha.
              </p>
            </>
          ) : (
            <Alert variant="info" className="mb-0">
              Este dispositivo todavía no tiene otras visitas registradas.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
