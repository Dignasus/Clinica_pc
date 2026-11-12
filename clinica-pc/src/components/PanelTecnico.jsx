import { useState } from 'react';
import { Alert, Badge, Button, Card, Form, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import ChecklistServicio from './tecnico/ChecklistServicio.jsx';
import SeleccionServicios from './tecnico/SeleccionServicios.jsx';
import EntregaEquipo from './tecnico/EntregaEquipo.jsx';

const inspeccionVacia = { encendido: '', estadoFisico: '', accesorios: '' };
const estadosVisibles = ['asignado', 'en_proceso', 'listo_entrega', 'contactado'];
const etiquetas = {
  asignado: 'Asignado', en_proceso: 'En proceso',
  listo_entrega: 'Listo para entrega', contactado: 'Propietario avisado',
};
const normalizar = (valor) => String(valor || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function PanelTecnico({ modoOscuro, periodoGlobal = 'Todos' }) {
  const { datos, dispatch } = useClinica();
  const [seleccion, setSeleccion] = useState(null);
  const [inspeccion, setInspeccion] = useState({ ...inspeccionVacia });
  const [serviciosElegidos, setServiciosElegidos] = useState([]);
  const [motivoServicios, setMotivoServicios] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  const rol = sessionStorage.getItem('userRol');
  const nombreSesion = sessionStorage.getItem('userNombre');
  const usuarioActual = datos.usuarios.find((u) => u.rol === 'tecnico' &&
    [u.nombre, u.id].some((dato) => normalizar(dato) === normalizar(nombreSesion)));
  const jornadasIds = new Set(datos.jornadas.filter((j) =>
    periodoGlobal === 'Todos' || j.periodo === periodoGlobal).map((j) => j.id));

  const asignadas = datos.atenciones.filter((a) => estadosVisibles.includes(a.estado) &&
    jornadasIds.has(a.jornadaId) && (rol === 'superusuario' ||
      (rol === 'tecnico' && a.tecnicoIds?.includes(usuarioActual?.id))));

  const detalleDe = (a) => {
    const dispositivo = datos.dispositivos.find((d) => d.id === a.dispositivoId);
    const propietario = datos.propietarios.find((p) => p.id === dispositivo?.propietarioId);
    const tecnico = datos.usuarios.find((u) => u.id === a.tecnicoIds?.[0]);
    const jornada = datos.jornadas.find((j) => j.id === a.jornadaId);
    return { dispositivo, propietario, tecnico, jornada };
  };

  const atencion = asignadas.find((a) => a.id === seleccion?.id);
  const detalle = atencion ? detalleDe(atencion) : null;
  const serviciosSolicitados = atencion?.servicioIdsSolicitados || atencion?.servicioIds || [];
  const cambioServicios = serviciosElegidos.length !== (atencion?.servicioIds || []).length ||
    serviciosElegidos.some((id) => !(atencion?.servicioIds || []).includes(id));
  const serviciosSeleccionados = serviciosElegidos.map((id) => ({
    servicio: datos.servicios.find((s) => s.id === id) || { id, nombre: id },
    items: datos.plantillasChecklist.find((p) => p.servicioId === id)?.items || [],
  }));

  const iniciarTrabajo = (a) => {
    setSeleccion({ id: a.id, modo: 'trabajo' });
    setInspeccion({ ...inspeccionVacia, ...(a.inspeccionInicial || {}) });
    setServiciosElegidos([...(a.servicioIds || [])]);
    setMotivoServicios(a.justificacionServicios || '');
    setObservaciones(a.observacionesTecnicas || '');
    setMensaje('');
    const guardadas = {};
    (a.respuestasChecklist || []).forEach((r) => {
      guardadas[`${r.servicioId}:${r.itemId}`] = {
        estado: r.estado || '', observacion: r.observacion || '',
      };
    });
    setRespuestas(guardadas);
  };

  const cambiarRespuesta = (clave, campo, valor) => {
    setRespuestas((prev) => ({
      ...prev, [clave]: { ...prev[clave], [campo]: valor },
    }));
    setMensaje('');
  };

  const cambiarServicio = (id, activo) => {
    setServiciosElegidos((prev) => activo
      ? [...new Set([...prev, id])]
      : prev.filter((item) => item !== id));
    setMensaje('');
  };

  const guardarAvance = (e) => {
    e.preventDefault();
    if (!atencion) return;
    if (!serviciosElegidos.length) return setMensaje('Selecciona al menos un servicio.');
    if (serviciosSeleccionados.some((s) => !s.items.length)) {
      return setMensaje('Uno o más servicios no tienen checklist. Configúralos en Mantenedores.');
    }
    if (cambioServicios && !motivoServicios.trim()) {
      return setMensaje('Explica por qué agregaste o retiraste servicios.');
    }
    if (!inspeccion.encendido || !inspeccion.estadoFisico.trim()) {
      return setMensaje('Completa la inspección inicial del equipo.');
    }

    const registros = serviciosSeleccionados.flatMap(({ servicio, items }) =>
      items.map((item) => {
        const respuesta = respuestas[`${servicio.id}:${item.id}`] || {};
        return {
          servicioId: servicio.id, itemId: item.id, descripcion: item.descripcion,
          estado: respuesta.estado || '', observacion: (respuesta.observacion || '').trim(),
        };
      }));

    if (registros.some((r) => !['Sí', 'No', 'No aplica'].includes(r.estado) ||
      (r.estado === 'No' && !r.observacion))) {
      return setMensaje('Responde todas las tareas y justifica cada resultado «No».');
    }

    dispatch({
      type: 'GUARDAR_AVANCE_TECNICO',
      payload: {
        atencionId: atencion.id,
        servicioIds: [...serviciosElegidos],
        justificacionServicios: cambioServicios ? motivoServicios.trim() : (atencion.justificacionServicios || ''),
        inspeccionInicial: inspeccion,
        respuestasChecklist: registros,
        observacionesTecnicas: observaciones.trim(),
      },
    });
    setSeleccion(null);
    setMensaje('Trabajo técnico guardado. Puedes continuar con la verificación final.');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  if (seleccion?.modo === 'entrega' && atencion && detalle?.dispositivo && detalle?.propietario) {
    return (
      <EntregaEquipo key={atencion.id} atencion={atencion}
        dispositivo={detalle.dispositivo} propietario={detalle.propietario}
        modoOscuro={modoOscuro} onVolver={() => setSeleccion(null)}
        onEntregada={() => {
          setSeleccion(null);
          setMensaje('Equipo entregado. Atención cerrada correctamente en el prototipo.');
        }} />
    );
  }

  if (seleccion?.modo === 'trabajo' && atencion && detalle?.dispositivo &&
    ['asignado', 'en_proceso'].includes(atencion.estado)) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
          <h3 className="fw-bold mb-0" style={{ color: titleColor }}>Atención Técnica</h3>
          <Button variant="secondary" onClick={() => setSeleccion(null)}>Volver</Button>
        </div>
        <Alert variant="secondary">
          <strong>{detalle.dispositivo.marca} {detalle.dispositivo.modelo}</strong>
          <div>Propietario: {detalle.propietario?.nombre} {detalle.propietario?.apellidoPaterno}</div>
          <div>Jornada: {detalle.jornada?.fecha || 'Sin fecha'}</div>
          <div>Falla informada: {atencion.diagnosticoPropietario || 'Sin descripción'}</div>
        </Alert>

        <Form onSubmit={guardarAvance}>
          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">1. Inspección inicial</Card.Header>
            <Card.Body className="p-4">
              <p className={modoOscuro ? 'text-light' : 'text-muted'}>
                Registra el estado del dispositivo junto al propietario antes de intervenirlo.
              </p>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">¿El equipo enciende? *</Form.Label>
                <Form.Select required value={inspeccion.encendido} className={controlClass}
                  onChange={(e) => setInspeccion((p) => ({ ...p, encendido: e.target.value }))}>
                  <option value="">Seleccione...</option>
                  <option value="Sí">Sí, correctamente</option>
                  <option value="Con fallas">Sí, con fallas</option>
                  <option value="No">No enciende</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Estado físico y fallas previas *</Form.Label>
                <Form.Control as="textarea" rows={3} required className={controlClass}
                  placeholder="Pantalla, carcasa, teclado, rayones, golpes..." value={inspeccion.estadoFisico}
                  onChange={(e) => setInspeccion((p) => ({ ...p, estadoFisico: e.target.value }))} />
              </Form.Group>
              <Form.Group>
                <Form.Label className="fw-bold">Accesorios recibidos</Form.Label>
                <Form.Control className={controlClass} value={inspeccion.accesorios}
                  placeholder="Ej.: cargador, mouse o funda"
                  onChange={(e) => setInspeccion((p) => ({ ...p, accesorios: e.target.value }))} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">2. Servicios de mantenimiento</Card.Header>
            <Card.Body className="p-4">
              <SeleccionServicios servicios={datos.servicios} seleccionados={serviciosElegidos}
                solicitados={serviciosSolicitados} motivo={motivoServicios}
                onToggle={cambiarServicio}
                onMotivo={(valor) => { setMotivoServicios(valor); setMensaje(''); }}
                modoOscuro={modoOscuro} />
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">3. Checklist según servicios seleccionados</Card.Header>
            <Card.Body className="p-4">
              {serviciosSeleccionados.map(({ servicio, items }) => (
                <ChecklistServicio key={servicio.id} servicio={servicio} items={items}
                  respuestas={respuestas} onCambiar={cambiarRespuesta}
                  modoOscuro={modoOscuro} />
              ))}
              {!serviciosSeleccionados.length && (
                <Alert variant="warning">Selecciona servicios para cargar sus checklists.</Alert>
              )}
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">4. Observaciones técnicas</Card.Header>
            <Card.Body className="p-4">
              <Form.Control as="textarea" rows={4} maxLength={2000} className={controlClass}
                placeholder="Procedimientos realizados, problemas encontrados y resultados..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)} />
            </Card.Body>
          </Card>

          <div className="d-grid gap-3 mb-5">
            {mensaje && <Alert variant="warning" role="alert" className="mb-0">{mensaje}</Alert>}
            <Button type="submit" variant={modoOscuro ? 'light' : 'danger'} size="lg">
              Guardar trabajo técnico
            </Button>
          </div>
        </Form>
      </>
    );
  }

  return (
    <>
      <h3 className="fw-bold mb-2" style={{ color: titleColor }}>Bandeja Técnica</h3>
      <p className={modoOscuro ? 'text-light' : 'text-muted'}>
        Atenciones activas · {periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}
      </p>
      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {rol === 'tecnico' && !usuarioActual && (
        <Alert variant="warning">La sesión no coincide con un técnico registrado en el prototipo.</Alert>
      )}
      <Card className={cardClass}>
        <Card.Body className="p-0">
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="align-middle mb-0">
            <thead>
              <tr>
                <th className="px-3 py-3">Dispositivo</th><th>Propietario</th>
                <th>Técnico</th><th>Estado</th><th className="text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignadas.map((a) => {
                const { dispositivo, propietario, tecnico } = detalleDe(a);
                if (!dispositivo || !propietario) return null;
                const trabajando = ['asignado', 'en_proceso'].includes(a.estado);
                return (
                  <tr key={a.id}>
                    <td className="px-3">{dispositivo.marca} {dispositivo.modelo}</td>
                    <td>{propietario.nombre} {propietario.apellidoPaterno}</td>
                    <td>{tecnico?.nombre || 'Sin identificar'}</td>
                    <td><Badge bg={a.estado === 'asignado' ? 'warning' : 'info'}
                      text="dark">{etiquetas[a.estado]}</Badge></td>
                    <td className="text-end px-3">
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        {trabajando && (
                          <Button size="sm" variant="outline-secondary" onClick={() => iniciarTrabajo(a)}>
                            {a.estado === 'asignado' ? 'Atender' : 'Continuar trabajo'}
                          </Button>
                        )}
                        {a.estado !== 'asignado' && (
                          <Button size="sm" variant="danger"
                            onClick={() => { setSeleccion({ id: a.id, modo: 'entrega' }); setMensaje(''); }}>
                            Gestionar entrega
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {asignadas.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4">
                  No hay atenciones técnicas activas en este período.
                </td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
