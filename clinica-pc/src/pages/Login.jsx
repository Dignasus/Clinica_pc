import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ rut: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredenciales(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // OWASP A10: Manejo seguro de condiciones excepcionales
    if (!credenciales.rut || !credenciales.password) {
      setError('Credenciales inválidas. Por favor, intente nuevamente.');
      return;
    }

    console.log('Simulando validación segura en el servidor...');
    
    // Almacenar token simulado para manejo de sesión (OWASP A07)
    sessionStorage.setItem('authToken', 'super-usuario-token-simulado');
    
    // Redirección al panel
    navigate('/panel');
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-header">
          <h2>Clínica del PC</h2>
          <p>Sistema de Gestión Integral</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="rut">Usuario (RUT)</label>
            <input
              type="text"
              id="rut"
              name="rut"
              value={credenciales.rut}
              onChange={handleChange}
              placeholder="Ej: 12.345.678-9"
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credenciales.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          
          <button type="submit" className="btn-primary">Ingresar al Sistema</button>
        </form>
      </div>
    </div>
  );
}