import { useState } from 'react';
import '../styles/Formularios.css';

export default function InscripcionQR() {
  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    telefono: '',
    correo: '',
    comuna: '',
    sector: '',
    marcaEquipo: '',
    modeloEquipo: '',
    numeroSerie: '',
    diagnosticoPropietario: '',
    servicios: {
      formateo: false,
      mantencionFisica: false,
      mantencionLogica: false
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        servicios: {
          ...prev.servicios,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos a enviar a la base de datos:', formData);
    alert('Preinscripción guardada exitosamente.');
    // Aquí iría la llamada a la API (fetch/axios)
  };

  return (
    <div className="formulario-contenedor">
      <h3 className="titulo-seccion">Formulario de Preinscripción (Vista Cliente)</h3>
      <p className="texto-ayuda">Ingrese sus datos personales y los de su equipo para agilizar la recepción.</p>

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Sección Datos Personales */}
        <fieldset className="seccion-form">
          <legend>Datos Personales</legend>
          
          <div className="campo">
            <label htmlFor="rut">RUT *</label>
            <input type="text" id="rut" name="rut" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="nombre">Nombre *</label>
            <input type="text" id="nombre" name="nombre" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="apellidoPaterno">Apellido Paterno *</label>
            <input type="text" id="apellidoPaterno" name="apellidoPaterno" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="apellidoMaterno">Apellido Materno *</label>
            <input type="text" id="apellidoMaterno" name="apellidoMaterno" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="telefono">Teléfono *</label>
            <input type="tel" id="telefono" name="telefono" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="correo">Correo Electrónico *</label>
            <input type="email" id="correo" name="correo" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="comuna">Comuna *</label>
            <input type="text" id="comuna" name="comuna" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="sector">Sector *</label>
            <input type="text" id="sector" name="sector" required onChange={handleChange} />
          </div>
        </fieldset>

        {/* Sección Datos del Equipo */}
        <fieldset className="seccion-form">
          <legend>Datos del Equipo y Servicio</legend>

          <div className="campo">
            <label htmlFor="marcaEquipo">Marca del Equipo *</label>
            <input type="text" id="marcaEquipo" name="marcaEquipo" required onChange={handleChange} />
          </div>

          <div className="campo">
            <label htmlFor="modeloEquipo">Modelo *</label>
            <input type="text" id="modeloEquipo" name="modeloEquipo" required onChange={handleChange} />
          </div>

          <div className="campo campo-completo">
            <label htmlFor="numeroSerie">Número de Serie (Opcional)</label>
            <input type="text" id="numeroSerie" name="numeroSerie" onChange={handleChange} />
            <small className="nota-aclaratoria">Nota: Si no conoce o no encuentra el número de serie, déjelo en blanco. El técnico lo registrará al recibir el equipo.</small>
          </div>

          <div className="campo campo-completo">
            <label htmlFor="diagnosticoPropietario">¿Qué problema presenta su equipo? *</label>
            <textarea id="diagnosticoPropietario" name="diagnosticoPropietario" rows="3" required onChange={handleChange}></textarea>
          </div>

          <div className="campo campo-completo">
            <span className="label-falso">Servicio Requerido *</span>
            <div className="checkbox-group">
              <label>
                <input type="checkbox" name="formateo" onChange={handleChange} /> Formateo
              </label>
              <label>
                <input type="checkbox" name="mantencionLogica" onChange={handleChange} /> Mantención Lógica
              </label>
              <label>
                <input type="checkbox" name="mantencionFisica" onChange={handleChange} /> Mantención Física
              </label>
            </div>
          </div>
        </fieldset>

        <div className="acciones-form">
          <button type="submit" className="btn-guardar">Registrar Equipo</button>
        </div>
      </form>
    </div>
  );
}