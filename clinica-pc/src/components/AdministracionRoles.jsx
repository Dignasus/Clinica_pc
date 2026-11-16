import { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { useClinica } from '../context/clinicaContextBase.js';
import { MODULOS, tienePermiso } from '../data/roles.js';

// Configuración ilustrativa para la versión académica. Autorización real requiere API.
export default function AdministracionRoles() {
  const { datos, dispatch } = useClinica();
  const [seleccionado, setSeleccionado] = useState('');
  const [nombre, setNombre] = useState('');
  const [permisos, setPermisos] = useState([]);
  const [mensaje, setMensaje] = useState('');

  const cambiarSeleccion = (id) => {
    const rol = datos.roles.find((r) => r.id === id);
    setSeleccionado(rol?.id || '');
    setNombre(rol?.nombre || '');
    setPermisos([...(rol?.permisos || [])]);
    setMensaje('');
  };

  const guardar = (e) => {
    e.preventDefault();
    const etiqueta = nombre.trim();
    if (!etiqueta || !permisos.length) return setMensaje('Asigna nombre y al menos un permiso.');
    if (datos.roles.some((r) => r.id !== seleccionado &&
      r.nombre.toLowerCase() === etiqueta.toLowerCase())) {
      return setMensaje('Ya existe un rol con ese nombre.');
    }
    const actual = datos.roles.find((r) => r.id === seleccionado);
    if (actual?.sistema && !permisos.includes('parametros')) {
      return setMensaje('El superusuario debe conservar la administración.');
    }
    dispatch({
      type: actual ? 'ACTUALIZAR_ROL' : 'CREAR_ROL',
      payload: { id: actual?.id || `ROL-${crypto.randomUUID()}`, nombre: etiqueta, permisos },
    });
    cambiarSeleccion('');
    setMensaje(actual ? 'Rol actualizado.' : 'Rol creado.');
  };

  const alternar = (id) => setPermisos((actual) => actual.includes(id)
    ? actual.filter((p) => p !== id) : [...actual, id]);

  const asignar = (usuario, rolId) => {
    const ultimo = usuario.rol === 'superusuario' &&
      datos.usuarios.filter((u) => u.rol === 'superusuario').length === 1;
    if (ultimo && rolId !== 'superusuario') {
      return setMensaje('No puedes cambiar el rol del último superusuario.');
    }
    dispatch({ type: 'ASIGNAR_ROL_USUARIO', payload: { usuarioId: usuario.id, rolId } });
    setMensaje('Rol asignado.');
  };

  const configurarTecnico = (usuario, habilitado) => {
    if (habilitado && !tienePermiso(datos, usuario.rol, 'tecnico')) {
      setMensaje('El usuario necesita acceso al módulo técnico para recibir asignaciones.');
      return;
    }
    dispatch({ type: 'CONFIGURAR_TECNICO_ASIGNABLE', payload: {
      usuarioId: usuario.id, habilitado,
    } });
    setMensaje(habilitado
      ? 'Usuario habilitado para recibir equipos.'
      : 'Usuario retirado de nuevas asignaciones técnicas.');
  };

  return (
    <Card className="mp-section">
      <Card.Header className="mp-section-header">
        <span className="mp-step">03B</span>
        <div>
          <h2>Administración de roles y permisos</h2>
          <p>Configura el acceso a los módulos y asigna responsabilidades al personal.</p>
        </div>
      </Card.Header>
      <Card.Body className="mp-section-body">
        {mensaje && <Alert variant="info" role="status">{mensaje}</Alert>}
        <Form onSubmit={guardar}>
          <Row className="g-3">
            <Col md={5}>
              <Form.Label htmlFor="rol-seleccionar">Rol existente</Form.Label>
              <Form.Select id="rol-seleccionar" value={seleccionado}
                onChange={(e) => cambiarSeleccion(e.target.value)}>
                <option value="">Crear nuevo rol</option>
                {datos.roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Form.Select>
            </Col>
            <Col md={7}>
              <Form.Label htmlFor="rol-nombre">Nombre del rol *</Form.Label>
              <Form.Control id="rol-nombre" required maxLength={80} value={nombre}
                placeholder="Ej.: Coordinador de jornada"
                onChange={(e) => setNombre(e.target.value)} />
            </Col>
            <Col xs={12}>
              <p className="fw-semibold mb-2">Permisos</p>
              <div className="d-flex flex-wrap gap-3">
                {MODULOS.map((m) => (
                  <Form.Check type="checkbox" key={m.id} id={`perm-${m.id}`}
                    label={m.nombre} checked={permisos.includes(m.id)}
                    disabled={seleccionado === 'superusuario' && m.id === 'parametros'}
                    onChange={() => alternar(m.id)} />
                ))}
              </div>
            </Col>
            <Col xs={12}>
              <Button variant="danger" type="submit">
                {seleccionado ? 'Actualizar rol' : 'Crear rol'}
              </Button>
            </Col>
          </Row>
        </Form>
        <div className="mp-subheading mt-4">
          <div><h3>Asignación de roles</h3><p>Los cambios se reflejan en el menú del usuario.</p></div>
        </div>
        <Table responsive className="mp-table">
          <thead><tr><th>Integrante</th><th>Usuario de acceso</th><th>Rol</th><th>Recibe equipos</th></tr></thead>
          <tbody>
            {datos.usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td><code>{u.usuario || u.id}</code></td>
                <td>
                  <Form.Select size="sm" aria-label={`Rol de ${u.nombre}`}
                    value={u.rol} onChange={(e) => asignar(u, e.target.value)}>
                    {datos.roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  </Form.Select>
                </td>
                <td>
                  <Form.Check type="checkbox" id={`asignable-${u.id}`}
                    label="Habilitado" aria-label={`Permitir asignaciones técnicas a ${u.nombre}`}
                    checked={u.habilitadoTecnico ?? (u.rol === 'tecnico')}
                    disabled={!tienePermiso(datos, u.rol, 'tecnico')}
                    onChange={(e) => configurarTecnico(u, e.target.checked)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Alert variant="secondary" className="mt-3 mb-0">
          Acceder al panel técnico no habilita automáticamente para recibir equipos.
          Activa "Recibe equipos" solamente para personas que ejercerán funciones técnicas.
          Estos cambios se guardan localmente; la autenticación y autorización reales requieren backend.
        </Alert>
      </Card.Body>
    </Card>
  );
}
