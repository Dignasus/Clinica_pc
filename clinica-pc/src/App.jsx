
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import PanelSuperusuario from './pages/PanelSuperusuario';
import InscripcionQR from './components/InscripcionQR';

// Protección básica de rutas del prototipo
function RutaProtegida({ children }) {
  const autenticado = sessionStorage.getItem('authToken');

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Portal público para propietarios que escanean el QR
function InscripcionPublica() {
  return (
    <div data-bs-theme="light" className="min-vh-100 bg-light">
      <main className="container py-4 py-md-5" style={{ maxWidth: '960px' }}>
        <header className="text-center mb-4">
          <h1 className="fw-bold text-danger">Clínica del PC</h1>
          <p className="text-muted mb-0">
            Servicio de atención y mantenimiento de equipos computacionales.
          </p>
        </header>

        <InscripcionQR modoOscuro={false} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Acceso interno del personal */}
        <Route path="/" element={<Login />} />

        {/* Inscripción pública sin inicio de sesión */}
        <Route path="/inscripcion" element={<InscripcionPublica />} />

        {/* Panel interno protegido */}
        <Route
          path="/panel"
          element={
            <RutaProtegida>
              <PanelSuperusuario />
            </RutaProtegida>
          }
        />

        {/* Rutas desconocidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
