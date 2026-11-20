import test from 'node:test';
import assert from 'node:assert/strict';
import { datosIniciales } from '../data/datosIniciales.js';
import { obtenerCargaTecnicosPorPeriodo } from './cargaTecnicos.js';

function escenario() {
  const datos = structuredClone(datosIniciales);
  datos.jornadas = [
    { id: 'JOR-OTONO', periodo: 'Otoño 2026', fecha: '2026-05-15', estado: 'finalizada' },
    { id: 'JOR-PRIMAVERA', periodo: 'Primavera 2026', fecha: '2026-11-15', estado: 'finalizada' },
  ];
  datos.atenciones = [
    { id: 'AT-PRE', jornadaId: 'JOR-OTONO', estado: 'preinscrito', tecnicoIds: [] },
    { id: 'AT-TEC', jornadaId: 'JOR-PRIMAVERA', estado: 'en_proceso', tecnicoIds: ['cristian'] },
    { id: 'AT-ENT', jornadaId: 'JOR-PRIMAVERA', estado: 'entregado', tecnicoIds: ['cristian'] },
    { id: 'AT-CUS', jornadaId: 'JOR-PRIMAVERA', estado: 'en_custodia', tecnicoIds: ['cristian'] },
  ];
  return datos;
}

test('Otoño solo con preinscritos muestra cero técnicos con asignaciones', () => {
  const resumen = obtenerCargaTecnicosPorPeriodo(escenario(), 'Otoño 2026');
  assert.equal(resumen.tecnicos.length, 0);
  assert.equal(resumen.preinscripciones, 1);
  assert.equal(resumen.disponibles, 1);
  assert.equal(resumen.periodo, 'Otoño 2026');
});

test('Primavera muestra únicamente técnico con trabajos reales, inclusive los ya entregados', () => {
  const resumen = obtenerCargaTecnicosPorPeriodo(escenario(), 'Primavera 2026');
  assert.equal(resumen.tecnicos.length, 1);
  const tecnico = resumen.tecnicos[0];
  assert.equal(tecnico.nombre, 'Cristian');
  assert.equal(tecnico.total, 3);
  assert.match(tecnico.estado, /En proceso \(1\)/);
  assert.match(tecnico.detalle, /1 en taller/);
  assert.match(tecnico.detalle, /1 en custodia/);
  assert.match(tecnico.detalle, /1 entregados/);
  assert.equal(resumen.preinscripciones, 0);
});

test('Todos los períodos combina las asignaciones sin adjudicar las preinscripciones', () => {
  const resumen = obtenerCargaTecnicosPorPeriodo(escenario(), 'Todos');
  assert.equal(resumen.tecnicos.length, 1);
  assert.equal(resumen.tecnicos[0].total, 3);
  assert.equal(resumen.preinscripciones, 1);
});

test('Un período sin atenciones no muestra la nómina global como actividad', () => {
  const resumen = obtenerCargaTecnicosPorPeriodo(escenario(), 'Invierno 2026');
  assert.deepEqual(resumen.tecnicos, []);
  assert.equal(resumen.preinscripciones, 0);
  assert.equal(resumen.disponibles, 1);
});

test('Conserva actividad histórica de técnicos que ya no están habilitados para asignar', () => {
  const datos = escenario();
  datos.usuarios.push({
    id: 'retirado', nombre: 'Técnico Histórico', rol: 'recepcionista', habilitadoTecnico: false,
  });
  datos.atenciones.push({
    id: 'AT-HIST', jornadaId: 'JOR-OTONO', estado: 'entregado', tecnicoIds: ['retirado'],
  });
  const resumen = obtenerCargaTecnicosPorPeriodo(datos, 'Otoño 2026');
  assert.equal(resumen.tecnicos.length, 1);
  assert.equal(resumen.tecnicos[0].nombre, 'Técnico Histórico');
  assert.match(resumen.tecnicos[0].estado, /Entregados \(1\)/);
  assert.equal(resumen.preinscripciones, 1);
});
