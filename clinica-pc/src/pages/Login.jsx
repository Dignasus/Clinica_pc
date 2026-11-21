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
      <section className="cpc-login__left" aria-labelledby="cpc-login-title">
        <header className="cpc-login__brand">
          <img src={logoInacap} alt="INACAP" />
          <span className="cpc-login__slogan">APRENDER<br />HACIENDO</span>
        </header>

        <div className="cpc-login__content">
          <p className="cpc-login__eyebrow"><span aria-hidden="true" /> ACCESO AL SISTEMA</p>
          <div className="cpc-login__heading">
            <h1 id="cpc-login-title">Clínica del PC<span className="cpc-login__period">.</span></h1>
            <p>Bienvenido a tu espacio de gestión técnica. Ingresa con tu cuenta de personal para continuar.</p>
          </div>

          <form className="cpc-login__form" onSubmit={handleSubmit}>
            <label htmlFor="cpc-usuario">Usuario</label>
            <input
              id="cpc-usuario" name="usuario" type="text"
              value={credenciales.usuario} onChange={handleChange}
              placeholder="Escribe tu usuario" autoComplete="username" required
            />

            <label htmlFor="cpc-password">Contraseña</label>
            <div className="cpc-login__password-field">
              <input
                id="cpc-password" name="password"
                type={mostrarClave ? 'text' : 'password'}
                value={credenciales.password} onChange={handleChange}
                placeholder="Escribe tu contraseña"
                autoComplete="current-password" required
              />
              <button type="button" className="cpc-login__toggle-password"
                onClick={() => setMostrarClave((actual) => !actual)}
                aria-label={mostrarClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={mostrarClave}>
                {mostrarClave ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            {error && <div className="cpc-login__error" role="alert">{error}</div>}

            <button className="cpc-login__submit" type="submit">
              <span>Ingresar a la plataforma</span>
              <span aria-hidden="true">→</span>
            </button>
          </form>

          <div className="cpc-login__public">
            <div>
              <strong>¿Necesitas inscribir tu equipo?</strong>
              <p>No es necesario ingresar como personal.</p>
            </div>
            <a href="/inscripcion">Ir a preinscripción <span aria-hidden="true">↗</span></a>
          </div>
        </div>

        <footer className="cpc-login__footer">
          <span>Prototipo académico · INACAP</span>
          <span>Acceso de demostración</span>
        </footer>
      </section>

      <aside className="cpc-login__showcase" aria-label="Presentación de Clínica del PC">
        <div className="cpc-login__showcase-inner">
          <p className="cpc-login__showcase-tag"><span aria-hidden="true" /> GESTIÓN DE SERVICIO TÉCNICO</p>
          <h2>Cada equipo tiene una historia. <em>Nosotros la acompañamos.</em></h2>
          <p className="cpc-login__showcase-description">
            Un flujo claro para coordinar el ingreso, la revisión y la entrega de cada computador.
          </p>

          <div className="cpc-login__tech-art" aria-hidden="true">
            <div className="cpc-login__art-glow" />
            <svg viewBox="0 0 440 260" fill="none" role="presentation">
              <rect x="82" y="21" width="276" height="192" rx="16" fill="#1D2B40" stroke="#536782" strokeWidth="2" />
              <rect x="99" y="38" width="242" height="154" rx="8" fill="#0E1828" stroke="#34435A" />
              <rect x="117" y="57" width="74" height="8" rx="4" fill="#354861" />
              <rect x="117" y="74" width="129" height="5" rx="2.5" fill="#25354A" />
              <rect x="117" y="98" width="206" height="73" rx="9" fill="#1A283A" stroke="#3C5069" />
              <circle cx="151" cy="133" r="18" fill="#3F1E2C" stroke="#F45B70" strokeWidth="2" />
              <path d="m142 133 6 6 12-13" stroke="#FF8D9D" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="185" y="119" width="111" height="7" rx="3.5" fill="#B4C2D3" />
              <rect x="185" y="135" width="86" height="6" rx="3" fill="#506480" />
              <rect x="185" y="150" width="104" height="5" rx="2.5" fill="#344A66" />
              <path d="M59 220h322l24 17c4 3 2 8-4 8H39c-6 0-8-5-4-8l24-17Z" fill="#405470" stroke="#7185A0" strokeWidth="2" />
              <rect x="183" y="226" width="74" height="7" rx="3.5" fill="#273A52" />
              <circle cx="356" cy="52" r="7" fill="#F45B70" />
              <path d="M356 59v22h27" stroke="#F45B70" strokeWidth="2" strokeDasharray="4 5" />
              <circle cx="383" cy="81" r="4" fill="#F45B70" />
              <circle cx="79" cy="174" r="6" fill="#8FA5C2" />
              <path d="M79 168v-32H53" stroke="#8FA5C2" strokeWidth="2" strokeDasharray="4 5" />
              <circle cx="53" cy="136" r="4" fill="#8FA5C2" />
            </svg>
          </div>

          <div className="cpc-login__workflow">
            <p>FLUJO DE UNA ATENCIÓN</p>
            <ol>
              <li><span>01</span><strong>Ingreso</strong></li>
              <li><span>02</span><strong>Diagnóstico</strong></li>
              <li><span>03</span><strong>Servicio</strong></li>
              <li><span>04</span><strong>Entrega</strong></li>
            </ol>
          </div>
          <p className="cpc-login__showcase-footer">Clínica del PC · Gestión de atenciones</p>
        </div>
      </aside>
    </main>
  );
}
