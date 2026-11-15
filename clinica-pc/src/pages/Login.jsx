import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoInacap from '../assets/logo-inacap.png';
import fotoCampus from '../assets/login-campus.jpg';
import './Login.css';
import { useClinica } from '../context/clinicaContextBase.js';

export default function Login() {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
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
      <section className="cpc-login__left" aria-labelledby="cpc-login-title">
        <header className="cpc-login__brand">
          <img src={logoInacap} alt="INACAP" />
          <span className="cpc-login__slogan">APRENDER<br />HACIENDO</span>
        </header>

        <div className="cpc-login__content">
          <div className="cpc-login__heading">
            <span className="cpc-login__accent" aria-hidden="true" />
            <div>
              <h1 id="cpc-login-title">Clínica del PC</h1>
              <p>Sistema de Gestión de Servicios Técnicos</p>
            </div>
          </div>

          <form className="cpc-login__form" onSubmit={handleSubmit}>
            <label htmlFor="cpc-usuario">Usuario</label>
            <input
              id="cpc-usuario" name="usuario" type="text"
              value={credenciales.usuario} onChange={handleChange}
              placeholder="Ingrese su usuario" autoComplete="username" required
            />

            <label htmlFor="cpc-password">Contraseña</label>
            <input
              id="cpc-password" name="password" type="password"
              value={credenciales.password} onChange={handleChange}
              placeholder="Ingrese su contraseña" autoComplete="current-password" required
            />

            {error && <div className="cpc-login__error" role="alert">{error}</div>}

            <button className="cpc-login__submit" type="submit">Iniciar sesión</button>
          </form>
        </div>

        <footer className="cpc-login__footer">Prototipo académico · Acceso de demostración</footer>
      </section>

      <aside className="cpc-login__photo" aria-label="Imagen ilustrativa de un campus educativo">
        <img src={fotoCampus} alt="Estudiantes junto a un edificio académico" />
      </aside>
    </main>
  );
}
