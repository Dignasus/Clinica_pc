// Reglas puras de entrega y custodia. En producción deben aplicarse también en la API.
export const ESTADO_CUSTODIA = 'en_custodia';

export function validarCustodia(custodia) {
  if (!custodia || !String(custodia.ubicacion || '').trim() ||
    !String(custodia.responsableRecepcion || '').trim() ||
    !String(custodia.motivo || '').trim()) {
    return 'Indica ubicación, persona que recibe la custodia y motivo del traslado.';
  }
  if (custodia.confirmacionRecepcion !== true) {
    return 'Debes confirmar que el responsable recibió físicamente el equipo.';
  }
  return '';
}

export function validarRetiro(entrega) {
  if (!entrega || !['propietario', 'tercero'].includes(entrega.tipoReceptor)) {
    return 'Selecciona quién retira el equipo.';
  }
  if (!String(entrega.recibidoPor || '').trim() || !entrega.identidadVerificada) {
    return 'Indica el nombre de quien retira y confirma su identidad.';
  }
  if (!['conforme', 'con_observaciones', 'no_conforme'].includes(entrega.conformidad)) {
    return 'Registra la conformidad del retiro.';
  }
  if (entrega.conformidad !== 'conforme' && !String(entrega.observaciones || '').trim()) {
    return 'Describe las observaciones de una entrega sin conformidad plena.';
  }
  if (entrega.tipoReceptor === 'propietario') {
    if (entrega.pruebaConPropietario !== true) {
      return 'Confirma la prueba conjunta con el propietario.';
    }
  } else {
    if (!String(entrega.relacion || '').trim() ||
      !['telefono', 'whatsapp'].includes(entrega.medioAutorizacion) ||
      entrega.autorizacionConfirmada !== true ||
      entrega.pruebaConPropietario === true) {
      return 'Registra al tercero y la autorización del propietario, sin atribuirle una prueba que no realizó.';
    }
  }
  return '';
}

export function permiteGestionEntrega(datos, usuarioId) {
  const usuario = datos.usuarios.find((u) => u.id === usuarioId);
  const rol = datos.roles.find((r) => r.id === usuario?.rol);
  return Boolean(rol?.permisos?.some((p) => ['tecnico', 'recepcion', 'parametros'].includes(p)));
}
