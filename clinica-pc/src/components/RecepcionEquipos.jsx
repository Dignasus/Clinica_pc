import { useState } from 'react';
import '../styles/Formularios.css';

export default function RecepcionEquipos() {
  const [rutBusqueda, setRutBusqueda] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);

  // Simulación de consulta a la base de datos
  const buscarCliente = (e) => {
    e.preventDefault();
    
    if (rutBusqueda === '12345678-9') {
      setClienteEncontrado({
        nombre: 'Camila Rojas',
        telefono: '+56 9 1234 5678',
        equipo: {
          marca: 'Lenovo',
          modelo: 'IdeaPad 5',
          problema: 'El equipo se apaga de forma repentina después de unos minutos de uso.',
          servicios: ['Formateo', 'Mantención Física']
        }
      });
    } else {
      alert('Cliente no encontrado. Para la prueba, intente con el RUT: 12345678-9');
      setClienteEncontrado(null);
    }
  };

  const handleAsignar = (e) => {
    e.preventDefault();
    alert('Equipo recepcionado y asignado correctamente al técnico.');
    setClienteEncontrado(null);
    setRutBusqueda('');
  };

  return (
    <div className="formulario-contenedor">
      <h3 className="titulo-seccion">Recepción de Equipos en Mesón</h3>
      <p className="texto-ayuda">Busque al propietario por su RUT para confirmar la llegada del equipo y asignar un técnico.</p>

      {/* Formulario de Búsqueda */}
      <form onSubmit={buscarCliente} className="seccion-form">
        <div className="campo campo-completo">
          <label htmlFor="rutBusqueda">Buscar por RUT del Propietario</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              id="rutBusqueda" 
              value={rutBusqueda}
              onChange={(e) => setRutBusqueda(e.target.value)}
              placeholder="Ej: 12345678-9" 
              required 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-guardar" style={{ backgroundColor: '#333333' }}>Buscar</button>
          </div>
        </div>
      </form>

      {/* Tarjeta de Resultados y Asignación */}
      {clienteEncontrado && (
        <div className="seccion-form" style={{ marginTop: '20px' }}>
          <div className="campo campo-completo">
            <h4 style={{ color: '#cc0000', marginBottom: '15px' }}>Propietario: {clienteEncontrado.nombre}</h4>
            
            <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px', border: '1px solid #e0e0e0', marginBottom: '20px' }}>
              <p style={{ marginBottom: '8px' }}><strong>Teléfono de Contacto:</strong> {clienteEncontrado.telefono}</p>
              <p style={{ marginBottom: '8px' }}><strong>Equipo Registrado:</strong> {clienteEncontrado.equipo.marca} {clienteEncontrado.equipo.modelo}</p>
              <p style={{ marginBottom: '8px' }}><strong>Problema Reportado (Preinscripción):</strong> {clienteEncontrado.equipo.problema}</p>
              <p><strong>Servicios Solicitados:</strong> {clienteEncontrado.equipo.servicios.join(', ')}</p>
            </div>
          </div>

          <form onSubmit={handleAsignar} className="campo campo-completo">
            <label htmlFor="tecnico">Asignar a Técnico o Dupla de Trabajo</label>
            <select 
              id="tecnico" 
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #cccccc', width: '100%', marginBottom: '15px' }}
            >
              <option value="">Seleccione un técnico disponible...</option>
              <option value="matias">Matías Carrasco</option>
              <option value="cristian">Cristian</option>
              <option value="dupla1">Dupla: Matías y Cristian</option>
            </select>
            
            <div className="acciones-form">
              <button type="submit" className="btn-guardar">Confirmar Recepción</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}