'use client';

import React, { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Login, Logout } from '@mui/icons-material';

const BrandLogin = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  
  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  
  const handleLoginClick = useCallback(() => {
    handleMenuClose();
    router.push('/admin/login');
  }, [handleMenuClose, router]);
  
  const handleLogoutClick = useCallback(async () => {
    handleMenuClose();
    await logout();
  }, [handleMenuClose, logout]);
  
  return (
    <>
      <div 
        className="w-auto px-2 h-8 bg-[#f8a287] rounded-md flex items-center justify-center text-white text-xs cursor-pointer hover:bg-[#e27d60] transition-colors"
        onClick={handleMenuOpen}
      >
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white">
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
          <span>by Woundy</span>
          {isAuthenticated && (
            <span className="ml-1 bg-white/30 px-1 rounded text-[10px]">
              {user?.username}
            </span>
          )}
        </div>
      </div>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        {isAuthenticated ? (
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Odhlásit se</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={handleLoginClick}>
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
            <ListItemText>Přihlásit se</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

// Použití memo pro předejití zbytečným renderům
export default memo(BrandLogin); 