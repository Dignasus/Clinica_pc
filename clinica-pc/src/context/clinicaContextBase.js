
import { createContext, useContext } from 'react';

export const ClinicaContext = createContext(null);

export function useClinica() {
  const contexto = useContext(ClinicaContext);

  if (!contexto) {
    throw new Error(
      'useClinica debe utilizarse dentro de ClinicaProvider'
    );
  }

  return contexto;
}
