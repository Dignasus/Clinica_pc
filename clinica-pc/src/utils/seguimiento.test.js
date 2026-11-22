import test from 'node:test';
import assert from 'node:assert/strict';
import { programarEncuesta, puedeCerrarTicket, estadoTicket, HORAS_HASTA_ENCUESTA } from './seguimiento.js';

test('programa seguimiento para una fecha posterior a la entrega', () => {
  const entrega = '2026-11-15T12:00:00.000Z';
  const s = programarEncuesta(entrega, 'token-demo');
  assert.equal(s.estado, 'pendiente_envio');
  assert.equal(s.token, 'token-demo');
  assert.equal(new Date(s.programadaPara).getTime() - new Date(entrega).getTime(),
    HORAS_HASTA_ENCUESTA * 60 * 60 * 1000);
});

test('un equipo entregado mantiene el ticket abierto mientras no responde', () => {
  const a = { estado: 'entregado', seguimiento: { estado: 'pendiente_envio' } };
  assert.equal(estadoTicket(a), 'pendiente_envio');
  assert.equal(puedeCerrarTicket(a), false);
});

test('no puede cerrarse el ticket si el cliente reporta una falla sin resolver', () => {
  const a = { estado: 'entregado', seguimiento: { respuesta: { funcionamiento: 'mal' } } };
  assert.equal(estadoTicket(a), 'incidencia');
  assert.equal(puedeCerrarTicket(a), false);
  a.seguimiento.resolucion = { observaciones: 'Revisión posterior realizada' };
  assert.equal(estadoTicket(a), 'pendiente_cierre');
  assert.equal(puedeCerrarTicket(a), true);
});

test('una respuesta satisfactoria permite revisión y cierre, pero no lo cierra sola', () => {
  const a = { estado: 'entregado', seguimiento: { respuesta: { funcionamiento: 'bien' } } };
  assert.equal(estadoTicket(a), 'pendiente_cierre');
  assert.equal(puedeCerrarTicket(a), true);
  a.cierreTicket = { fecha: '2026-11-20T00:00:00.000Z' };
  assert.equal(estadoTicket(a), 'cerrado');
  assert.equal(puedeCerrarTicket(a), false);
});

test('una atención en taller no puede cerrarse por la vía de la encuesta', () => {
  const a = { estado: 'en_proceso', seguimiento: { respuesta: { funcionamiento: 'bien' } } };
  assert.equal(estadoTicket(a), 'en_atencion');
  assert.equal(puedeCerrarTicket(a), false);
});
