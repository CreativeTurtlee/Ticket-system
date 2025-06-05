import React, { useState } from 'react';
import LoginForm from './LoginForm';
import LogoutButton from './LogoutButton';
import CreateTicketForm from './CreateTicketForm';
import AdminPage from './AdminPage';
import UserPage from './UserPage';
import SpecialistPage from './SpecialistPage';
import LandingPage from './LandingPage';

const MainPage = () => {
  const [showLogin, setShowLogin] = useState(false);

  // Проверяем, авторизован ли пользователь
  const user = localStorage.getItem('user');
  const roles = JSON.parse(localStorage.getItem('roles') || '[]');

  if (user) {
    // Если роль admin, показываем AdminPage
    if (roles.includes('admin')) {
      return <AdminPage />;
    }
    // Если роль user, показываем UserPage
    if (roles.includes('user')) {
      return <UserPage />;
    }
    // Если роль specialist, показываем SpecialistPage
    if (roles.includes('specialist')) {
      return <SpecialistPage />;
    }
  }

  // Если не авторизован — показываем LandingPage
  return (
    <>
      {!showLogin ? (
        <LandingPage onLoginClick={() => setShowLogin(true)} />
      ) : (
        <LoginForm onAuth={() => window.location.reload()} />
      )}
    </>
  );
};

export default MainPage; 