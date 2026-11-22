import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoInacap from '../assets/logo-inacap.png';
import './Login.css';
import { useClinica } from '../context/clinicaContextBase.js';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const navigate = useNavigate();
  const { datos } = useClinica();

  const handleChange = ({ target: { name, value } }) => {
    setCredenciales((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const usuarioIngresado = credenciales.usuario.toLowerCase().trim();
    if (!usuarioIngresado || !credenciales.password) {
      setError('Por favor, complete ambos campos.');
      return;
    }

    // La cuenta pública no requiere una sesión de personal.
    if (usuarioIngresado === 'cliente' && credenciales.password === '123') {
      navigate('/inscripcion', { replace: true });
      return;
    }

    // Solo simulación académica: NO usar contraseñas compartidas en producción.
    const perfil = datos.usuarios.find((u) =>
      u.usuario?.toLowerCase() === usuarioIngresado);
    if (!perfil || credenciales.password !== '123' ||
      !(datos.roles || []).some((r) => r.id === perfil.rol && r.permisos?.length)) {
      setError('Credenciales inválidas. Revise su usuario y contraseña.');
      return;
    }

    sessionStorage.setItem('authToken', 'sesion-activa');
    sessionStorage.setItem('userId', perfil.id);
    sessionStorage.setItem('userRol', perfil.rol);
    sessionStorage.setItem('userNombre', perfil.nombre);
    navigate('/panel', { replace: true });
  };

  return (
    <main className="cpc-login">
      <div className="cpc-login__hero-brand">
        <img src={logoInacap} alt="INACAP" />
        <span>APRENDER<br />HACIENDO</span>
      </div>
      <section className="cpc-login__glass" aria-labelledby="cpc-login-title">
        <header className="cpc-login__brand">
          <img src={logoInacap} alt="INACAP" />
          <span className="cpc-login__slogan">APRENDER<br />HACIENDO</span>
        </header>

        <div className="cpc-login__heading">
          <h1 id="cpc-login-title">Clínica del PC<span className="cpc-login__period">.</span></h1>
          <p>Sistema de gestión de servicios técnicos</p>
        </div>

        <form className="cpc-login__form" onSubmit={handleSubmit}>
          <label htmlFor="cpc-usuario">Usuario</label>
          <input
            id="cpc-usuario"
            name="usuario"
            type="text"
            value={credenciales.usuario}
            onChange={handleChange}
            placeholder="ejemplo@inacapmail.cl"
            autoComplete="username"
            required
          />

          <label htmlFor="cpc-password">Contraseña</label>
          <div className="cpc-login__password-field">
            <input
              id="cpc-password"
              name="password"
              type={mostrarClave ? 'text' : 'password'}
              value={credenciales.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="cpc-login__toggle-password"
              onClick={() => setMostrarClave((actual) => !actual)}
              aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarClave}
            >
              {mostrarClave ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          {error && <div className="cpc-login__error" role="alert">{error}</div>}

          <button className="cpc-login__submit" type="submit">
            <span>Iniciar sesión</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>

        <footer className="cpc-login__footer">
          <span>Prototipo académico · INACAP</span>
          <span>Acceso de demostración</span>
        </footer>
      </section>
    </main>
  );
}
