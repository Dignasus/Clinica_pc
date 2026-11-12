import DashboardMetricCard from './DashboardMetricCard.jsx';

export default function OcupacionTaller({ modoOscuro, cantidad }) {
  return <DashboardMetricCard modoOscuro={modoOscuro} titulo="Equipos en taller"
    valor={cantidad} descripcion="Atenciones activas" icono="equipo" tono="rojo" destacado />;
}
