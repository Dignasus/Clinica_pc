
import { useState } from 'react';
import {
  Card, Form, Button, Row, Col, Table, Alert,
} from 'react-bootstrap';

import { useClinica } from '../context/clinicaContextBase.js';

export default function RecepcionEquipos({ modoOscuro }) {
  const { datos, dispatch } = useClinica();

  const [rutBusqueda, setRutBusqueda] = useState('');
  const [atencionSeleccionadaId, setAtencionSeleccionadaId] = useState(null);
  const [tecnicoAsignado, setTecnicoAsignado] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Unir atención, dispositivo, propietario y jornada.
  const equiposPendientes = datos.atenciones
    .filter((atencion) => atencion.estado === 'preinscrito')
    .map((atencion) => {
      const dispositivo = datos.dispositivos.find(
        (item) => item.id === atencion.dispositivoId
      );

      const propietario = datos.propietarios.find(
        (item) => item.id === dispositivo?.propietarioId
      );

      const jornada = datos.jornadas.find(
        (item) => item.id === atencion.jornadaId
      );

      if (!dispositivo || !propietario) return null;

      return {
        id: atencion.id,
        rut: propietario.rut,
        nombre: [
          propietario.nombre,
          propietario.apellidoPaterno,
          propietario.apellidoMaterno,
        ].filter(Boolean).join(' '),
        equipo: `${dispositivo.marca} ${dispositivo.modelo}`,
        falla: atencion.diagnosticoPropietario,
        fecha: atencion.fechaPreinscripcion
          ? new Date(atencion.fechaPreinscripcion).toLocaleString('es-CL')
          : 'Sin fecha',
        jornada: jornada?.periodo ?? 'Sin jornada',
        servicios: atencion.servicioIds
          .map((id) => datos.servicios.find((servicio) => servicio.id === id)?.nombre)
          .filter(Boolean)
          .join(', '),
      };
    })
    .filter(Boolean);

  const normalizarBusqueda = (valor) =>
    valor.toLowerCase().replace(/[.\s-]/g, '');

  const termino = normalizarBusqueda(rutBusqueda);

  const equiposFiltrados = equiposPendientes.filter((equipo) =>
    normalizarBusqueda(equipo.rut).includes(termino) ||
    equipo.nombre.toLowerCase().includes(rutBusqueda.toLowerCase().trim())
  );

  const equipoSeleccionado = equiposPendientes.find(
    (equipo) => equipo.id === atencionSeleccionadaId
  );

  const tecnicos = datos.usuarios.filter(
    (usuario) => usuario.rol === 'tecnico'
  );

  const seleccionarEquipo = (equipo) => {
    setAtencionSeleccionadaId(equipo.id);
    setRutBusqueda(equipo.rut);
    setTecnicoAsignado('');
    setMensaje('');
  };

  const buscarCliente = (e) => {
    e.preventDefault();

    if (equiposFiltrados.length === 1) {
      seleccionarEquipo(equiposFiltrados[0]);
    } else if (equiposFiltrados.length > 1) {
      setAtencionSeleccionadaId(null);
      setMensaje(
        'Se encontraron varios equipos. Selecciona el dispositivo que se está recibiendo.'
      );
    } else {
      setAtencionSeleccionadaId(null);
      setMensaje('No se encontraron preinscripciones con esa búsqueda.');
    }
  };

  const handleAsignar = (e) => {
    e.preventDefault();

    if (!equipoSeleccionado || !tecnicoAsignado) return;

    const tecnicoValido = tecnicos.some(
      (tecnico) => tecnico.id === tecnicoAsignado
    );

    if (!tecnicoValido) {
      setMensaje('Selecciona un técnico válido.');
      return;
    }

    dispatch({
      type: 'ASIGNAR_TECNICO',
      payload: {
        atencionId: equipoSeleccionado.id,
        tecnicoId: tecnicoAsignado,
        fechaRecepcion: new Date().toISOString(),
      },
    });

    setMensaje(
      'Equipo recepcionado y asignado en el prototipo.'
    );

    setAtencionSeleccionadaId(null);
    setTecnicoAsignado('');
    setRutBusqueda('');
  };

  const cardClass = `shadow-sm border-0 mb-4 ${
    modoOscuro ? 'bg-dark text-light' : ''
  }`;

  const headerClass = `fw-bold py-3 ${
    modoOscuro ? 'bg-secondary text-light' : 'bg-white'
  }`;

  const titleColor = modoOscuro ? '#ff6666' : '#cc0000';

  return (
    <>
      <div className="mb-4">
        <h3 style={{ color: titleColor, fontWeight: 'bold' }}>
          Recepción Física de Equipos
        </h3>
        <p className={modoOscuro ? 'text-light' : 'text-muted'}>
          Busque la preinscripción, seleccione el dispositivo y asigne un técnico.
        </p>
      </div>

      {mensaje && (
        <Alert
          variant="info"
          dismissible
          onClose={() => setMensaje('')}
        >
          {mensaje}
        </Alert>
      )}

      <Row className="g-4">
        <Col lg={7}>
          <Card className={cardClass}>
            <Card.Header className={headerClass}>
              1. Buscar Preinscripción
            </Card.Header>

            <Card.Body className="p-4">
              <Form onSubmit={buscarCliente} className="mb-4">
                <Form.Group className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Ingrese RUT o nombre..."
                    value={rutBusqueda}
                    onChange={(e) => {
                      setRutBusqueda(e.target.value);
                      setAtencionSeleccionadaId(null);
                    }}
                    className={modoOscuro ? 'bg-dark text-light' : ''}
                  />

                  <Button
                    variant={modoOscuro ? 'light' : 'danger'}
                    type="submit"
                  >
                    Buscar
                  </Button>
                </Form.Group>
              </Form>

              <h6 className="fw-bold mb-3">
                Equipos pendientes de recepción
              </h6>

              <Table
                responsive
                hover
                variant={modoOscuro ? 'dark' : 'light'}
                className="align-middle"
              >
                <thead>
                  <tr>
                    <th>RUT</th>
                    <th>Propietario</th>
                    <th>Equipo</th>
                    <th>Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {equiposFiltrados.map((equipo) => (
                    <tr key={equipo.id}>
                      <td>{equipo.rut}</td>
                      <td>{equipo.nombre}</td>
                      <td>{equipo.equipo}</td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => seleccionarEquipo(equipo)}
                        >
                          Seleccionar
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {equiposFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        No hay equipos que coincidan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          {equipoSeleccionado ? (
            <Card className={cardClass}>
              <Card.Header className={headerClass}>
                2. Asignación Técnica
              </Card.Header>

              <Card.Body className="p-4">
                <h4 className="text-danger fw-bold">
                  {equipoSeleccionado.nombre}
                </h4>

                <div className="bg-body-tertiary text-body p-3 rounded mb-4">
                  <p><strong>RUT:</strong> {equipoSeleccionado.rut}</p>
                  <p><strong>Equipo:</strong> {equipoSeleccionado.equipo}</p>
                  <p><strong>Falla:</strong> {equipoSeleccionado.falla}</p>
                  <p><strong>Servicios:</strong> {equipoSeleccionado.servicios}</p>
                  <p><strong>Jornada:</strong> {equipoSeleccionado.jornada}</p>
                  <p className="mb-0">
                    <strong>Preinscrito:</strong> {equipoSeleccionado.fecha}
                  </p>
                </div>

                <Form onSubmit={handleAsignar}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">
                      Técnico asignado
                    </Form.Label>

                    <Form.Select
                      required
                      value={tecnicoAsignado}
                      onChange={(e) => setTecnicoAsignado(e.target.value)}
                    >
                      <option value="">Seleccione técnico...</option>
                      {tecnicos.map((tecnico) => (
                        <option key={tecnico.id} value={tecnico.id}>
                          {tecnico.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Alert variant="warning">
                    Confirme que está recibiendo el dispositivo correcto.
                    La inspección física detallada corresponde al técnico.
                  </Alert>

                  <Button
                    type="submit"
                    variant={modoOscuro ? 'light' : 'danger'}
                    size="lg"
                    className="w-100 fw-bold"
                  >
                    Confirmar y Asignar
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card className={cardClass}>
              <Card.Body className="text-center text-muted p-5">
                Seleccione un dispositivo para continuar con la asignación.
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </>
  );
}
