
import { useEffect, useMemo, useReducer } from 'react';
import { datosIniciales } from '../data/datosIniciales.js';
import { ClinicaContext } from './clinicaContextBase.js';
import { fechaLocal, obtenerEstadoJornada } from '../utils/jornadas.js';

const STORAGE_KEY = 'clinica-pc-demo-v1';
const estadosFinales = ['entregado', 'no_presentado', 'cancelado', 'cerrada', 'finalizada'];

function cargarDatos() {
  try {
    const guardados = localStorage.getItem(STORAGE_KEY);
    if (guardados) {
      const datos = JSON.parse(guardados);
      if (Object.keys(datosIniciales).every((clave) => Array.isArray(datos?.[clave]))) {
        return datos;
      }
    }
  } catch (error) {
    console.warn('Error recuperando datos:', error);
  }

  return structuredClone(datosIniciales);
}

function limpiarDatosDemo(state) {
  const ejemplos = state.atenciones.filter((a) =>
    a.jornadaId === 'JOR-001' && a.estado === 'preinscrito' &&
    ((a.id === 'AT-001' && a.dispositivoId === 'DISP-001') ||
     (a.id === 'AT-002' && a.dispositivoId === 'DISP-002'))
  );

  if (!ejemplos.length) return state;

  const ids = new Set(ejemplos.map((a) => a.id));
  const atenciones = state.atenciones.filter((a) => !ids.has(a.id));
  const utilizados = new Set(atenciones.map((a) => a.dispositivoId));
  const idsDemo = new Set(ejemplos.map((a) => a.dispositivoId));

  const dispositivos = state.dispositivos.filter((d) =>
    !(idsDemo.has(d.id) && d.propietarioId === 'PROP-001' &&
      !utilizados.has(d.id))
  );

  const propietarioUsado = dispositivos.some((d) => d.propietarioId === 'PROP-001');

  return {
    ...state, atenciones, dispositivos,
    propietarios: state.propietarios.filter(
      (p) => p.id !== 'PROP-001' || propietarioUsado
    ),
  };
}

