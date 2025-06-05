import React, { useState } from 'react';
import axios from 'axios';

const inputStyle = {
  width: '100%',
  padding: '12px',
  margin: '8px 0',
  border: '1px solid #cfd8dc',
  borderRadius: 8,
  fontSize: 16,
  background: '#f7fafd',
  transition: 'border 0.2s',
  outline: 'none',
};
const buttonStyle = {
  width: '100%',
  padding: '12px',
  background: '#1976d2',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 17,
  marginTop: 12,
  cursor: 'pointer',
  boxShadow: '0 2px 8px #e3eaf2',
  transition: 'background 0.2s',
};
const errorStyle = {
  color: '#d32f2f',
  background: '#fff0f0',
  border: '1px solid #ffcdd2',
  borderRadius: 6,
  padding: '8px 12px',
  margin: '10px 0',
  fontSize: 15,
  textAlign: 'center',
};
const successStyle = {
  color: '#388e3c',
  background: '#e8f5e9',
  border: '1px solid #a5d6a7',
  borderRadius: 6,
  padding: '8px 12px',
  margin: '10px 0',
  fontSize: 15,
  textAlign: 'center',
};

const containerStyle = {
  minHeight: '100vh',
  width: '100vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f5f7fa',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 1000,
};

const LoginForm = ({ onAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isRegister) {
        await axios.post('http://127.0.0.1:8000/api/register', { name, email, password });
        setSuccess('Регистрация успешна! Теперь войдите.');
        setIsRegister(false);
      } else {
        const res = await axios.post('http://127.0.0.1:8000/api/login', { email, password });
        localStorage.setItem('access_token', res.data.access_token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('roles', JSON.stringify(res.data.roles));
        if (onAuth) onAuth();
      }
    } catch (err) {
      setError('Ошибка авторизации или регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={{
        width: 340,
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px #e3eaf2',
        padding: '36px 32px 28px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontWeight: 700, fontSize: 28, marginBottom: 18, color: '#263238', letterSpacing: 1 }}>Вход</div>
        {isRegister && (
          <input
            type="text"
            placeholder="Имя"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
          autoFocus
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? 'Загрузка...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
        </button>
        <div style={{ marginTop: 18, width: '100%' }}>
          {!isRegister ? (
            <span style={{ color: '#222', fontSize: 16 }}>
              Нет аккаунта?{' '}
              <span style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}>Зарегистрироваться</span>
            </span>
          ) : (
            <span style={{ color: '#222', fontSize: 16 }}>
              Уже есть аккаунт?{' '}
              <span style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 500 }} onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}>Войти</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginForm; 