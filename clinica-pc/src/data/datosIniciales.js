
export const datosIniciales = {
  jornadas: [
    {
      id: 'JOR-001',
      periodo: 'Otoño 2026',
      fecha: '2026-05-15',
      estado: 'finalizada',
    },
  ],

  usuarios: [
    { id: 'matias', nombre: 'Matías Carrasco', rol: 'tecnico' },
    { id: 'cristian', nombre: 'Cristian', rol: 'tecnico' },
    { id: 'camila', nombre: 'Camila', rol: 'tecnico' },
  ],

  servicios: [
    { id: 'formateo', nombre: 'Formateo' },
    { id: 'mantencionFisica', nombre: 'Mantención Física' },
    { id: 'mantencionLogica', nombre: 'Mantención Lógica' },
  ],

  plantillasChecklist: [
    {
      id: 'CHK-001',
      servicioId: 'mantencionLogica',
      items: [
        { id: 'LOG-01', descripcion: 'Verificar estado del sistema operativo' },
        { id: 'LOG-02', descripcion: 'Revisar programas de inicio' },
      ],
    },
    {
      id: 'CHK-002',
      servicioId: 'mantencionFisica',
      items: [
        { id: 'FIS-01', descripcion: 'Inspeccionar ventiladores' },
        { id: 'FIS-02', descripcion: 'Verificar limpieza interna' },
      ],
    },
    {
      id: 'CHK-003',
      servicioId: 'formateo',
      items: [
        { id: 'FOR-01', descripcion: 'Confirmar autorización para formatear' },
        { id: 'FOR-02', descripcion: 'Verificar instalación del sistema operativo' },
      ],
    },
  ],

  // Los registros se crean mediante Inscripción, no automáticamente.
  propietarios: [],
  dispositivos: [],
  atenciones: [],
};