function clinicaReducer(state, action) {
  switch (action.type) {
    case 'REGISTRAR_PREINSCRIPCION': {
      const { propietario, dispositivo, atencion } = action.payload;
      const jornada = state.jornadas.find((j) => j.id === atencion.jornadaId);

      if (!jornada || !['programada', 'activa'].includes(obtenerEstadoJornada(jornada))) {
        return state;
      }

      const existente = state.propietarios.find((p) => p.rut === propietario.rut);
      const propietarioId = existente?.id ?? propietario.id;

      return {
        ...state,
        propietarios: existente ? state.propietarios : [...state.propietarios, propietario],
        dispositivos: [...state.dispositivos, { ...dispositivo, propietarioId }],
        atenciones: [...state.atenciones, { ...atencion, dispositivoId: dispositivo.id }],
      };
    }

    case 'ASIGNAR_TECNICO': {
      const { atencionId, tecnicoId, fechaRecepcion } = action.payload;
      if (!state.usuarios.some((u) => u.id === tecnicoId && u.rol === 'tecnico')) {
        return state;
      }

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'preinscrito'
            ? { ...a, tecnicoIds: [tecnicoId], fechaRecepcion, estado: 'asignado' }
            : a
        ),
      };
    }

    case 'GUARDAR_AVANCE_TECNICO': {
      const { atencionId, inspeccionInicial, respuestasChecklist,
        observacionesTecnicas } = action.payload;

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && ['asignado', 'en_proceso'].includes(a.estado)
            ? {
                ...a, inspeccionInicial, respuestasChecklist, observacionesTecnicas,
                fechaUltimaActualizacion: new Date().toISOString(),
                estado: 'en_proceso',
              }
            : a
        ),
      };
    }

    case 'REGISTRAR_VERIFICACION_FINAL': {
      const { atencionId, verificacionFinal } = action.payload;
      const campos = ['encendido', 'estadoFisico', 'accesorios',
        'diferencias', 'resultadoServicio'];

      if (campos.some((c) => !String(verificacionFinal[c] ?? '').trim())) {
        return state;
      }

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'en_proceso'
            ? {
                ...a, verificacionFinal,
                fechaVerificacionFinal: new Date().toISOString(),
                estado: 'listo_entrega',
              }
            : a
        ),
      };
    }

    case 'REGISTRAR_CONTACTO': {
      const { atencionId, contacto } = action.payload;
      if (!contacto.medio || !String(contacto.observaciones ?? '').trim()) return state;

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'listo_entrega'
            ? {
                ...a, contacto: {
                  ...contacto, fecha: new Date().toISOString(),
                },
                estado: 'contactado',
              }
            : a
        ),
      };
    }

    case 'CONFIRMAR_ENTREGA': {
      const { atencionId, entrega } = action.payload;
      if (!entrega.pruebaConPropietario || !entrega.conformidad ||
          !String(entrega.recibidoPor ?? '').trim()) return state;

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'contactado'
            ? {
                ...a, entrega: {
                  ...entrega, fecha: new Date().toISOString(),
                },
                estado: 'entregado',
              }
            : a
        ),
      };
    }

    case 'MARCAR_NO_PRESENTADO': {
      const atencion = state.atenciones.find((a) => a.id === action.payload);
      const jornada = state.jornadas.find((j) => j.id === atencion?.jornadaId);

      if (!atencion || atencion.estado !== 'preinscrito' ||
          !jornada || jornada.fecha >= fechaLocal()) return state;

      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencion.id
            ? {
                ...a, estado: 'no_presentado',
                fechaNoPresentacion: new Date().toISOString(),
              }
            : a
        ),
      };
    }

    case 'CREAR_JORNADA': {
      const jornada = action.payload;
      if (jornada.fecha < fechaLocal()) return state;

      const duplicada = state.jornadas.some((j) =>
        j.fecha === jornada.fecha &&
        j.periodo.toLowerCase() === jornada.periodo.toLowerCase()
      );

      return duplicada ? state : {
        ...state, jornadas: [...state.jornadas, jornada],
      };
    }

    case 'INICIAR_JORNADA':
      return {
        ...state,
        jornadas: state.jornadas.map((j) =>
          j.id === action.payload && j.fecha === fechaLocal() &&
          obtenerEstadoJornada(j) === 'programada'
            ? { ...j, estado: 'activa' }
            : j
        ),
      };

    case 'CERRAR_JORNADA': {
      const jornada = state.jornadas.find((j) => j.id === action.payload);
      if (!jornada || jornada.fecha > fechaLocal() ||
          obtenerEstadoJornada(jornada) === 'finalizada') return state;

      const abiertas = state.atenciones.some((a) =>
        a.jornadaId === jornada.id && !estadosFinales.includes(a.estado)
      );
      if (abiertas) return state;

      return {
        ...state,
        jornadas: state.jornadas.map((j) =>
          j.id === jornada.id
            ? {
                ...j, estado: 'finalizada',
                fechaCierre: new Date().toISOString(),
              }
            : j
        ),
      };
    }

    case 'AGREGAR_ITEM_CHECKLIST': {
      const { servicioId, item } = action.payload;
      const existe = state.plantillasChecklist.some((p) => p.servicioId === servicioId);

      return {
        ...state,
        plantillasChecklist: existe
          ? state.plantillasChecklist.map((p) =>
              p.servicioId === servicioId
                ? { ...p, items: [...p.items, item] } : p
            )
          : [...state.plantillasChecklist, {
              id: `CHK-${servicioId}`, servicioId, items: [item],
            }],
      };
    }

    case 'LIMPIAR_DATOS_DEMO':
      return limpiarDatosDemo(state);

    default:
      return state;
  }
}

export function ClinicaProvider({ children }) {
  const [datos, dispatch] = useReducer(clinicaReducer, undefined, cargarDatos);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    } catch (error) {
      console.warn('No fue posible guardar los datos:', error);
    }
  }, [datos]);

  const valor = useMemo(() => ({ datos, dispatch }), [datos]);

  return (
    <ClinicaContext.Provider value={valor}>
      {children}
    </ClinicaContext.Provider>
  );
}
