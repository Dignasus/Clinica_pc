import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LIMITES_REGISTRO,
  normalizarCampoRegistro,
  validarTelefonoChileno,
  validarFormularioRegistro,
} from './validacionEntradas.js';

const valido = () => ({
  nombre: 'María José',
  apellidoPaterno: "O'Ryan",
  apellidoMaterno: 'Peña-Gómez',
  telefono: '+56 9 1234 5678',
  correo: 'maria@example.cl',
  sector: 'Villa San Pedro 123',
  marcaEquipo: 'Lenovo',
  modeloEquipo: 'ThinkPad T14',
  numeroSerie: 'ABC-1234',
  diagnosticoPropietario: 'El equipo no enciende; muestra error 0x20.',
});

test('acepta campos válidos, acentos, guiones y apóstrofes', () => {
  assert.equal(validarFormularioRegistro(valido()), null);
});
test('normaliza espacios sin perder acentos', () => {
  assert.equal(normalizarCampoRegistro('nombre', '  María   José  '), 'María José');
});
test('no destruye texto libre ni lo interpreta como HTML', () => {
  const texto = '<img src=x onerror=alert(1)> - error en el equipo';
  assert.equal(normalizarCampoRegistro('diagnosticoPropietario', texto), texto);
  assert.equal(validarFormularioRegistro({ ...valido(), diagnosticoPropietario: texto }), null);
});
test('React escapa contenido libre al renderizarlo como texto', () => {
  const html = renderToStaticMarkup(createElement('p', null, '<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  const img = renderToStaticMarkup(createElement('p', null, '<img src=x onerror=alert(1)>'));
  assert.ok(img.includes('&lt;img'));
  assert.ok(!img.includes('<img'));
});
test('rechaza nombre con etiqueta HTML', () => {
  assert.match(validarFormularioRegistro({ ...valido(), nombre: '<script>' }), /Nombre/);
});
test('rechaza caracteres invisibles de control en textos estructurados', () => {
  assert.match(validarFormularioRegistro({ ...valido(), sector: 'Centro\u202Eoculto' }), /Sector/);
});
test('rechaza email inválido, pero acepta dominio válido', () => {
  assert.match(validarFormularioRegistro({ ...valido(), correo: 'a@@b.cl' }), /correo/i);
  assert.equal(validarFormularioRegistro({ ...valido(), correo: 'persona+etiqueta@inacapmail.cl' }), null);
});
test('teléfonos nacionales y +56; impide letras y largos incorrectos', () => {
  assert.equal(validarTelefonoChileno('912345678'), true);
  assert.equal(validarTelefonoChileno('+56 9 1234 5678'), true);
  assert.equal(validarTelefonoChileno('412345678'), true);
  assert.equal(validarTelefonoChileno('1234'), false);
  assert.equal(validarTelefonoChileno('9A2345678'), false);
});
test('aplica límites de datos personales y descripción', () => {
  assert.match(validarFormularioRegistro({ ...valido(), nombre: 'A'.repeat(LIMITES_REGISTRO.nombre + 1) }), /límite/);
  assert.match(validarFormularioRegistro({ ...valido(), diagnosticoPropietario: 'X'.repeat(LIMITES_REGISTRO.diagnosticoPropietario + 1) }), /límite/);
});
test('número de serie opcional, sin etiquetas ni caracteres de control', () => {
  assert.equal(validarFormularioRegistro({ ...valido(), numeroSerie: '' }), null);
  assert.match(validarFormularioRegistro({ ...valido(), numeroSerie: '<b>x</b>' }), /serie/i);
});
test('diferencia las etapas de propietario y equipo', () => {
  assert.equal(validarFormularioRegistro({ ...valido(), modeloEquipo: '' }, 'propietario'), null);
  assert.match(validarFormularioRegistro({ ...valido(), modeloEquipo: '' }, 'equipo'), /Modelo/i);
  assert.match(validarFormularioRegistro({ ...valido(), telefono: '' }, 'propietario'), /Teléfono/i);
});
test('rechaza caracteres nulos en diagnósticos, acepta saltos de línea', () => {
  assert.match(validarFormularioRegistro({ ...valido(), diagnosticoPropietario: 'Error\u0000 oculto' }), /Descripción/);
  assert.equal(validarFormularioRegistro({ ...valido(), diagnosticoPropietario: 'Error\nIntermitente' }), null);
});
