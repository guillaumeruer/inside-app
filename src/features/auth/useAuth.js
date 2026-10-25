import { useContext } from 'react';
import { AuthContext } from './authContext.js';

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
