import { useState } from 'react';
import { Card, Form, Row, Col, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import './mantenedores/MantenedoresVisual.css';
import { fechaLocal, obtenerEstadoJornada, etiquetasEstadoJornada } from '../utils/jornadas.js';

const estadosFinales = ['entregado', 'no_presentado', 'cancelado', 'cerrada', 'finalizada'];
const rolesPermitidos = ['tecnico', 'recepcionista', 'superusuario'];
const normalizar = (v) => String(v ?? '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const etiquetasRol = { tecnico: 'Técnico', recepcionista: 'Recepcionista', superusuario: 'Superusuario' };

// Analiza CSV delimitado por comas o punto y coma y respeta campos entre comillas.
function leerCSV(texto) {
  const primera = texto.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || '';
  const delimitador = (primera.match(/;/g) || []).length > (primera.match(/,/g) || []).length ? ';' : ',';
  const filas = [];
  let fila = [], valor = '', comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (c === '"') {
      if (comillas && texto[i + 1] === '"') { valor += '"'; i++; }
      else comillas = !comillas;
    } else if (c === delimitador && !comillas) {
      fila.push(valor.trim()); valor = '';
    } else if ((c === '\n' || c === '\r') && !comillas) {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(valor.trim());
      if (fila.some(Boolean)) filas.push(fila);
      fila = []; valor = '';
    } else valor += c;
  }
  if (comillas) throw new Error('El CSV contiene comillas sin cerrar.');
  fila.push(valor.trim());
  if (fila.some(Boolean)) filas.push(fila);
  return filas;
}

export default function ParametrosMantenedores({ modoOscuro = false }) {
  const { datos, dispatch } = useClinica();
  const [aviso, setAviso] = useState(null);
  const jornadas = [...datos.jornadas].sort((a, b) => b.fecha.localeCompare(a.fecha));
  const colores = { programada: 'primary', activa: 'success', pendiente_cierre: 'warning', finalizada: 'secondary' };

  const ejemplos = datos.atenciones.filter((a) => a.jornadaId === 'JOR-001' &&
    a.estado === 'preinscrito' && ((a.id === 'AT-001' && a.dispositivoId === 'DISP-001') ||
      (a.id === 'AT-002' && a.dispositivoId === 'DISP-002')));
  const pendientesPasados = datos.atenciones.filter((a) => {
    const jornada = datos.jornadas.find((j) => j.id === a.jornadaId);
    return a.estado === 'preinscrito' && jornada?.fecha < fechaLocal();
  });

  const handleCrearJornada = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const periodo = String(fd.get('periodo') || '').trim();
    const fecha = String(fd.get('fecha') || '');
    if (!periodo || !fecha) return;
    if (fecha < fechaLocal()) return setAviso({ tipo: 'danger', texto: 'No puedes crear jornadas en el pasado.' });
    if (datos.jornadas.some((j) => normalizar(j.periodo) === normalizar(periodo) && j.fecha === fecha)) {
      return setAviso({ tipo: 'warning', texto: 'Ya existe esa jornada.' });
    }
    dispatch({ type: 'CREAR_JORNADA', payload: { id: `JOR-${crypto.randomUUID()}`, periodo, fecha, estado: 'programada' } });
    form.reset();
    setAviso({ tipo: 'success', texto: 'Jornada registrada correctamente.' });
  };
  const iniciarJornada = (j) => {
    if (window.confirm(`¿Iniciar la jornada del ${j.fecha}?`)) dispatch({ type: 'INICIAR_JORNADA', payload: j.id });
  };
  const cerrarJornada = (j) => {
    const abiertas = datos.atenciones.filter((a) => a.jornadaId === j.id && !estadosFinales.includes(a.estado));
    if (abiertas.length) return setAviso({ tipo: 'warning', texto: `No se puede cerrar: hay ${abiertas.length} atención(es) sin resolver.` });
    if (window.confirm(`¿Finalizar administrativamente la jornada del ${j.fecha}?`)) {
      dispatch({ type: 'CERRAR_JORNADA', payload: j.id });
    }
  };
  const marcarNoPresentado = (a) => {
    if (window.confirm('¿Confirmas que el equipo no se presentó?')) {
      dispatch({ type: 'MARCAR_NO_PRESENTADO', payload: a.id });
    }
  };
  const limpiarEjemplos = () => {
    if (ejemplos.length && window.confirm(`Se eliminarán ${ejemplos.length} atenciones originales de demostración. ¿Continuar?`)) {
      dispatch({ type: 'LIMPIAR_DATOS_DEMO' });
    }
  };
  const handleCrearChecklist = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const servicioId = String(fd.get('servicioId') || '');
    const descripcion = String(fd.get('descripcion') || '').trim();
    if (!descripcion || !datos.servicios.some((s) => s.id === servicioId)) return;
    const plantilla = datos.plantillasChecklist.find((p) => p.servicioId === servicioId);
    if (plantilla?.items.some((i) => normalizar(i.descripcion) === normalizar(descripcion))) {
      return setAviso({ tipo: 'warning', texto: 'La tarea ya existe en ese checklist.' });
    }
    dispatch({ type: 'AGREGAR_ITEM_CHECKLIST', payload: { servicioId, item: { id: `ITEM-${crypto.randomUUID()}`, descripcion } } });
    form.reset();
    setAviso({ tipo: 'success', texto: 'Tarea agregada al checklist.' });
  };

  const registrarUsuarios = (usuarios) => {
    const existentes = new Set(datos.usuarios.map((u) => normalizar(u.nombre)));
    const nuevos = [], duplicados = [];
    for (const u of usuarios) {
      const nombre = String(u.nombre || '').trim();
      const rol = normalizar(u.rol);
      if (!nombre || !rolesPermitidos.includes(rol) || existentes.has(normalizar(nombre))) {
        duplicados.push(nombre || '(sin nombre)'); continue;
      }
      existentes.add(normalizar(nombre));
      nuevos.push({ id: `USR-${crypto.randomUUID()}`, nombre, rol });
    }
    if (nuevos.length) dispatch({ type: 'AGREGAR_USUARIOS', payload: nuevos });
    setAviso({ tipo: nuevos.length ? 'success' : 'warning',
      texto: `${nuevos.length} usuario(s) agregado(s). ${duplicados.length} omitido(s) por duplicados o datos inválidos.` });
  };
  const handleCrearUsuario = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    registrarUsuarios([{ nombre: fd.get('nombre'), rol: fd.get('rol') }]);
    form.reset();
  };
  const handleCargaMasiva = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const archivo = form.querySelector('input[name="archivo"]')?.files?.[0];
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      return setAviso({ tipo: 'danger', texto: 'Utiliza un archivo .csv (UTF-8). En Excel puedes guardarlo como CSV UTF-8.' });
    }
    if (archivo.size > 1024 * 1024) return setAviso({ tipo: 'danger', texto: 'El CSV debe pesar menos de 1 MB.' });
    try {
      const filas = leerCSV((await archivo.text()).replace(/^\uFEFF/, ''));
      if (filas.length < 2) throw new Error('El CSV está vacío o no contiene datos.');
      const encabezados = filas[0].map(normalizar);
      const idxNombre = encabezados.indexOf('nombre');
      const idxRol = encabezados.indexOf('rol');
      if (idxNombre < 0 || idxRol < 0) throw new Error('El CSV debe incluir columnas nombre y rol.');
      registrarUsuarios(filas.slice(1).map((fila) => ({ nombre: fila[idxNombre], rol: fila[idxRol] })));
      form.reset();
    } catch (err) { setAviso({ tipo: 'danger', texto: err.message || 'No se pudo leer el CSV.' }); }
  };

  return (
    <section className={`mantenedores-pro ${modoOscuro ? 'tema-oscuro' : 'tema-claro'}`}>
      <header className="mp-page-header">
        <div>
          <p className="mp-eyebrow">CLÍNICA DEL PC / ADMINISTRACIÓN</p>
          <h1 className="mp-page-title">Parámetros y mantenedores</h1>
          <p className="mp-description">Organiza jornadas, personal y plantillas de trabajo técnico.</p>
        </div>
        <div className="mp-summary" aria-label="Resumen de configuración">
          <div className="mp-summary-item">
            <strong>{jornadas.length}</strong>
            <span>Jornadas</span>
          </div>
          <div className="mp-summary-item">
            <strong>{datos.usuarios.length}</strong>
            <span>Integrantes</span>
          </div>
          <div className="mp-summary-item">
            <strong>{datos.plantillasChecklist.length}</strong>
            <span>Plantillas</span>
          </div>
        </div>
      </header>

      {aviso && (
        <Alert variant={aviso.tipo} className="mp-notice" dismissible onClose={() => setAviso(null)}>
          {aviso.texto}
        </Alert>
      )}

      <Card className="mp-section">
        <Card.Header className="mp-section-header">
          <span className="mp-step">01</span>
          <div>
            <h2>Administración de jornadas</h2>
            <p>Programa nuevas fechas y gestiona el estado de cada jornada.</p>
          </div>
        </Card.Header>
        <Card.Body className="mp-section-body">
          <Form onSubmit={handleCrearJornada} className="mp-form-block">
            <Row className="g-3 align-items-end">
              <Col md={5}>
                <Form.Label htmlFor="mp-periodo">Período académico *</Form.Label>
                <Form.Control id="mp-periodo" name="periodo" placeholder="Ej.: Primavera 2026" required className="mp-input" />
              </Col>
              <Col md={5}>
                <Form.Label htmlFor="mp-fecha">Fecha de ejecución *</Form.Label>
                <Form.Control id="mp-fecha" type="date" name="fecha" min={fechaLocal()} required className="mp-input" />
              </Col>
              <Col md={2} className="d-grid">
                <Button type="submit" variant="danger" className="mp-btn-primary">Registrar jornada</Button>
              </Col>
            </Row>
          </Form>

          <div className="mp-subheading">
            <div>
              <h3>Jornadas registradas</h3>
              <p>Consulta las fechas y acciones disponibles.</p>
            </div>
            <span className="mp-count">{jornadas.length} {jornadas.length === 1 ? 'jornada' : 'jornadas'}</span>
          </div>
          <div className="mp-table-wrapper">
            <Table responsive hover className="mp-table mb-0">
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
                      <td><strong>{j.periodo}</strong></td>
                      <td>{j.fecha}</td>
                      <td>
                        <Badge bg={colores[estado] || 'secondary'} text={estado === 'pendiente_cierre' ? 'dark' : undefined}>
                          {etiquetasEstadoJornada[estado] || estado}
                        </Badge>
                      </td>
                      <td>
                        {iniciar && <Button size="sm" variant="outline-success" onClick={() => iniciarJornada(j)}>Iniciar</Button>}
                        {cerrar && <Button size="sm" variant="outline-danger" onClick={() => cerrarJornada(j)}>Cerrar</Button>}
                        {!iniciar && !cerrar && <span className="mp-muted">Sin acciones</span>}
                      </td>
                    </tr>
                  );
                })}
                {!jornadas.length && (
                  <tr><td colSpan={4} className="mp-empty">Todavía no hay jornadas registradas.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Card className="mp-section">
        <Card.Header className="mp-section-header">
          <span className="mp-step">02</span>
          <div>
            <h2>Preinscripciones de jornadas pasadas</h2>
            <p>Identifica a los equipos que no se presentaron a su jornada.</p>
          </div>
          <span className="mp-count mp-header-count">{pendientesPasados.length} pendientes</span>
        </Card.Header>
        <Card.Body className="mp-section-body">
          <Alert variant="info" className="mp-info-banner">
            Los equipos marcados como no presentados permanecen en el historial.
          </Alert>
          <div className="mp-table-wrapper">
            <Table responsive hover className="mp-table mb-0">
              <thead><tr><th>Equipo</th><th>Jornada</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {pendientesPasados.map((a) => {
                  const d = datos.dispositivos.find((x) => x.id === a.dispositivoId);
                  const j = datos.jornadas.find((x) => x.id === a.jornadaId);
                  return (
                    <tr key={a.id}>
                      <td><strong>{d ? `${d.marca} ${d.modelo}` : 'Sin dispositivo'}</strong></td>
                      <td>{j?.periodo} — {j?.fecha}</td>
                      <td><Badge bg="warning" text="dark">Sin recepción</Badge></td>
                      <td>
                        <Button size="sm" variant="outline-danger" onClick={() => marcarNoPresentado(a)}>
                          No presentado
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {!pendientesPasados.length && (
                  <tr><td colSpan={4} className="mp-empty">No hay preinscripciones vencidas.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Card className="mp-section">
        <Card.Header className="mp-section-header">
          <span className="mp-step">03</span>
          <div>
            <h2>Administración de personal</h2>
            <p>Agrega integrantes individualmente o importa un archivo CSV.</p>
          </div>
        </Card.Header>
        <Card.Body className="mp-section-body">
          <div className="mp-two-columns">
            <div className="mp-inner-card">
              <h3>Agregar usuario</h3>
              <p className="mp-muted">Registra un integrante del equipo.</p>
              <Form onSubmit={handleCrearUsuario}>
                <Row className="g-3">
                  <Col xs={12}>
                    <Form.Label htmlFor="mp-nombre">Nombre completo *</Form.Label>
                    <Form.Control id="mp-nombre" name="nombre" maxLength={100} required className="mp-input" placeholder="Nombre y apellido" />
                  </Col>
                  <Col xs={12}>
                    <Form.Label htmlFor="mp-rol">Rol *</Form.Label>
                    <Form.Select id="mp-rol" name="rol" required defaultValue="" className="mp-select">
                      <option value="">Seleccione...</option>
                      {rolesPermitidos.map((r) => <option key={r} value={r}>{etiquetasRol[r]}</option>)}
                    </Form.Select>
                  </Col>
                  <Col xs={12} className="d-grid">
                    <Button type="submit" variant="danger" className="mp-btn-primary">Agregar integrante</Button>
                  </Col>
                </Row>
              </Form>
            </div>
            <div className="mp-inner-card">
              <h3>Importación desde CSV</h3>
              <p className="mp-muted">Carga varios integrantes desde un archivo UTF-8.</p>
              <Form onSubmit={handleCargaMasiva}>
                <Form.Label htmlFor="mp-archivo">Archivo CSV UTF-8 *</Form.Label>
                <Form.Control id="mp-archivo" type="file" name="archivo" accept=".csv,text/csv" required className="mp-input" />
                <Form.Text className="mp-helper">
                  Columnas obligatorias: <code>nombre,rol</code>. Roles: tecnico, recepcionista, superusuario. En Excel, exporta a CSV UTF-8.
                </Form.Text>
                <div className="d-grid mt-3">
                  <Button type="submit" variant="danger" className="mp-btn-primary">Importar personal</Button>
                </div>
              </Form>
            </div>
          </div>
          <div className="mp-subheading">
            <div>
              <h3>Personal registrado</h3>
              <p>Usuarios disponibles para las operaciones del prototipo.</p>
            </div>
            <span className="mp-count">{datos.usuarios.length} integrantes</span>
          </div>
          <div className="mp-table-wrapper">
            <Table responsive hover className="mp-table mb-0">
              <thead><tr><th>Nombre</th><th>Rol</th></tr></thead>
              <tbody>
                {datos.usuarios.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{u.nombre}</strong></td>
                    <td><span className="mp-role">{etiquetasRol[u.rol] || u.rol}</span></td>
                  </tr>
                ))}
                {!datos.usuarios.length && (
                  <tr><td colSpan={2} className="mp-empty">No hay personal registrado.</td></tr>
                )}
              </tbody>
            </Table>
          </div>
          <Alert variant="secondary" className="mp-help-note mb-0 mt-3">
            Los integrantes nuevos pueden aparecer en las listas de asignación. El acceso por login continúa siendo simulado: agregar un usuario no crea credenciales reales.
          </Alert>
        </Card.Body>
      </Card>

      <Card className="mp-section">
        <Card.Header className="mp-section-header">
          <span className="mp-step">04</span>
          <div>
            <h2>Checklists dinámicos</h2>
            <p>Amplía las tareas de revisión según el servicio técnico.</p>
          </div>
        </Card.Header>
        <Card.Body className="mp-section-body">
          <Form onSubmit={handleCrearChecklist} className="mp-form-block">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Label htmlFor="mp-servicio">Servicio *</Form.Label>
                <Form.Select id="mp-servicio" name="servicioId" defaultValue="" required className="mp-select">
                  <option value="">Seleccione...</option>
                  {datos.servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </Form.Select>
              </Col>
              <Col md={6}>
                <Form.Label htmlFor="mp-descripcion">Nueva tarea *</Form.Label>
                <Form.Control id="mp-descripcion" name="descripcion" maxLength={200} required className="mp-input" placeholder="Ej.: Verificar temperatura" />
              </Col>
              <Col md={2} className="d-grid">
                <Button type="submit" variant="danger" className="mp-btn-primary">Agregar ítem</Button>
              </Col>
            </Row>
          </Form>
          <div className="mp-subheading">
            <div>
              <h3>Plantillas registradas</h3>
              <p>Lista de tareas disponibles para cada servicio.</p>
            </div>
            <span className="mp-count">{datos.plantillasChecklist.length} plantillas</span>
          </div>
          <div className="mp-templates">
            {datos.plantillasChecklist.map((p) => {
              const servicio = datos.servicios.find((s) => s.id === p.servicioId);
              return (
                <section key={p.id} className="mp-template">
                  <div className="mp-template-header">
                    <h4>{servicio?.nombre || p.servicioId}</h4>
                    <span className="mp-count">{p.items.length} tareas</span>
                  </div>
                  <ol>
                    {p.items.map((i) => <li key={i.id}>{i.descripcion}</li>)}
                  </ol>
                </section>
              );
            })}
            {!datos.plantillasChecklist.length && (
              <p className="mp-empty">No hay plantillas registradas.</p>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card className="mp-section mp-section-danger">
        <Card.Header className="mp-section-header">
          <span className="mp-step">05</span>
          <div>
            <h2>Datos iniciales de demostración</h2>
            <p>Elimina exclusivamente los registros de ejemplo que reconoce el sistema.</p>
          </div>
        </Card.Header>
        <Card.Body className="mp-section-body">
          <div className="mp-demo-action">
            <div>
              <p className="mb-1">Ejemplos originales detectados: <strong>{ejemplos.length}</strong></p>
              <p className="mp-muted mb-0">No elimina los registros nuevos. La eliminación solicita confirmación.</p>
            </div>
            <Button variant="outline-danger" disabled={!ejemplos.length} onClick={limpiarEjemplos}>
              Eliminar ejemplos originales
            </Button>
          </div>
        </Card.Body>
      </Card>
    </section>
  );
}
