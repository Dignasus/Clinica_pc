import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import PanelSuperusuario from './pages/PanelSuperusuario';
import InscripcionQR from './components/InscripcionQR';

// Protección básica de rutas del prototipo.
function RutaProtegida({ children }) {
  const autenticado = sessionStorage.getItem('authToken');

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Portal público: InscripcionQR incorpora su título y selector de tema.
function InscripcionPublica() {
  return (
    <div className="min-vh-100">
      <main className="mx-auto w-100 px-2 px-sm-3 py-2 py-md-4" style={{ maxWidth: '960px' }}>
        <InscripcionQR />
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
