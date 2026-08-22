import { useContext } from 'react';

import { AppAuthContextValue, AppAuthContext } from '../contexts/AppAuthContext';

export const useAppAuth = (): AppAuthContextValue => {
  const ctx = useContext(AppAuthContext);
  if (!ctx) {
    throw new Error('useAppAuth must be used within AuthProvider');
  }
  return ctx;
};