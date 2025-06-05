import React from 'react';
import image1 from './assets/1.png';

const LandingPage = ({ onLoginClick }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: 'Arial, sans-serif' }}>

      {/* Контент */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '40px 60px 0 60px' }}>
        <div style={{ minWidth: 340, marginRight: 40 }}>
          <a href="#" style={{ color: '#1976d2', fontSize: 18, textDecoration: 'none', fontWeight: 500 }}>Сайт компании</a>
          <div style={{ marginTop: 30 }}>
            <img src={image1} alt="Тикет-система" style={{ width: 320, borderRadius: 10, boxShadow: '0 2px 8px #eee' }} />
          </div>
        </div>
        <div style={{ flex: 1, marginTop: 55 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Тикет-система для технической поддержки предприятия</div>
          <ul style={{ fontSize: 17, color: '#222', marginBottom: 30 }}>
            <li style={{ marginBottom: 10 }}>Удобное решение для приёма и обработки заявок от сотрудников</li>
            <li style={{ marginBottom: 10 }}>Создавайте обращения, отслеживайте статус выполнения и быстро получайте помощь специалиста</li>
            <li>Система автоматизирует процесс поддержки и делает внутреннее взаимодействие проще и прозрачнее!</li>
          </ul>
          <button onClick={onLoginClick} style={{ padding: '10px 32px', fontSize: 18, borderRadius: 8, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', fontWeight: 600, cursor: 'pointer', marginTop: 10 }}>Войти</button>
        </div>
      </div>
      {/* Футер */}
      <footer style={{ borderTop: '1px solid #e0e0e0', padding: '18px 40px', color: '#888', fontSize: 15, display: 'flex', justifyContent: 'space-between', background: '#fafbfc', marginTop: 40 }}>
        <div>Контакты: <span style={{ color: '#222' }}>+7 999 400 23 32</span></div>
        <div>ticketsystem_help@mail.ru</div>
      </footer>
    </div>
  );
};

export default LandingPage; 