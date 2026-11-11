
export function normalizarRut(valor) {
  const limpio = String(valor ?? '')
    .replace(/[.\s-]/g, '')
    .toUpperCase();

  if (!/^\d{1,8}[\dK]$/.test(limpio)) {
    return null;
  }

  return `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

export function validarRut(valor) {
  const rut = normalizarRut(valor);

  if (!rut) return false;

  const [cuerpo, digito] = rut.split('-');

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resultado = 11 - (suma % 11);

  const digitoEsperado =
    resultado === 11 ? '0' :
    resultado === 10 ? 'K' :
    String(resultado);

  return digito === digitoEsperado;
}
