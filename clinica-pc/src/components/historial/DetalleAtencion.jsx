
import { Badge, Button, Card, Table } from 'react-bootstrap';

const mostrar = (valor) => String(valor ?? '').trim() || 'No registrado';

const fecha = (valor) => {
  if (!valor) return 'No registrada';
  const resultado = new Date(valor);
  return Number.isNaN(resultado.getTime())
    ? valor : resultado.toLocaleString('es-CL');
};

export default function DetalleAtencion({ registro, datos, modoOscuro, onVolver }) {
  const { dispositivo = {}, propietario = {}, jornada = {} } = registro;
  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;

  const servicioNombre = (id) =>
    datos.servicios.find((s) => s.id === id)?.nombre || id;

  const tecnicos = (registro.tecnicoIds || [])
    .map((id) => datos.usuarios.find((u) => u.id === id)?.nombre || id)
    .join(', ');

  const inspeccion = registro.inspeccionInicial || {};
  const final = registro.verificacionFinal || {};
  const contacto = registro.contacto || {};
  const entrega = registro.entrega || {};
  const checklist = registro.respuestasChecklist || [];

  const atencionesEquipo = datos.atenciones
    .filter((a) => a.dispositivoId === registro.dispositivoId)
    .sort((a, b) =>
      (b.fechaPreinscripcion || '').localeCompare(a.fechaPreinscripcion || '')
    );

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Ficha de atención</h4>
          <small className="text-muted">Identificador: {registro.id}</small>
        </div>
        <Button variant="secondary" onClick={onVolver}>Volver al historial</Button>
      </div>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>1. Propietario y dispositivo</Card.Header>
        <Card.Body className="p-4">
          <p><strong>Propietario:</strong> {mostrar([
            propietario.nombre, propietario.apellidoPaterno, propietario.apellidoMaterno,
          ].filter(Boolean).join(' '))}</p>
          <p><strong>RUT:</strong> {mostrar(propietario.rut)}</p>
          <p><strong>Contacto:</strong> {mostrar(propietario.telefono)} · {mostrar(propietario.correo)}</p>
          <p><strong>Ubicación:</strong> {mostrar(propietario.comuna)} · {mostrar(propietario.sector)}</p>
          <hr />
          <p><strong>Equipo:</strong> {mostrar(dispositivo.marca)} {mostrar(dispositivo.modelo)}</p>
          <p><strong>Tipo:</strong> {mostrar(dispositivo.tipo)}</p>
          <p><strong>N.º de serie:</strong> {mostrar(dispositivo.numeroSerie)}</p>
          <p><strong>Período:</strong> {mostrar(jornada.periodo)}</p>
          <p><strong>Jornada:</strong> {mostrar(jornada.fecha)}</p>
          <p className="mb-0"><strong>Preinscripción:</strong> {fecha(registro.fechaPreinscripcion)}</p>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>2. Recepción y diagnóstico</Card.Header>
        <Card.Body className="p-4">
          <p><strong>Estado:</strong> <Badge bg="secondary">{registro.estado}</Badge></p>
          <p><strong>Fecha de recepción:</strong> {fecha(registro.fechaRecepcion)}</p>
          <p><strong>Técnico(s):</strong> {mostrar(tecnicos)}</p>
          <p><strong>Falla informada:</strong> {mostrar(registro.diagnosticoPropietario)}</p>
          <p><strong>Servicios solicitados:</strong> {
            registro.servicioIds?.map(servicioNombre).join(', ') || 'No registrados'
          }</p>
          <hr />
          <h6 className="fw-bold">Inspección inicial</h6>
          <p><strong>Encendido:</strong> {mostrar(inspeccion.encendido)}</p>
          <p><strong>Estado físico:</strong> {mostrar(inspeccion.estadoFisico)}</p>
          <p className="mb-0"><strong>Accesorios:</strong> {mostrar(inspeccion.accesorios)}</p>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>3. Checklist y trabajo técnico</Card.Header>
        <Card.Body className="p-4">
          <Table responsive bordered size="sm" variant={modoOscuro ? 'dark' : 'light'}>
            <thead>
              <tr><th>Servicio</th><th>Tarea</th><th>Resultado</th><th>Observación</th></tr>
            </thead>
            <tbody>
              {checklist.map((item, indice) => (
                <tr key={`${item.servicioId}-${item.itemId}-${indice}`}>
                  <td>{servicioNombre(item.servicioId)}</td>
                  <td>{mostrar(item.descripcion)}</td>
                  <td>{mostrar(item.estado)}</td>
                  <td>{mostrar(item.observacion)}</td>
                </tr>
              ))}
              {checklist.length === 0 && (
                <tr><td colSpan={4} className="text-center">
                  Todavía no se ha registrado un checklist.
                </td></tr>
              )}
            </tbody>
          </Table>
          <p><strong>Observaciones técnicas:</strong> {
            mostrar(registro.observacionesTecnicas)
          }</p>
          <p className="mb-0"><strong>Última actualización:</strong> {
            fecha(registro.fechaUltimaActualizacion)
          }</p>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>4. Verificación final</Card.Header>
        <Card.Body className="p-4">
          <p><strong>Encendido:</strong> {mostrar(final.encendido)}</p>
          <p><strong>Estado físico:</strong> {mostrar(final.estadoFisico)}</p>
          <p><strong>Accesorios:</strong> {mostrar(final.accesorios)}</p>
          <p><strong>Diferencias:</strong> {mostrar(final.diferencias)}</p>
          <p><strong>Resultado del servicio:</strong> {mostrar(final.resultadoServicio)}</p>
          <p className="mb-0"><strong>Fecha:</strong> {fecha(registro.fechaVerificacionFinal)}</p>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>5. Contacto y entrega</Card.Header>
        <Card.Body className="p-4">
          <h6 className="fw-bold">Aviso al propietario</h6>
          <p><strong>Medio:</strong> {mostrar(contacto.medio)}</p>
          <p><strong>Resultado:</strong> {mostrar(contacto.observaciones)}</p>
          <p><strong>Fecha:</strong> {fecha(contacto.fecha)}</p>
          <hr />
          <h6 className="fw-bold">Entrega del dispositivo</h6>
          <p><strong>Recibido por:</strong> {mostrar(entrega.recibidoPor)}</p>
          <p><strong>Conformidad:</strong> {mostrar(entrega.conformidad)}</p>
          <p><strong>Prueba conjunta:</strong> {
            entrega.pruebaConPropietario ? 'Confirmada' : 'No confirmada'
          }</p>
          <p><strong>Observaciones:</strong> {mostrar(entrega.observaciones)}</p>
          <p className="mb-0"><strong>Fecha de entrega:</strong> {fecha(entrega.fecha)}</p>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>6. Historial del mismo dispositivo</Card.Header>
        <Card.Body className="p-4">
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>
            Atenciones vinculadas al mismo identificador de dispositivo.
          </p>
          {atencionesEquipo.map((a) => {
            const j = datos.jornadas.find((item) => item.id === a.jornadaId);
            return (
              <div key={a.id} className="border-bottom py-2">
                <div className="fw-semibold">{j?.periodo || 'Sin período'} — {j?.fecha}</div>
                <small>Atención: {a.id} · Estado: {a.estado}</small>
              </div>
            );
          })}
        </Card.Body>
      </Card>
    </>
  );
}
