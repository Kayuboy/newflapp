'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';

type AuthProviderWrapperProps = {
  children: React.ReactNode;
};

const AuthProviderWrapper = ({ children }: AuthProviderWrapperProps) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default AuthProviderWrapper; 