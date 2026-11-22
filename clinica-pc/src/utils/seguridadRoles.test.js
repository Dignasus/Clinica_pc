import test from 'node:test';
import assert from 'node:assert/strict';
import { clinicaReducer } from '../context/clinicaReducer.js';
import { datosIniciales } from '../data/datosIniciales.js';

function prepararCasoFicticio() {
  const estado = structuredClone(datosIniciales);
  estado.atenciones = [{
    id: 'AT-DEMO-SEGURIDAD',
    estado: 'entregado',
    seguimiento: { estado: 'pendiente_envio' },
  }];
  return estado;
}

test('técnico sin permiso no puede simular envíos administrativos', () => {
  const antes = prepararCasoFicticio();
  const despues = clinicaReducer(antes, {
    type: 'SIMULAR_ENVIO_ENCUESTA',
    payload: { atencionId: 'AT-DEMO-SEGURIDAD', usuarioId: 'cristian' },
  });
  assert.strictEqual(despues, antes, 'Debe rechazar la operación sin modificar el estado');
});

test('administrador puede realizar la misma operación de demostración', () => {
  const antes = prepararCasoFicticio();
  const despues = clinicaReducer(antes, {
    type: 'SIMULAR_ENVIO_ENCUESTA',
    payload: { atencionId: 'AT-DEMO-SEGURIDAD', usuarioId: 'matias' },
  });
  assert.notStrictEqual(despues, antes);
  assert.equal(despues.atenciones[0].seguimiento.estado, 'enviada_demo');
});

test('usuario inexistente no puede cambiar el seguimiento', () => {
  const antes = prepararCasoFicticio();
  const despues = clinicaReducer(antes, {
    type: 'SIMULAR_ENVIO_ENCUESTA',
    payload: { atencionId: 'AT-DEMO-SEGURIDAD', usuarioId: 'usuario-no-definido' },
  });
  assert.strictEqual(despues, antes);
});

// Las comprobaciones son evidencia de lógica de la DEMO, no autorización segura.
// Un atacante con acceso al navegador puede modificar el estado o el usuario.
