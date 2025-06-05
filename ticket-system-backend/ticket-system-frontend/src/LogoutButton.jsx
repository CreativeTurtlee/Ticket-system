import React from 'react';

const LogoutButton = ({ onLogout }) => {
  const handleLogout = () => {
    localStorage.clear();
    if (onLogout) onLogout();
    window.location.reload();
  };

  return (
    <button onClick={handleLogout} style={{ float: 'right', margin: 20 }}>
      Выйти
    </button>
  );
};

export default LogoutButton; 