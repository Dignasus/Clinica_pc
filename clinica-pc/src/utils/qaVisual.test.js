import test from 'node:test';
import assert from 'node:assert/strict';
import { datosIniciales } from '../data/datosIniciales.js';
import { agregarEscenariosQaVisual, reiniciarEscenariosQaVisual, hayEscenariosQaVisual, QA_VISUAL_PERIODO } from './qaVisual.js';

test('semillas QA agregan dos atenciones ficticias sin alterar las existentes', () => {
  const datos = structuredClone(datosIniciales);
  datos.atenciones.push({ id: 'AT-PREVIA', estado: 'entregado', dispositivoId: 'D-PREVIA' });
  const salida = agregarEscenariosQaVisual(datos);
  assert.equal(datos.atenciones.length, 1, 'No muta el estado anterior');
  assert.equal(salida.atenciones.length, 3);
  assert.equal(salida.atenciones[0].id, 'AT-PREVIA');
  assert.equal(salida.atenciones.filter((a) => a.id.startsWith('QA-VISUAL-')).length, 2);
  assert.ok(salida.jornadas.some((j) => j.periodo === QA_VISUAL_PERIODO));
  const directo = salida.atenciones.find((a) => a.id === 'QA-VISUAL-AT-DIRECTO');
  const guardado = salida.atenciones.find((a) => a.id === 'QA-VISUAL-AT-CUSTODIA');
  assert.equal(directo.estado, 'contactado');
  assert.equal(guardado.estado, 'en_custodia');
  assert.equal(directo.entrega, undefined);
  assert.equal(guardado.seguimiento, undefined);
  assert.equal(guardado.custodia.ubicacion, 'Sala de profesores, piso 2');
});

test('carga repetida evita duplicar los expedientes ficticios', () => {
  const a = agregarEscenariosQaVisual(structuredClone(datosIniciales));
  const b = agregarEscenariosQaVisual(a);
  assert.equal(b.atenciones.length, a.atenciones.length);
  assert.equal(b, a);
  assert.equal(hayEscenariosQaVisual(b), true);
});

test('reiniciar casos QA conserva los registros ajenos a las pruebas', () => {
  const datos = structuredClone(datosIniciales);
  datos.propietarios.push({ id: 'P-PREVIO' });
  datos.dispositivos.push({ id: 'D-PREVIO', propietarioId: 'P-PREVIO' });
  datos.atenciones.push({ id: 'A-PREVIO', dispositivoId: 'D-PREVIO', estado: 'entregado' });
  const cargados = agregarEscenariosQaVisual(datos);
  const modificados = {
    ...cargados,
    atenciones: cargados.atenciones.map((a) =>
      a.id === 'QA-VISUAL-AT-DIRECTO' ? { ...a, estado: 'entregado' } : a),
  };
  const reiniciados = reiniciarEscenariosQaVisual(modificados);
  assert.equal(reiniciados.atenciones.length, 3);
  assert.equal(reiniciados.atenciones.find((a) => a.id === 'A-PREVIO').estado, 'entregado');
  assert.ok(reiniciados.propietarios.find((p) => p.id === 'P-PREVIO'));
  assert.ok(reiniciados.dispositivos.find((d) => d.id === 'D-PREVIO'));
  assert.equal(reiniciados.atenciones.find((a) => a.id === 'QA-VISUAL-AT-DIRECTO').estado, 'contactado');
});
