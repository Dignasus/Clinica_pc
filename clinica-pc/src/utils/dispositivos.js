
export function normalizarRutIdentidad(rut) {
  return String(rut ?? '').replace(/[.\s-]/g, '').toUpperCase();
}

export function normalizarSerie(serie) {
  return String(serie ?? '')
    .normalize('NFKC')
    .trim()
    .replace(/[\s-]/g, '')
    .toUpperCase();
}

const seriesInvalidas = new Set([
  'SN', 'NA', 'SINSERIE', 'NOAPLICA',
  'DESCONOCIDO', 'NODISPONIBLE', '0000', '0',
]);

export function buscarDispositivoPrevio(dispositivos, propietarioId, equipo) {
  const serie = normalizarSerie(equipo?.numeroSerie);
  if (!serie || seriesInvalidas.has(serie) || !propietarioId) return null;

  return dispositivos.find((dispositivo) => {
    if (dispositivo.propietarioId !== propietarioId) return false;
    if (normalizarSerie(dispositivo.numeroSerie) !== serie) return false;

    const marcaAnterior = String(dispositivo.marca ?? '').trim().toLowerCase();
    const marcaNueva = String(equipo.marca ?? '').trim().toLowerCase();

    return !marcaAnterior || !marcaNueva || marcaAnterior === marcaNueva;
  }) ?? null;
}

export function obtenerVisitasDispositivo(atenciones, dispositivoId) {
  return atenciones.filter((a) => a.dispositivoId === dispositivoId);
}
