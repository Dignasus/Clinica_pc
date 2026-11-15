import { useState } from 'react';
import { Alert, Badge, Button, Card, Form, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import { tienePermiso } from '../data/roles.js';
import ChecklistServicio from './tecnico/ChecklistServicio.jsx';
import SeleccionServicios from './tecnico/SeleccionServicios.jsx';
import EntregaEquipo from './tecnico/EntregaEquipo.jsx';
import './tecnico/PanelTecnicoVisual.css';

const inspeccionVacia = { encendido: '', estadoFisico: '', accesorios: '' };
const estadosVisibles = ['asignado', 'en_proceso', 'listo_entrega', 'contactado'];
const etiquetas = {
  asignado: 'Asignado', en_proceso: 'En proceso',
  listo_entrega: 'Listo para entrega', contactado: 'Propietario avisado',
};
const normalizar = (valor) => String(valor || '').trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function PanelTecnico({ modoOscuro, periodoGlobal = 'Todos', usuarioId = '', puedeVerTodos = false }) {
  const { datos, dispatch } = useClinica();
  const [seleccion, setSeleccion] = useState(null);
  const [inspeccion, setInspeccion] = useState({ ...inspeccionVacia });
  const [serviciosElegidos, setServiciosElegidos] = useState([]);
  const [motivoServicios, setMotivoServicios] = useState('');
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  const usuarioActual = datos.usuarios.find((u) => u.id === usuarioId && tienePermiso(datos, u.rol, 'tecnico'));
  const rol = usuarioActual?.rol;
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

  const layoutClass = `pc-tech${modoOscuro ? ' pc-tech--dark' : ''}`;
  const cardClass = 'pc-tech-card';
  const controlClass = 'pc-tech-control';

  if (seleccion?.modo === 'entrega' && atencion && detalle?.dispositivo && detalle?.propietario) {
    return (
      <div className={layoutClass}>
        <EntregaEquipo key={atencion.id} atencion={atencion}
          dispositivo={detalle.dispositivo} propietario={detalle.propietario}
          modoOscuro={modoOscuro} onVolver={() => setSeleccion(null)}
          onEntregada={() => {
            setSeleccion(null);
            setMensaje('Equipo entregado. Atención cerrada correctamente en el prototipo.');
          }} />
      </div>
    );
  }

  if (seleccion?.modo === 'trabajo' && atencion && detalle?.dispositivo &&
    ['asignado', 'en_proceso'].includes(atencion.estado)) {
    return (
      <div className={layoutClass}>
        <div className="pc-tech-heading">
          <div>
            <span className="pc-tech-eyebrow">CLÍNICA DEL PC / ÁREA TÉCNICA</span>
            <h2>Atención técnica</h2>
            <p>Documenta el estado del equipo, los servicios y cada tarea realizada.</p>
          </div>
          <Button type="button" variant="outline-secondary" className="pc-tech-back"
            onClick={() => setSeleccion(null)}>Volver a la bandeja</Button>
        </div>

        <div className="pc-tech-summary">
          <div className="pc-tech-summary-head">
            <span className="pc-tech-kicker">EQUIPO EN ATENCIÓN</span>
            <Badge bg={atencion.estado === 'asignado' ? 'warning' : 'info'}
              text="dark" className="pc-tech-status">
              {etiquetas[atencion.estado]}
            </Badge>
          </div>
          <h3>{detalle.dispositivo.marca} {detalle.dispositivo.modelo}</h3>
          <div className="pc-tech-summary-grid">
            <div><span>Propietario</span><strong>{detalle.propietario?.nombre} {detalle.propietario?.apellidoPaterno}</strong></div>
            <div><span>Jornada</span><strong>{detalle.jornada?.fecha || 'Sin fecha'}</strong></div>
            <div className="pc-tech-summary-wide"><span>Falla informada</span><strong>{atencion.diagnosticoPropietario || 'Sin descripción'}</strong></div>
          </div>
        </div>

        <Form onSubmit={guardarAvance}>
          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">01</span>
              <div><strong>Inspección inicial</strong><small>Estado del dispositivo al ingresar al taller</small></div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <p className="pc-tech-help">Registra el estado del dispositivo junto al propietario antes de intervenirlo.</p>
              <div className="pc-tech-fields">
                <Form.Group controlId="pc-tech-encendido">
                  <Form.Label>¿El equipo enciende? *</Form.Label>
                  <Form.Select required value={inspeccion.encendido} className={controlClass}
                    onChange={(e) => setInspeccion((p) => ({ ...p, encendido: e.target.value }))}>
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí, correctamente</option>
                    <option value="Con fallas">Sí, con fallas</option>
                    <option value="No">No enciende</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="pc-tech-accesorios">
                  <Form.Label>Accesorios recibidos</Form.Label>
                  <Form.Control className={controlClass} value={inspeccion.accesorios}
                    placeholder="Ej.: cargador, mouse o funda"
                    onChange={(e) => setInspeccion((p) => ({ ...p, accesorios: e.target.value }))} />
                </Form.Group>
                <Form.Group className="pc-tech-field-full" controlId="pc-tech-estado-fisico">
                  <Form.Label>Estado físico y fallas previas *</Form.Label>
                  <Form.Control as="textarea" rows={3} required className={controlClass}
                    placeholder="Pantalla, carcasa, teclado, rayones, golpes..." value={inspeccion.estadoFisico}
                    onChange={(e) => setInspeccion((p) => ({ ...p, estadoFisico: e.target.value }))} />
                </Form.Group>
              </div>
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">02</span>
              <div><strong>Servicios de mantenimiento</strong><small>Selecciona los servicios que corresponden</small></div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <SeleccionServicios servicios={datos.servicios} seleccionados={serviciosElegidos}
                solicitados={serviciosSolicitados} motivo={motivoServicios}
                onToggle={cambiarServicio}
                onMotivo={(valor) => { setMotivoServicios(valor); setMensaje(''); }}
                modoOscuro={modoOscuro} />
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">03</span>
              <div><strong>Checklist de servicios</strong><small>Responde cada verificación técnica</small></div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              {serviciosSeleccionados.map(({ servicio, items }) => (
                <ChecklistServicio key={servicio.id} servicio={servicio} items={items}
                  respuestas={respuestas} onCambiar={cambiarRespuesta}
                  modoOscuro={modoOscuro} />
              ))}
              {!serviciosSeleccionados.length && (
                <Alert variant="warning" className="mb-0">Selecciona servicios para cargar sus checklists.</Alert>
              )}
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="pc-tech-card-head">
              <span className="pc-tech-number">04</span>
              <div><strong>Observaciones técnicas</strong><small>Procedimientos, problemas y resultados</small></div>
            </Card.Header>
            <Card.Body className="pc-tech-card-body">
              <Form.Control as="textarea" rows={4} maxLength={2000} className={controlClass}
                aria-label="Observaciones técnicas"
                placeholder="Procedimientos realizados, problemas encontrados y resultados..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)} />
            </Card.Body>
          </Card>

          <div className="pc-tech-submit">
            {mensaje && <Alert variant="warning" role="alert" className="mb-0">{mensaje}</Alert>}
            <Button type="submit" variant="danger" size="lg" className="pc-tech-primary">
              Guardar trabajo técnico
            </Button>
          </div>
        </Form>
      </div>
    );
  }

  return (
    <div className={layoutClass}>
      <div className="pc-tech-heading">
        <div>
          <span className="pc-tech-eyebrow">CLÍNICA DEL PC / OPERACIONES</span>
          <h2>Bandeja técnica</h2>
          <p>Atenciones activas · {periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}</p>
        </div>
        <div className="pc-tech-count">
          <strong>{asignadas.length}</strong>
          <span>{asignadas.length === 1 ? 'atención activa' : 'atenciones activas'}</span>
        </div>
      </div>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {!usuarioActual && !puedeVerTodos && (
        <Alert variant="warning">La sesión no coincide con un técnico registrado en el prototipo.</Alert>
      )}

      <Card className={cardClass}>
        <Card.Header className="pc-tech-card-head">
          <span className="pc-tech-number">01</span>
          <div><strong>Atenciones asignadas</strong><small>Selecciona un dispositivo para continuar el trabajo</small></div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="pc-tech-table align-middle mb-0">
            <thead>
              <tr>
                <th>Dispositivo</th><th>Propietario</th>
                <th>Técnico asignado</th><th>Estado</th><th className="text-end">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignadas.map((a) => {
                const { dispositivo, propietario, tecnico } = detalleDe(a);
                if (!dispositivo || !propietario) return null;
                const trabajando = ['asignado', 'en_proceso'].includes(a.estado);
                return (
                  <tr key={a.id}>
                    <td><strong>{dispositivo.marca} {dispositivo.modelo}</strong>
                      <small className="pc-tech-row-id">{a.id.slice(0, 16)}...</small></td>
                    <td>{propietario.nombre} {propietario.apellidoPaterno}</td>
                    <td>{tecnico?.nombre || 'Sin identificar'}</td>
                    <td><Badge bg={a.estado === 'asignado' ? 'warning' : 'info'} text="dark"
                      className="pc-tech-status">{etiquetas[a.estado]}</Badge></td>
                    <td className="text-end">
                      <div className="pc-tech-row-actions">
                        {trabajando && (
                          <Button size="sm" variant="outline-secondary" className="pc-tech-secondary"
                            onClick={() => iniciarTrabajo(a)}>
                            {a.estado === 'asignado' ? 'Atender' : 'Continuar trabajo'}
                          </Button>
                        )}
                        {a.estado !== 'asignado' && (
                          <Button size="sm" variant="danger" className="pc-tech-primary"
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
                <tr><td colSpan={5}>
                  <div className="pc-tech-empty">
                    <span className="pc-tech-empty-icon" aria-hidden="true">✓</span>
                    <strong>No hay atenciones técnicas activas</strong>
                    <p>No hay dispositivos pendientes de trabajo en el período seleccionado.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}
