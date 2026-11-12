import { useState } from 'react';
import { Card, Form, Row, Col, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
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
  const cardClass = `shadow-sm border-0 mb-4 ${modoOscuro ? 'bg-dark text-light' : ''}`;
  const headerClass = `fw-bold py-3 ${modoOscuro ? 'bg-secondary text-light' : 'bg-white'}`;
  const controlClass = modoOscuro ? 'bg-dark text-light' : '';
  const botonVariante = modoOscuro ? 'light' : 'danger';
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
    <>
      <h3 className="fw-bold text-danger mb-1">Parámetros y Mantenedores</h3>
      <p className={modoOscuro ? 'text-light mb-4' : 'text-muted mb-4'}>Administración de jornadas, personal y checklists.</p>
      {aviso && <Alert variant={aviso.tipo} dismissible onClose={() => setAviso(null)}>{aviso.texto}</Alert>}

      <Card className={cardClass}>
        <Card.Header className={headerClass}>1. Administración de jornadas</Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleCrearJornada}>
            <Row className="g-3 align-items-end">
              <Col md={5}><Form.Label>Período académico *</Form.Label><Form.Control name="periodo" placeholder="Ej: Primavera 2026" required className={controlClass}/></Col>
              <Col md={5}><Form.Label>Fecha de ejecución *</Form.Label><Form.Control type="date" name="fecha" min={fechaLocal()} required className={controlClass}/></Col>
              <Col md={2} className="d-grid"><Button type="submit" variant={botonVariante}>Registrar</Button></Col>
            </Row>
          </Form>
          <h6 className="fw-bold mt-4">Jornadas registradas</h6>
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'} className="align-middle">
            <thead><tr><th>Período</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>{jornadas.map((j) => {
              const estado = obtenerEstadoJornada(j);
              const iniciar = estado === 'programada' && j.fecha === fechaLocal();
              const cerrar = ['activa', 'pendiente_cierre'].includes(estado);
              return <tr key={j.id}><td>{j.periodo}</td><td>{j.fecha}</td>
                <td><Badge bg={colores[estado] || 'secondary'} text={estado === 'pendiente_cierre' ? 'dark' : undefined}>{etiquetasEstadoJornada[estado] || estado}</Badge></td>
                <td>{iniciar && <Button size="sm" variant="outline-success" onClick={() => iniciarJornada(j)}>Iniciar</Button>}
                  {cerrar && <Button size="sm" variant="outline-danger" onClick={() => cerrarJornada(j)}>Cerrar</Button>}
                  {!iniciar && !cerrar && '—'}</td></tr>;
            })}</tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>2. Preinscripciones de jornadas pasadas</Card.Header>
        <Card.Body className="p-4">
          <Alert variant="info">Los equipos no presentados permanecen en el historial.</Alert>
          <Table responsive hover variant={modoOscuro ? 'dark' : 'light'}>
            <thead><tr><th>Equipo</th><th>Jornada</th><th>Estado</th><th>Acción</th></tr></thead>
            <tbody>{pendientesPasados.map((a) => {
              const d = datos.dispositivos.find((x) => x.id === a.dispositivoId);
              const j = datos.jornadas.find((x) => x.id === a.jornadaId);
              return <tr key={a.id}><td>{d ? `${d.marca} ${d.modelo}` : 'Sin dispositivo'}</td>
                <td>{j?.periodo} — {j?.fecha}</td><td><Badge bg="warning" text="dark">Sin recepción</Badge></td>
                <td><Button size="sm" variant="outline-danger" onClick={() => marcarNoPresentado(a)}>No presentado</Button></td></tr>;
            })}
            {!pendientesPasados.length && <tr><td colSpan={4} className="text-center">Sin preinscripciones vencidas.</td></tr>}</tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>3. Administración de personal</Card.Header>
        <Card.Body className="p-4">
          <h6 className="fw-bold">Agregar usuario manualmente</h6>
          <Form onSubmit={handleCrearUsuario} className="mb-4">
            <Row className="g-3 align-items-end">
              <Col md={6}><Form.Label>Nombre completo *</Form.Label><Form.Control name="nombre" maxLength={100} required className={controlClass}/></Col>
              <Col md={4}><Form.Label>Rol *</Form.Label><Form.Select name="rol" required defaultValue="" className={controlClass}>
                <option value="">Seleccione...</option>{rolesPermitidos.map((r) => <option key={r} value={r}>{etiquetasRol[r]}</option>)}
              </Form.Select></Col>
              <Col md={2} className="d-grid"><Button type="submit" variant={botonVariante}>Agregar</Button></Col>
            </Row>
          </Form>
          <h6 className="fw-bold">Importación de personal desde CSV</h6>
          <Form onSubmit={handleCargaMasiva}>
            <Row className="g-3 align-items-end">
              <Col md={10}><Form.Label>Archivo CSV UTF-8 *</Form.Label>
                <Form.Control type="file" name="archivo" accept=".csv,text/csv" required className={controlClass}/>
                <Form.Text>Columnas obligatorias: nombre,rol. Roles permitidos: tecnico, recepcionista, superusuario. Para Excel, exporta a CSV UTF-8.</Form.Text>
              </Col>
              <Col md={2} className="d-grid"><Button type="submit" variant={botonVariante}>Importar</Button></Col>
            </Row>
          </Form>
          <h6 className="fw-bold mt-4">Personal registrado ({datos.usuarios.length})</h6>
          <Table responsive hover size="sm" variant={modoOscuro ? 'dark' : 'light'}>
            <thead><tr><th>Nombre</th><th>Rol</th></tr></thead>
            <tbody>{datos.usuarios.map((u) => <tr key={u.id}><td>{u.nombre}</td><td>{etiquetasRol[u.rol] || u.rol}</td></tr>)}</tbody>
          </Table>
          <Alert variant="secondary" className="mb-0">Los usuarios nuevos pueden aparecer en las listas de asignación del prototipo. El acceso por login continúa siendo simulado y no crea credenciales reales.</Alert>
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>4. Mantenedor de checklists dinámicos</Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleCrearChecklist}>
            <Row className="g-3 align-items-end">
              <Col md={4}><Form.Label>Servicio *</Form.Label><Form.Select name="servicioId" defaultValue="" required className={controlClass}>
                <option value="">Seleccione...</option>{datos.servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </Form.Select></Col>
              <Col md={6}><Form.Label>Nueva tarea *</Form.Label><Form.Control name="descripcion" maxLength={200} required className={controlClass} placeholder="Ej: Verificar temperatura"/></Col>
              <Col md={2} className="d-grid"><Button type="submit" variant={botonVariante}>Agregar ítem</Button></Col>
            </Row>
          </Form>
          <h6 className="fw-bold mt-4">Plantillas registradas</h6>
          {datos.plantillasChecklist.map((p) => {
            const servicio = datos.servicios.find((s) => s.id === p.servicioId);
            return <section key={p.id} className="border rounded-3 p-3 mb-3"><h6>{servicio?.nombre || p.servicioId}</h6>
              <ol className="mb-0">{p.items.map((i) => <li key={i.id}>{i.descripcion}</li>)}</ol></section>;
          })}
        </Card.Body>
      </Card>

      <Card className={cardClass}>
        <Card.Header className={headerClass}>5. Datos iniciales de demostración</Card.Header>
        <Card.Body className="p-4">
          <p className={modoOscuro ? 'text-light' : 'text-muted'}>Elimina únicamente las dos atenciones originales de ejemplo identificadas por el sistema. No elimina los registros nuevos.</p>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <span>Ejemplos detectados: <strong>{ejemplos.length}</strong></span>
            <Button variant="outline-danger" disabled={!ejemplos.length} onClick={limpiarEjemplos}>Eliminar ejemplos originales</Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}
