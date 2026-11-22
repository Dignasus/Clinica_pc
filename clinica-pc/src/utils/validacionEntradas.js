// Controles de entrada del prototipo académico Clínica del PC.
// Validación (formato/longitud) y normalización NO equivalen a autorización o a
// saneamiento HTML. React debe mostrar observaciones como TEXTO, nunca como HTML.
export const LIMITES_REGISTRO = Object.freeze({
  rut: 12,
  nombre: 80,
  apellidoPaterno: 80,
  apellidoMaterno: 80,
  telefono: 22,
  correo: 254,
  sector: 120,
  marcaEquipo: 90,
  modeloEquipo: 90,
  numeroSerie: 90,
  diagnosticoPropietario: 1200,
});

const CAMPOS_PROPIETARIO = [
  'nombre', 'apellidoPaterno', 'apellidoMaterno',
  'telefono', 'correo', 'sector',
];
const CAMPOS_EQUIPO = [
  'marcaEquipo', 'modeloEquipo', 'numeroSerie', 'diagnosticoPropietario',
];
const OBLIGATORIOS_EQUIPO = new Set([
  'marcaEquipo', 'modeloEquipo', 'diagnosticoPropietario',
]);
const CAMPOS_NOMBRE = new Set(['nombre', 'apellidoPaterno', 'apellidoMaterno']);
const ETIQUETAS = {
  nombre: 'Nombre',
  apellidoPaterno: 'Apellido paterno',
  apellidoMaterno: 'Apellido materno',
  telefono: 'Teléfono',
  correo: 'Correo electrónico',
  sector: 'Sector o barrio',
  marcaEquipo: 'Marca del equipo',
  modeloEquipo: 'Modelo del equipo',
  numeroSerie: 'Número de serie',
  diagnosticoPropietario: 'Descripción del problema',
};

// Excluir caracteres de control y controles bidireccionales invisibles.
// Los saltos de línea son válidos únicamente en diagnósticos de texto plano.
// eslint-disable-next-line no-control-regex -- se detectan intencionalmente controles C0/C1.
const CONTROL = /[\u0000-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/u;
// eslint-disable-next-line no-control-regex -- permitir tabulaciones y saltos de línea en notas.
const CONTROL_NOTAS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/u;
const NOMBRE = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const EMAIL = /^[^\s@<>]+@[^\s@<>.]+(?:\.[^\s@<>.]+)+$/u;

export function normalizarCampoRegistro(campo, valor) {
  const texto = String(valor ?? '').normalize('NFC').trim();
  // No modificar el contenido libre del diagnóstico: puede contener signos
  // como < y >, que React muestra escapados de manera segura.
  if (campo === 'diagnosticoPropietario') return texto;
  return texto.replace(/\s+/gu, ' ');
}

export function validarTelefonoChileno(valor) {
  const texto = String(valor ?? '').trim();
  if (!/^\+?[\d\s()-]+$/u.test(texto)) return false;
  const digitos = texto.replace(/\D/gu, '');
  const nacional = digitos.startsWith('56') && digitos.length === 11
    ? digitos.slice(2)
    : digitos;
  // Acepta números nacionales de 9 dígitos, móviles o fijos.
  return /^[2-9]\d{8}$/u.test(nacional);
}

export function validarFormularioRegistro(formulario, etapa = 'completo') {
  if (!formulario || !['completo', 'propietario', 'equipo'].includes(etapa)) {
    return 'No se pudo validar el formulario.';
  }

  const campos = [
    ...(etapa === 'equipo' ? [] : CAMPOS_PROPIETARIO),
    ...(etapa === 'propietario' ? [] : CAMPOS_EQUIPO),
  ];

  for (const campo of campos) {
    const texto = normalizarCampoRegistro(campo, formulario[campo]);
    const esOpcional = campo === 'numeroSerie';
    const etiqueta = ETIQUETAS[campo];
    if (!texto && !esOpcional) return `Completa el campo ${etiqueta}.`;
    if (texto.length > LIMITES_REGISTRO[campo]) {
      return `${etiqueta} supera el límite de ${LIMITES_REGISTRO[campo]} caracteres.`;
    }
    if (!texto) continue;

    const controlInvalido = campo === 'diagnosticoPropietario'
      ? CONTROL_NOTAS.test(texto)
      : CONTROL.test(texto);
    if (controlInvalido) return `${etiqueta} contiene caracteres no permitidos.`;

    if (CAMPOS_NOMBRE.has(campo)) {
      if (texto.length < 2) return `${etiqueta}: ingresa al menos 2 caracteres.`;
      if (!NOMBRE.test(texto)) {
        return `${etiqueta}: usa solo letras, espacios, guiones, apóstrofes o puntos. No ingreses números ni otros símbolos.`;
      }
    }
    if (campo === 'correo' && !EMAIL.test(texto)) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (campo === 'telefono' && !validarTelefonoChileno(texto)) {
      return 'Ingresa un teléfono chileno válido (9 dígitos o +56).';
    }
    // No permitir etiquetas HTML en identificadores estructurados.
    // Para texto libre se conserva el contenido y se renderiza como texto JSX.
    if (['sector', 'marcaEquipo', 'modeloEquipo', 'numeroSerie'].includes(campo)
      && /[<>]/u.test(texto)) {
      return `${etiqueta} contiene caracteres no permitidos.`;
    }
  }

  if (etapa !== 'propietario' && OBLIGATORIOS_EQUIPO.size > 0
    && ![...OBLIGATORIOS_EQUIPO].every(campo =>
      normalizarCampoRegistro(campo, formulario[campo]))) {
    return 'Completa los datos obligatorios del dispositivo.';
  }
  return null;
}
