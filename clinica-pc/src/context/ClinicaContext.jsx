import { useEffect, useMemo, useReducer } from 'react';
import { datosIniciales } from '../data/datosIniciales.js';
import { MODULOS, rolesBase, tienePermiso, esTecnicoAsignable } from '../data/roles.js';
import { programarEncuesta, puedeCerrarTicket } from '../utils/seguimiento.js';
import { validarCustodia, validarRetiro, permiteGestionEntrega, ESTADO_CUSTODIA } from '../utils/entregaCustodia.js';
import { ClinicaContext } from './clinicaContextBase.js';
import { fechaLocal, obtenerEstadoJornada } from '../utils/jornadas.js';
import { encontrarRegionDeComuna } from '../data/regionesChile.js';
import {
  buscarDispositivoPrevio,
  normalizarRutIdentidad,
  obtenerVisitasDispositivo,
} from '../utils/dispositivos.js';

const STORAGE_KEY = 'clinica-pc-demo-v1';
const BACKUP_KEY = `${STORAGE_KEY}-backup`;
// La jornada presencial puede finalizar aunque los tickets entregados sigan en seguimiento.
const estadosSinAtencionPresencial = ['entregado', ESTADO_CUSTODIA, 'no_presentado', 'cancelado', 'cerrada', 'finalizada'];

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
        return {
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
        };
      }
    }
  } catch (error) {
    console.warn('Error recuperando datos del prototipo:', error);
  }
  return structuredClone(datosIniciales);
}

