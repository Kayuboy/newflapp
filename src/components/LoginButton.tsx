'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Person, Login, Logout } from '@mui/icons-material';

const LoginButton = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLoginClick = () => {
    handleMenuClose();
    router.push('/admin/login');
  };
  
  const handleLogoutClick = async () => {
    handleMenuClose();
    await logout();
  };
  
  return (
    <>
      <Tooltip title={isAuthenticated ? `Přihlášen jako: ${user?.username}` : 'Přihlásit se jako administrátor'}>
        <IconButton
          onClick={handleMenuOpen}
          size="small"
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <Person />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
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

export default LoginButton; 