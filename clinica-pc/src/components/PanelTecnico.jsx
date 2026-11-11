
import { useState } from 'react';
import { Card, Form, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import ChecklistServicio from './tecnico/ChecklistServicio.jsx';
import EntregaEquipo from './tecnico/EntregaEquipo.jsx';

const inspeccionVacia = { encendido: '', estadoFisico: '', accesorios: '' };
const estadosVisibles = ['asignado', 'en_proceso', 'listo_entrega', 'contactado'];

const normalizar = (valor) =>
  String(valor || '').trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const etiquetas = {
  asignado: 'Asignado',
  en_proceso: 'En proceso',
  listo_entrega: 'Listo para entrega',
  contactado: 'Propietario avisado',
};

export default function PanelTecnico({ modoOscuro, periodoGlobal = 'Todos' }) {
  const { datos, dispatch } = useClinica();

  const [seleccion, setSeleccion] = useState(null);
  const [inspeccion, setInspeccion] = useState({ ...inspeccionVacia });
  const [respuestas, setRespuestas] = useState({});
  const [observaciones, setObservaciones] = useState('');
  const [mensaje, setMensaje] = useState('');

  const rol = sessionStorage.getItem('userRol');
  const nombreSesion = sessionStorage.getItem('userNombre');

  const usuarioActual = datos.usuarios.find((u) =>
    u.rol === 'tecnico' &&
    (normalizar(u.nombre) === normalizar(nombreSesion) ||
     normalizar(u.id) === normalizar(nombreSesion))
  );

  const jornadasIds = new Set(
    datos.jornadas
      .filter((j) => periodoGlobal === 'Todos' || j.periodo === periodoGlobal)
      .map((j) => j.id)
  );

  const asignadas = datos.atenciones.filter((a) => {
    if (!estadosVisibles.includes(a.estado) || !jornadasIds.has(a.jornadaId)) {
      return false;
    }

    return rol === 'superusuario' ||
      (rol === 'tecnico' && a.tecnicoIds?.includes(usuarioActual?.id));
  });

  const obtenerDetalle = (atencion) => {
    const dispositivo = datos.dispositivos.find((d) => d.id === atencion.dispositivoId);
    const propietario = datos.propietarios.find((p) => p.id === dispositivo?.propietarioId);
    const tecnico = datos.usuarios.find((u) => u.id === atencion.tecnicoIds?.[0]);
    return { dispositivo, propietario, tecnico };
  };

  const atencion = asignadas.find((a) => a.id === seleccion?.id);
  const detalle = atencion ? obtenerDetalle(atencion) : null;

  const serviciosAtencion = (atencion?.servicioIds || []).map((id) => ({
    servicio: datos.servicios.find((s) => s.id === id) || { id, nombre: id },
    items: datos.plantillasChecklist.find((p) => p.servicioId === id)?.items || [],
  }));

  const iniciarTrabajo = (a) => {
    setSeleccion({ id: a.id, modo: 'trabajo' });
    setInspeccion(a.inspeccionInicial || { ...inspeccionVacia });
    setObservaciones(a.observacionesTecnicas || '');
    setMensaje('');

    const guardadas = {};
    (a.respuestasChecklist || []).forEach((r) => {
      guardadas[`${r.servicioId}:${r.itemId}`] = {
        estado: r.estado, observacion: r.observacion,
      };
    });
    setRespuestas(guardadas);
  };

  const cambiarRespuesta = (clave, campo, valor) => {
    setRespuestas((prev) => ({
      ...prev, [clave]: { ...prev[clave], [campo]: valor },
    }));
  };

  const guardarAvance = (e) => {
    e.preventDefault();
    if (!atencion) return;

    if (!serviciosAtencion.length || serviciosAtencion.some((s) => !s.items.length)) {
      return setMensaje('Faltan plantillas para uno o más servicios.');
    }

    const registros = serviciosAtencion.flatMap(({ servicio, items }) =>
      items.map((item) => {
        const r = respuestas[`${servicio.id}:${item.id}`] || {};
        return {
          servicioId: servicio.id, itemId: item.id,
          descripcion: item.descripcion,
          estado: r.estado || '', observacion: (r.observacion || '').trim(),
        };
      })
    );

    if (registros.some((r) => !r.estado || (r.estado === 'No' && !r.observacion))) {
      return setMensaje('Completa todas las respuestas y justifica los resultados No.');
    }

    if (!inspeccion.encendido || !inspeccion.estadoFisico.trim()) {
      return setMensaje('Completa la inspección inicial.');
    }

    dispatch({
      type: 'GUARDAR_AVANCE_TECNICO',
      payload: {
        atencionId: atencion.id,
        inspeccionInicial: inspeccion,
        respuestasChecklist: registros,
        observacionesTecnicas: observaciones.trim(),
      },
    });

    setSeleccion(null);
    setMensaje('Trabajo guardado. Ahora puedes gestionar la verificación final.');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  // ENTREGA: módulo separado del trabajo técnico.
  if (seleccion?.modo === 'entrega' && atencion && detalle?.dispositivo &&
      detalle?.propietario) {
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

  // TRABAJO TÉCNICO.
  if (seleccion?.modo === 'trabajo' && atencion && detalle?.dispositivo &&
      ['asignado', 'en_proceso'].includes(atencion.estado)) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
          <h3 className="fw-bold mb-0" style={{ color: titleColor }}>Atención Técnica</h3>
          <Button variant="secondary" onClick={() => setSeleccion(null)}>Volver</Button>
        </div>

        {mensaje && <Alert variant="warning">{mensaje}</Alert>}

        <Alert variant="secondary">
          <strong>{detalle.dispositivo.marca} {detalle.dispositivo.modelo}</strong>
          <div>Propietario: {detalle.propietario?.nombre} {detalle.propietario?.apellidoPaterno}</div>
          <div>Falla informada: {atencion.diagnosticoPropietario || 'Sin descripción'}</div>
        </Alert>

        <Form onSubmit={guardarAvance}>
          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">1. Inspección inicial</Card.Header>
            <Card.Body className="p-4">
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
                  placeholder="Pantalla, carcasa, teclado, rayones, golpes..."
                  value={inspeccion.estadoFisico}
                  onChange={(e) => setInspeccion((p) => ({ ...p, estadoFisico: e.target.value }))} />
              </Form.Group>

              <Form.Group>
                <Form.Label className="fw-bold">Accesorios recibidos</Form.Label>
                <Form.Control className={controlClass} value={inspeccion.accesorios}
                  placeholder="Ej: cargador, mouse o funda"
                  onChange={(e) => setInspeccion((p) => ({ ...p, accesorios: e.target.value }))} />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">2. Checklist según servicio</Card.Header>
            <Card.Body className="p-4">
              {serviciosAtencion.map(({ servicio, items }) => (
                <ChecklistServicio key={servicio.id} servicio={servicio} items={items}
                  respuestas={respuestas} onCambiar={cambiarRespuesta}
                  modoOscuro={modoOscuro} />
              ))}
            </Card.Body>
          </Card>

          <Card className={cardClass}>
            <Card.Header className="fw-bold py-3">3. Observaciones técnicas</Card.Header>
            <Card.Body className="p-4">
              <Form.Control as="textarea" rows={4} className={controlClass}
                placeholder="Procedimientos realizados, problemas encontrados y resultados..."
                value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end mb-5">
            <Button type="submit" variant={modoOscuro ? 'light' : 'danger'} size="lg">
              Guardar trabajo técnico
            </Button>
          </div>
        </Form>
      </>
    );
  }

  // BANDEJA DE TRABAJO Y ENTREGAS.
  return (
    <>
      <h3 className="fw-bold mb-2" style={{ color: titleColor }}>Bandeja Técnica</h3>
      <p className={modoOscuro ? 'text-light' : 'text-muted'}>
        Atenciones activas · {periodoGlobal === 'Todos' ? 'Todos los períodos' : periodoGlobal}
      </p>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}

      {rol === 'tecnico' && !usuarioActual && (
        <Alert variant="warning">
          La sesión no coincide con un técnico registrado en el prototipo.
        </Alert>
      )}

      <Card className={cardClass}>
        <Card.Body className="p-0">
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}
            className="align-middle mb-0">
            <thead>
              <tr>
                <th className="px-3 py-3">Dispositivo</th>
                <th>Propietario</th>
                <th>Técnico</th>
                <th>Estado</th>
                <th className="text-end px-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignadas.map((a) => {
                const { dispositivo, propietario, tecnico } = obtenerDetalle(a);
                if (!dispositivo || !propietario) return null;

                const trabajando = ['asignado', 'en_proceso'].includes(a.estado);

                return (
                  <tr key={a.id}>
                    <td className="px-3">{dispositivo.marca} {dispositivo.modelo}</td>
                    <td>{propietario.nombre} {propietario.apellidoPaterno}</td>
                    <td>{tecnico?.nombre || 'Sin identificar'}</td>
                    <td>
                      <Badge bg={a.estado === 'asignado' ? 'warning' : 'info'}
                        text="dark">{etiquetas[a.estado]}</Badge>
                    </td>
                    <td className="text-end px-3">
                      <div className="d-flex flex-wrap justify-content-end gap-2">
                        {trabajando && (
                          <Button size="sm" variant="outline-secondary"
                            onClick={() => iniciarTrabajo(a)}>
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
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No hay atenciones técnicas activas en este período.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </>
  );
}
