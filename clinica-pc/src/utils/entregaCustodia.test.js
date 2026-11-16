import test from 'node:test';
import assert from 'node:assert/strict';
import { validarCustodia, validarRetiro, permiteGestionEntrega } from './entregaCustodia.js';
import { estadoTicket, puedeCerrarTicket, programarEncuesta } from './seguimiento.js';

const custodia = {
  ubicacion: 'Sala de profesores, piso 2',
  responsableRecepcion: 'Docente de turno',
  motivo: 'Retiro posterior al cierre',
  confirmacionRecepcion: true,
};
const baseRetiro = {
  tipoReceptor: 'propietario', recibidoPor: 'Persona ficticia',
  identidadVerificada: true, conformidad: 'conforme',
  pruebaConPropietario: true,
};

test('custodia exige confirmar recepción física y ubicación', () => {
  assert.equal(validarCustodia(custodia), '');
  assert.notEqual(validarCustodia({ ...custodia, confirmacionRecepcion: false }), '');
  assert.notEqual(validarCustodia({ ...custodia, ubicacion: '' }), '');
});

test('custodia deja el ticket pendiente de retiro, sin encuesta ni cierre', () => {
  const a = { estado: 'en_custodia', custodia };
  assert.equal(estadoTicket(a), 'pendiente_retiro');
  assert.equal(puedeCerrarTicket(a), false);
  assert.equal(a.seguimiento, undefined);
});

test('entrega al propietario requiere prueba conjunta e identidad comprobada', () => {
  assert.equal(validarRetiro(baseRetiro), '');
  assert.notEqual(validarRetiro({ ...baseRetiro, identidadVerificada: false }), '');
  assert.notEqual(validarRetiro({ ...baseRetiro, pruebaConPropietario: false }), '');
});

test('tercero no puede retirar sin autorización confirmada al propietario', () => {
  const tercero = {
    ...baseRetiro, tipoReceptor: 'tercero', pruebaConPropietario: false,
    recibidoPor: 'Tercero ficticio', relacion: 'Compañero',
    medioAutorizacion: 'telefono', autorizacionConfirmada: true,
  };
  assert.equal(validarRetiro(tercero), '');
  assert.notEqual(validarRetiro({ ...tercero, autorizacionConfirmada: false }), '');
  assert.notEqual(validarRetiro({ ...tercero, medioAutorizacion: '' }), '');
  assert.notEqual(validarRetiro({ ...tercero, pruebaConPropietario: true }), '');
});

test('solo personal con permisos operativos puede registrar custodias y retiros', () => {
  const d = {
    usuarios: [{ id: 't', rol: 'tecnico' }, { id: 'c', rol: 'cliente' }],
    roles: [
      { id: 'tecnico', permisos: ['tecnico'] },
      { id: 'cliente', permisos: ['historial'] },
    ],
  };
  assert.equal(permiteGestionEntrega(d, 't'), true);
  assert.equal(permiteGestionEntrega(d, 'c'), false);
});

test('el seguimiento se programa desde el retiro real, no desde la fecha de custodia', () => {
  const fechaRetiro = '2026-11-17T19:30:00.000Z';
  const encuesta = programarEncuesta(fechaRetiro, 'token-test');
  assert.equal(encuesta.programadaPara, '2026-11-20T19:30:00.000Z');
});
