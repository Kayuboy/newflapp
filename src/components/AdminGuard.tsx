'use client';

import React, { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

type AdminGuardProps = {
  children: ReactNode;
  fallback?: ReactNode; // Volitelný obsah, který se zobrazí, pokud uživatel není admin
};

/**
 * Komponenta, která zobrazí své potomky pouze v případě, že je přihlášený uživatel administrátor.
 * Jinak nezobrazí nic nebo zobrazí fallback obsah, pokud je poskytnut.
 */
const AdminGuard: React.FC<AdminGuardProps> = ({ children, fallback = null }) => {
  const { isAdmin, isAuthenticated } = useAuth();

  // Zobrazíme potomky pouze pokud je uživatel admin
  if (isAuthenticated && isAdmin) {
    return <>{children}</>;
  }

  // Jinak zobrazíme fallback nebo nic
  return <>{fallback}</>;
};

export default AdminGuard; 