function limpiarDatosDemo(state) {
  const ejemplos = state.atenciones.filter(
    (a) =>
      a.jornadaId === 'JOR-001' &&
      a.estado === 'preinscrito' &&
      ((a.id === 'AT-001' && a.dispositivoId === 'DISP-001') ||
        (a.id === 'AT-002' && a.dispositivoId === 'DISP-002')),
  );
  if (!ejemplos.length) return state;
  const ids = new Set(ejemplos.map((a) => a.id));
  const atenciones = state.atenciones.filter((a) => !ids.has(a.id));
  const usados = new Set(atenciones.map((a) => a.dispositivoId));
  const idsDemo = new Set(ejemplos.map((a) => a.dispositivoId));
  const dispositivos = state.dispositivos.filter(
    (d) => !(idsDemo.has(d.id) && d.propietarioId === 'PROP-001' && !usados.has(d.id)),
  );
  const propietarioUsado = dispositivos.some((d) => d.propietarioId === 'PROP-001');
  return {
    ...state,
    atenciones,
    dispositivos,
    propietarios: state.propietarios.filter((p) => p.id !== 'PROP-001' || propietarioUsado),
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
      // 1. Buscar al propietario sin depender de puntos o guion en el RUT.
      const existente = state.propietarios.find(
        (p) => normalizarRutIdentidad(p.rut) === normalizarRutIdentidad(propietario.rut),
      );
      const propietarioId = existente?.id ?? propietario.id;
      // 2. Permitir seleccionar explícitamente un equipo anterior.
      // Nunca aceptar uno que pertenezca a otro propietario.
      const seleccionado = state.dispositivos.find(
        (d) => d.id === dispositivo.dispositivoExistenteId && d.propietarioId === propietarioId,
      );
      // 3. Si no se seleccionó uno, buscar por propietario + número de serie.
      const anterior =
        seleccionado || buscarDispositivoPrevio(state.dispositivos, propietarioId, dispositivo);
      const dispositivoId = anterior?.id ?? dispositivo.id;
      const visitasPrevias = obtenerVisitasDispositivo(state.atenciones, dispositivoId);
      // 4. Reutilizar la ficha del equipo. Crear solamente si es nuevo.
      const dispositivos = anterior
        ? state.dispositivos
        : [...state.dispositivos, { ...dispositivo, propietarioId }];
      // 5. Toda nueva visita genera una atención independiente.
      const nuevaAtencion = {
        ...atencion,
        dispositivoId,
        esReingreso: visitasPrevias.length > 0,
      };
      return {
        ...state,
        propietarios: existente
          ? state.propietarios.map((p) =>
              p.id === existente.id
                ? {
                    ...p,
                    region: p.region || encontrarRegionDeComuna(p.comuna) || propietario.region,
                  }
                : p,
            )
          : [...state.propietarios, { ...propietario, id: propietarioId }],
        dispositivos,
        atenciones: [...state.atenciones, nuevaAtencion],
      };
    }

    case 'ASIGNAR_TECNICO': {
      const { atencionId, tecnicoId, fechaRecepcion } = action.payload;
      const atencion = state.atenciones.find((a) => a.id === atencionId);
      const jornada = state.jornadas.find((j) => j.id === atencion?.jornadaId);
      const jornadaHabilitada =
        jornada?.fecha === fechaLocal() && obtenerEstadoJornada(jornada) === 'activa';
      const tecnicoValido = state.usuarios.some((u) => u.id === tecnicoId && esTecnicoAsignable(state, u));
      if (!atencion || atencion.estado !== 'preinscrito' || !jornadaHabilitada || !tecnicoValido)
        return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId
            ? { ...a, tecnicoIds: [tecnicoId], fechaRecepcion, estado: 'asignado' }
            : a,
        ),
      };
    }

    case 'GUARDAR_AVANCE_TECNICO': {
      const {
        atencionId,
        servicioIds,
        justificacionServicios,
        inspeccionInicial,
        respuestasChecklist,
        observacionesTecnicas,
      } = action.payload;
      const atencion = state.atenciones.find((a) => a.id === atencionId);
      if (!atencion || !['asignado', 'en_proceso'].includes(atencion.estado)) return state;
      const ids = [...new Set(servicioIds || [])];
      if (!ids.length || ids.some((id) => !state.servicios.some((s) => s.id === id))) return state;
      const cambio =
        ids.length !== atencion.servicioIds.length ||
        ids.some((id) => !atencion.servicioIds.includes(id));
      if (cambio && !String(justificacionServicios || '').trim()) return state;
      if (!inspeccionInicial?.encendido || !String(inspeccionInicial.estadoFisico || '').trim())
        return state;
      const completos = ids.every((id) => {
        const plantilla = state.plantillasChecklist.find((p) => p.servicioId === id);
        return (
          plantilla?.items?.length > 0 &&
          plantilla.items.every((item) => {
            const respuesta = (respuestasChecklist || []).find(
              (r) => r.servicioId === id && r.itemId === item.id,
            );
            return (
              respuesta &&
              ['Sí', 'No', 'No aplica'].includes(respuesta.estado) &&
              (respuesta.estado !== 'No' || String(respuesta.observacion || '').trim())
            );
          })
        );
      });
      if (!completos) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id !== atencionId
            ? a
            : {
                ...a,
                servicioIdsSolicitados: a.servicioIdsSolicitados || [...a.servicioIds],
                servicioIds: ids,
                justificacionServicios: String(
                  justificacionServicios || a.justificacionServicios || '',
                ).trim(),
                inspeccionInicial,
                respuestasChecklist,
                observacionesTecnicas,
                fechaUltimaActualizacion: new Date().toISOString(),
                estado: 'en_proceso',
              },
        ),
      };
    }

    case 'REGISTRAR_VERIFICACION_FINAL': {
      const { atencionId, verificacionFinal } = action.payload;
      const campos = [
        'encendido',
        'estadoFisico',
        'accesorios',
        'diferencias',
        'resultadoServicio',
      ];
      if (campos.some((c) => !String(verificacionFinal[c] ?? '').trim())) {
        return state;
      }
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'en_proceso'
            ? {
                ...a,
                verificacionFinal,
                fechaVerificacionFinal: new Date().toISOString(),
                estado: 'listo_entrega',
              }
            : a,
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
                ...a,
                contacto: { ...contacto, fecha: new Date().toISOString() },
                estado: 'contactado',
              }
            : a,
        ),
      };
    }

    case 'REGISTRAR_CUSTODIA': {
      const { atencionId, custodia, usuarioId } = action.payload || {};
      if (validarCustodia(custodia) || !permiteGestionEntrega(state, usuarioId)) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'contactado' && !a.entrega
            ? {
                ...a,
                estado: ESTADO_CUSTODIA,
                custodia: {
                  ubicacion: String(custodia.ubicacion).trim(),
                  responsableRecepcion: String(custodia.responsableRecepcion).trim(),
                  motivo: String(custodia.motivo).trim(),
                  fechaIngreso: new Date().toISOString(),
                  registradoPorUsuarioId: usuarioId,
                  confirmacionRecepcion: true,
                },
              }
            : a),
      };
    }

    case 'CONFIRMAR_ENTREGA': {
      const { atencionId, entrega, token, usuarioId } = action.payload || {};
      if (!token || validarRetiro(entrega) || !permiteGestionEntrega(state, usuarioId)) return state;
      const fechaRetiro = new Date().toISOString();
      return {
        ...state,
        atenciones: state.atenciones.map((a) => {
          if (a.id !== atencionId || !['contactado', ESTADO_CUSTODIA].includes(a.estado) ||
            a.entrega || a.cierreTicket) return a;
          if (a.estado === ESTADO_CUSTODIA && !a.custodia?.fechaIngreso) return a;
          return {
            ...a,
            entrega: {
              ...entrega,
              recibidoPor: String(entrega.recibidoPor).trim(),
              observaciones: String(entrega.observaciones || '').trim(),
              relacion: entrega.tipoReceptor === 'tercero' ? String(entrega.relacion).trim() : '',
              medioAutorizacion: entrega.tipoReceptor === 'tercero' ? entrega.medioAutorizacion : '',
              autorizacionConfirmada: entrega.tipoReceptor === 'tercero',
              pruebaConPropietario: entrega.tipoReceptor === 'propietario',
              fecha: fechaRetiro,
              registradoPorUsuarioId: usuarioId,
              procedenciaCustodia: a.estado === ESTADO_CUSTODIA,
            },
            ...(a.estado === ESTADO_CUSTODIA
              ? { custodia: { ...a.custodia, fechaSalida: fechaRetiro, entregadoPorUsuarioId: usuarioId } }
              : {}),
            estado: 'entregado',
            seguimiento: programarEncuesta(fechaRetiro, token),
          };
        }),
      };
    }

    case 'INICIAR_SEGUIMIENTO': {
      // Recuperar atenciones entregadas con versiones anteriores del prototipo.
      const { atencionId, usuarioId, token } = action.payload || {};
      const operador = state.usuarios.find((u) => u.id === usuarioId);
      if (!operador || !tienePermiso(state, operador.rol, 'parametros') || !token) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'entregado' && !a.seguimiento && !a.cierreTicket
            ? { ...a, seguimiento: programarEncuesta(a.entrega?.fecha || new Date().toISOString(), token) }
            : a),
      };
    }

    case 'SIMULAR_ENVIO_ENCUESTA': {
      // El frontend NO manda emails: marca un envío de prueba para verificar el recorrido local.
      const { atencionId, usuarioId } = action.payload || {};
      const operador = state.usuarios.find((u) => u.id === usuarioId);
      if (!operador || !tienePermiso(state, operador.rol, 'parametros')) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'entregado' &&
          a.seguimiento?.estado === 'pendiente_envio' && !a.cierreTicket
            ? {
                ...a,
                seguimiento: {
                  ...a.seguimiento,
                  estado: 'enviada_demo',
                  fechaSimulacion: new Date().toISOString(),
                  usuarioSimuladorId: usuarioId,
                },
              }
            : a),
      };
    }

    case 'RESPONDER_ENCUESTA': {
      const { token, calificacion, funcionamiento, comentarios } = action.payload || {};
      const nota = Number(calificacion);
      const detalle = String(comentarios || '').trim().slice(0, 2000);
      if (!token || !Number.isInteger(nota) || nota < 1 || nota > 5 ||
        !['bien', 'parcial', 'mal'].includes(funcionamiento) ||
        (funcionamiento !== 'bien' && !detalle)) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.estado === 'entregado' &&
          a.seguimiento?.token === token &&
          a.seguimiento?.estado === 'enviada_demo' && !a.seguimiento.respuesta && !a.cierreTicket
            ? {
                ...a,
                seguimiento: {
                  ...a.seguimiento,
                  estado: funcionamiento === 'bien' ? 'respondida' : 'incidencia',
                  respuesta: {
                    calificacion: nota,
                    funcionamiento,
                    comentarios: detalle,
                    fecha: new Date().toISOString(),
                  },
                },
              }
            : a),
      };
    }

    case 'RESOLVER_INCIDENCIA': {
      const { atencionId, usuarioId, observaciones } = action.payload || {};
      const operador = state.usuarios.find((u) => u.id === usuarioId);
      const nota = String(observaciones || '').trim().slice(0, 2000);
      if (!operador || !tienePermiso(state, operador.rol, 'parametros') || !nota) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && a.estado === 'entregado' &&
          a.seguimiento?.respuesta?.funcionamiento !== 'bien' &&
          a.seguimiento?.respuesta && !a.seguimiento?.resolucion && !a.cierreTicket
            ? {
                ...a,
                seguimiento: {
                  ...a.seguimiento,
                  estado: 'incidencia_resuelta',
                  resolucion: {
                    observaciones: nota,
                    fecha: new Date().toISOString(),
                    usuarioId,
                  },
                },
              }
            : a),
      };
    }

    case 'CERRAR_TICKET': {
      const { atencionId, usuarioId } = action.payload || {};
      const operador = state.usuarios.find((u) => u.id === usuarioId);
      if (!operador || !tienePermiso(state, operador.rol, 'parametros')) return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencionId && puedeCerrarTicket(a)
            ? {
                ...a,
                cierreTicket: {
                  fecha: new Date().toISOString(),
                  usuarioId,
                  motivo: a.seguimiento.respuesta.funcionamiento === 'bien'
                    ? 'Encuesta satisfactoria revisada'
                    : 'Incidencia revisada y resolución registrada',
                },
              }
            : a),
      };
    }

    case 'MARCAR_NO_PRESENTADO': {
      const atencion = state.atenciones.find((a) => a.id === action.payload);
      const jornada = state.jornadas.find((j) => j.id === atencion?.jornadaId);
      if (
        !atencion ||
        atencion.estado !== 'preinscrito' ||
        !jornada ||
        jornada.fecha >= fechaLocal()
      )
        return state;
      return {
        ...state,
        atenciones: state.atenciones.map((a) =>
          a.id === atencion.id
            ? {
                ...a,
                estado: 'no_presentado',
                fechaNoPresentacion: new Date().toISOString(),
              }
            : a,
        ),
      };
    }

    case 'CREAR_JORNADA': {
      const jornada = action.payload;
      if (jornada.fecha < fechaLocal()) return state;
      const duplicada = state.jornadas.some(
        (j) =>
          j.fecha === jornada.fecha && j.periodo.toLowerCase() === jornada.periodo.toLowerCase(),
      );
      return duplicada
        ? state
        : {
            ...state,
            jornadas: [...state.jornadas, jornada],
          };
    }

    case 'INICIAR_JORNADA':
      return {
        ...state,
        jornadas: state.jornadas.map((j) =>
          j.id === action.payload &&
          j.fecha === fechaLocal() &&
          obtenerEstadoJornada(j) === 'programada'
            ? { ...j, estado: 'activa' }
            : j,
        ),
      };

    case 'CERRAR_JORNADA': {
      const jornada = state.jornadas.find((j) => j.id === action.payload);
      if (
        !jornada ||
        jornada.fecha > fechaLocal() ||
        obtenerEstadoJornada(jornada) === 'finalizada'
      )
        return state;
      const abiertas = state.atenciones.some(
        (a) => a.jornadaId === jornada.id && !estadosSinAtencionPresencial.includes(a.estado),
      );
      if (abiertas) return state;
      return {
        ...state,
        jornadas: state.jornadas.map((j) =>
          j.id === jornada.id
            ? {
                ...j,
                estado: 'finalizada',
                fechaCierre: new Date().toISOString(),
              }
            : j,
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
              p.servicioId === servicioId ? { ...p, items: [...p.items, item] } : p,
            )
          : [
              ...state.plantillasChecklist,
              {
                id: `CHK-${servicioId}`,
                servicioId,
                items: [item],
              },
            ],
      };
    }

    case 'CREAR_ROL': {
      const { id, nombre, permisos } = action.payload || {};
      const nombreLimpio = String(nombre || '').trim();
      if (!id || !nombreLimpio || state.roles.some((r) => r.id === id ||
        r.nombre.toLowerCase() === nombreLimpio.toLowerCase())) return state;
      const autorizados = new Set(MODULOS.map((modulo) => modulo.id));
      const validos = [...new Set((permisos || []).filter((p) => autorizados.has(p)))];
      return { ...state, roles: [...state.roles, { id, nombre: nombreLimpio, permisos: validos }] };
    }

    case 'ACTUALIZAR_ROL': {
      const { id, nombre, permisos } = action.payload || {};
      const nombreLimpio = String(nombre || '').trim();
      const actual = state.roles.find((r) => r.id === id);
      if (!actual || !nombreLimpio || state.roles.some((r) => r.id !== id &&
        r.nombre.toLowerCase() === nombreLimpio.toLowerCase())) return state;
      const autorizados = new Set(MODULOS.map((modulo) => modulo.id));
      const validos = [...new Set((permisos || []).filter((p) => autorizados.has(p)))];
      // No permitir bloquear por accidente la cuenta administradora del prototipo.
      if (actual.sistema && !validos.includes('parametros')) return state;
      return { ...state, roles: state.roles.map((r) => r.id === id
        ? { ...r, nombre: nombreLimpio, permisos: validos } : r) };
    }

    case 'ASIGNAR_ROL_USUARIO': {
      const { usuarioId, rolId } = action.payload || {};
      if (!state.roles.some((r) => r.id === rolId)) return state;
      const usuario = state.usuarios.find((u) => u.id === usuarioId);
      if (!usuario) return state;
      const ultimoAdministrador = usuario.rol === 'superusuario' &&
        state.usuarios.filter((u) => u.rol === 'superusuario').length === 1;
      if (ultimoAdministrador && rolId !== 'superusuario') return state;
      return { ...state, usuarios: state.usuarios.map((u) => u.id === usuarioId
        ? { ...u, rol: rolId } : u) };
    }

    case 'CONFIGURAR_TECNICO_ASIGNABLE': {
      const { usuarioId, habilitado } = action.payload || {};
      const usuario = state.usuarios.find((u) => u.id === usuarioId);
      if (!usuario || typeof habilitado !== 'boolean') return state;
      if (habilitado && !tienePermiso(state, usuario.rol, 'tecnico')) return state;
      return {
        ...state,
        usuarios: state.usuarios.map((u) => u.id === usuarioId
          ? { ...u, habilitadoTecnico: habilitado } : u),
      };
    }

    case 'AGREGAR_USUARIOS': {
      const lista = Array.isArray(action.payload) ? action.payload : [];
      const rolesValidos = new Set(state.roles.map((r) => r.id));
      const nombres = new Set(state.usuarios.map((u) => String(u.nombre || '').trim().toLowerCase()));
      const aliases = new Set(state.usuarios.map((u) => String(u.usuario || '').trim().toLowerCase()));
      const nuevos = [];
      for (const usuario of lista) {
        const nombre = String(usuario.nombre || '').trim();
        const alias = String(usuario.usuario || '').trim().toLowerCase();
        if (!nombre || !alias || !rolesValidos.has(usuario.rol) ||
          nombres.has(nombre.toLowerCase()) || aliases.has(alias)) continue;
        nombres.add(nombre.toLowerCase());
        aliases.add(alias);
        nuevos.push({ id: usuario.id, nombre, usuario: alias, rol: usuario.rol, habilitadoTecnico: false });
      }
      return nuevos.length ? { ...state, usuarios: [...state.usuarios, ...nuevos] } : state;
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
