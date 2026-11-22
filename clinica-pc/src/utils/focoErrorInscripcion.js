// Indica qué control debe recibir el foco cuando falla la preinscripción QR.
// Solo identifica campos: la validación permanece en validacionEntradas.js.
const OBLIGATORIOS = [
  'nombre', 'apellidoPaterno', 'apellidoMaterno', 'telefono',
  'correo', 'sector', 'marcaEquipo', 'modeloEquipo',
  'diagnosticoPropietario',
];

const REGLAS = [
  ['correo electrónico', 'correo'],
  ['apellido paterno', 'apellidoPaterno'],
  ['apellido materno', 'apellidoMaterno'],
  ['nombre', 'nombre'],
  ['teléfono', 'telefono'],
  ['rut', 'rut'],
  ['región', 'region'],
  ['comuna', 'comuna'],
  ['sector o barrio', 'sector'],
  ['marca del equipo', 'marcaEquipo'],
  ['modelo del equipo', 'modeloEquipo'],
  ['número de serie', 'numeroSerie'],
  ['descripción del problema', 'diagnosticoPropietario'],
  ['servicio', 'formateo'],
  ['términos y condiciones', 'aceptaTerminos'],
  ['jornada', 'jornadaId'],
];

export function campoParaErrorInscripcion(mensaje, datos = {}) {
  const texto = String(mensaje ?? '').toLocaleLowerCase('es-CL');
  if (!texto) return null;

  if (texto.startsWith('completa los campos obligatorios')) {
    return OBLIGATORIOS.find(campo => !String(datos[campo] ?? '').trim()) ?? null;
  }

  // Para un dispositivo duplicado, llevar al número de serie del equipo.
  if (texto.startsWith('este dispositivo ya tiene una inscripción')) return 'numeroSerie';

  for (const [fragmento, campo] of REGLAS) {
    if (texto.includes(fragmento)) return campo;
  }

  return null; // Error general: enfocaremos el aviso superior.
}
