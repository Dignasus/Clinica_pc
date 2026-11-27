import { useEffect, useMemo, useReducer } from 'react';
import { datosIniciales } from '../data/datosIniciales.js';
import { rolesBase } from '../data/roles.js';
import { ClinicaContext } from './clinicaContextBase.js';
import { encontrarRegionDeComuna } from '../data/regionesChile.js';
import { clinicaReducer } from './clinicaReducer.js';
import { corregirModelosQaVisual } from '../utils/qaVisual.js';
import { asegurarJornadaDemo } from '../utils/jornadas.js';

const STORAGE_KEY = 'clinica-pc-demo-v1';
const BACKUP_KEY = `${STORAGE_KEY}-backup`;

function cargarDatos() {
  try {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const datos = JSON.parse(guardados);
      // Los registros de versiones anteriores carecen de "roles": migrarlos sin borrar tickets.
      const camposAntiguos = Object.keys(datosIniciales).filter((clave) => clave !== 'roles');
      if (camposAntiguos.every((clave) => Array.isArray(datos?.[clave]))) {
        const esVersionAnterior = !Array.isArray(datos.roles) || datos.roles.length === 0;
        const roles = esVersionAnterior ? structuredClone(rolesBase) : datos.roles;
        const alias = { matias: 'admin', camila: 'recepcion', cristian: 'tecnico' };
        const rolesCorregidos = { matias: 'superusuario', camila: 'recepcionista', cristian: 'tecnico' };
        return asegurarJornadaDemo(corregirModelosQaVisual({
          ...datos,
          roles,
          usuarios: datos.usuarios.map((u) => ({
            ...u,
            usuario: u.usuario || alias[u.id] || u.id.toLowerCase(),
            // Corregir DEF-01 únicamente en la migración desde la versión de roles fijos.
            rol: esVersionAnterior ? (rolesCorregidos[u.id] || u.rol) : u.rol,
            habilitadoTecnico: u.habilitadoTecnico ??
              ((esVersionAnterior ? (rolesCorregidos[u.id] || u.rol) : u.rol) === 'tecnico'),
            nombre: esVersionAnterior && u.id === 'camila' ? 'Camila Rojas' : u.nombre,
          })),
          propietarios: datos.propietarios.map((p) => ({
            ...p,
            region: p.region || encontrarRegionDeComuna(p.comuna) || '',
          })),
        }));
      }
    }
  } catch (error) {
    console.warn('Error recuperando datos del prototipo:', error);
  }
  return asegurarJornadaDemo(structuredClone(datosIniciales));
}

export function ClinicaProvider({ children }) {
  const [datos, dispatch] = useReducer(clinicaReducer, undefined, cargarDatos);

  useEffect(() => {
    try {
      const anterior = localStorage.getItem(STORAGE_KEY);
      const nuevo = JSON.stringify(datos);

      if (anterior && anterior !== nuevo) {
        let datosAnteriores = null;

        try {
          datosAnteriores = JSON.parse(anterior);
        } catch {
          console.warn('Los datos anteriores no son JSON válido.');
        }

        if (Array.isArray(datosAnteriores?.atenciones) && datosAnteriores.atenciones.length > 0) {
          localStorage.setItem(BACKUP_KEY, anterior);
        }
      }

      localStorage.setItem(STORAGE_KEY, nuevo);
    } catch (error) {
      console.error('Error guardando o respaldando datos:', error);
    }
  }, [datos]);

  const valor = useMemo(() => ({ datos, dispatch }), [datos]);

  return <ClinicaContext.Provider value={valor}>{children}</ClinicaContext.Provider>;
}
