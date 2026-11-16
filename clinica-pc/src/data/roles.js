// Permisos funcionales del prototipo. En producción deben comprobarse también en la API.
export const MODULOS = [
  { id: 'inicio', nombre: 'Ver inicio y estadísticas' },
  { id: 'recepcion', nombre: 'Recepción y asignación de equipos' },
  { id: 'registroPresencial', nombre: 'Registro presencial' },
  { id: 'tecnico', nombre: 'Atención técnica y checklists' },
  { id: 'historial', nombre: 'Consultar historial de dispositivos' },
  { id: 'parametros', nombre: 'Administrar jornadas, usuarios y roles' },
];

export const rolesBase = [
  { id: 'superusuario', nombre: 'Superusuario', permisos: MODULOS.map((m) => m.id), sistema: true },
  { id: 'recepcionista', nombre: 'Recepcionista', permisos: ['inicio', 'recepcion', 'registroPresencial', 'historial'] },
  { id: 'tecnico', nombre: 'Técnico', permisos: ['inicio', 'tecnico', 'historial'] },
];

export function tienePermiso(datos, rolId, permiso) {
  const rol = (datos.roles || []).find((r) => r.id === rolId);
  return Boolean(rol?.permisos?.includes(permiso));
}

export function nombreDeRol(datos, rolId) {
  return (datos.roles || []).find((r) => r.id === rolId)?.nombre || 'Rol no disponible';
}

// Acceder al panel técnico no implica estar disponible para recibir equipos.
// El valor alternativo conserva compatibilidad con usuarios de versiones anteriores.
export function esTecnicoAsignable(datos, usuario) {
  if (!usuario) return false;
  const habilitado = usuario.habilitadoTecnico ?? (usuario.rol === 'tecnico');
  return habilitado && tienePermiso(datos, usuario.rol, 'tecnico');
}

export function personalTecnico(datos) {
  return datos.usuarios.filter((usuario) => esTecnicoAsignable(datos, usuario));
}
