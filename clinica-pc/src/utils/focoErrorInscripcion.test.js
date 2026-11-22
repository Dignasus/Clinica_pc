import test from 'node:test';
import assert from 'node:assert/strict';
import { campoParaErrorInscripcion } from './focoErrorInscripcion.js';

test('el error del correo lleva al campo correo', () => {
  assert.equal(
    campoParaErrorInscripcion('Correo electrónico inválido. Usa un formato como ejemplo@correo.cl.'),
    'correo',
  );
});

test('prioriza el primer campo obligatorio vacío', () => {
  assert.equal(
    campoParaErrorInscripcion('Completa los campos obligatorios con información válida; no uses solo espacios.', {
      nombre: 'Sofía', apellidoPaterno: 'Demo', apellidoMaterno: 'Prueba',
      telefono: '912345678', correo: 'sofia@example.com',
      sector: '', marcaEquipo: 'Acer', modeloEquipo: 'Aspire',
      diagnosticoPropietario: 'No enciende',
    }),
    'sector',
  );
});

test('identifica RUT, servicio, consentimiento y campos de dispositivo', () => {
  assert.equal(campoParaErrorInscripcion('El RUT ingresado no es válido.'), 'rut');
  assert.equal(campoParaErrorInscripcion('Selecciona al menos un servicio.'), 'formateo');
  assert.equal(campoParaErrorInscripcion('Debes aceptar los términos y condiciones.'), 'aceptaTerminos');
  assert.equal(campoParaErrorInscripcion('Modelo del equipo supera el límite.'), 'modeloEquipo');
  assert.equal(campoParaErrorInscripcion('Este dispositivo ya tiene una inscripción para la jornada seleccionada.'), 'numeroSerie');
});

test('errores no relacionados se comunican mediante aviso general', () => {
  assert.equal(campoParaErrorInscripcion(''), null);
  assert.equal(campoParaErrorInscripcion('No se pudo procesar la solicitud.'), null);
});
