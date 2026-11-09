import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PanelSuperusuario from './pages/PanelSuperusuario';

// Componente simple para proteger rutas (OWASP A01: Control de Acceso)
const RutaProtegida = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('authToken');
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/panel" 
          element={
            <RutaProtegida>
              <PanelSuperusuario />
            </RutaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}