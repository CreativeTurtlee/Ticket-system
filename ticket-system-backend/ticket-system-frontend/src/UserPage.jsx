import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateTicketForm from './CreateTicketForm';

const statusColors = {
  'Новая': 'red',
  'В работе': 'blue',
  'Выполнена': 'green',
  'Закрыта': 'gray',
};

const sidebarItems = [
  { label: 'Кабинет пользователя', icon: '🏠', key: 'cabinet' },
  { label: 'Создание заявки', icon: '📝', key: 'create' },
];

const UserPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('cabinet');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTickets = () => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/tickets', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })
      .then(res => setTickets(res.data.filter(t => t.author?.id === user.id)))
      .catch(() => setError('Ошибка загрузки заявок'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line
  }, []);

  const handleCreateSuccess = () => {
    setShowCreate(false);
    setLoading(true);
    fetchTickets();
  };

  const closeTicketModal = () => setSelectedTicket(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#fff' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#f8f9fa', borderRight: '1px solid #e0e0e0', padding: '30px 0' }}>
        <div style={{ marginBottom: 40, textAlign: 'center', color: '#888', fontSize: 16 }}>
          Добро пожаловать!
        </div>
        <nav>
          {sidebarItems.map(item => (
            <div
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 30px',
                cursor: 'pointer',
                background: activeMenu === item.key ? '#e3f0ff' : 'none',
                color: activeMenu === item.key ? '#1976d2' : '#222',
                fontWeight: activeMenu === item.key ? 600 : 400,
                borderLeft: activeMenu === item.key ? '4px solid #1976d2' : '4px solid transparent',
                marginBottom: 4,
                borderRadius: '0 20px 20px 0',
                transition: 'background 0.2s',
              }}
            >
              <span style={{ marginRight: 12 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px 10px 40px', borderBottom: '1px solid #e0e0e0' }}>
          <div></div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Роль: Сотрудник</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#1976d2', fontWeight: 500, fontSize: 16 }}>{user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#f5f5f5', fontWeight: 600, cursor: 'pointer' }}>Выйти</button>
          </div>
        </header>

        {/* Main block */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 style={{ margin: 0 }}>Мои заявки:</h2>
            <button onClick={() => setShowCreate(v => !v)} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', fontWeight: 600, cursor: 'pointer' }}>
              Создать заявку
            </button>
          </div>
          {showCreate && (
            <div style={{ marginBottom: 30 }}>
              <CreateTicketForm onSuccess={handleCreateSuccess} />
            </div>
          )}
          {loading ? (
            <div>Загрузка...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 900, background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#f3f6fa', fontWeight: 600 }}>
                    <th style={thStyle}>№ заявки</th>
                    <th style={thStyle}>Тема</th>
                    <th style={thStyle}>Дата создания</th>
                    <th style={thStyle}>Статус</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, idx) => (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={tdStyle}>{ticket.title}</td>
                      <td style={tdStyle}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                      <td style={{ ...tdStyle, color: statusColors[ticket.status?.name] || '#222', fontWeight: 600 }}>
                        {ticket.status?.name}
                      </td>
                      <td style={tdStyle}>
                        <button
                          style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', cursor: 'pointer', fontWeight: 500 }}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Просмотреть
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Footer */}
        <footer style={{ borderTop: '1px solid #e0e0e0', padding: '18px 40px', color: '#888', fontSize: 15, display: 'flex', justifyContent: 'space-between', background: '#fafbfc' }}>
          <div>Контакты: <span style={{ color: '#222' }}>+7 999 400 23 32</span></div>
          <div>ticketsystem_help@mail.ru</div>
        </footer>
      </div>

      {/* Модальное окно для просмотра заявки */}
      {selectedTicket && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 8px 32px #0002', padding: 36, minWidth: 400, maxWidth: 520, position: 'relative' }}>
            <button onClick={closeTicketModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
            <h2 style={{ marginTop: 0, marginBottom: 18 }}>Детали заявки</h2>
            <div style={{ marginBottom: 10 }}><b>Тема:</b> {selectedTicket.title}</div>
            <div style={{ marginBottom: 10 }}><b>Описание:</b> {selectedTicket.description}</div>
            <div style={{ marginBottom: 10 }}><b>Статус:</b> <span style={{ color: statusColors[selectedTicket.status?.name] || '#222', fontWeight: 600 }}>{selectedTicket.status?.name}</span></div>
            <div style={{ marginBottom: 10 }}><b>Дата создания:</b> {new Date(selectedTicket.created_at).toLocaleString()}</div>
            {selectedTicket.file && (
              <div style={{ marginBottom: 10 }}><b>Файл:</b> <a href={`http://127.0.0.1:8000/storage/${selectedTicket.file}`} target="_blank" rel="noopener noreferrer">Скачать</a></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const thStyle = {
  padding: '12px 10px',
  borderBottom: '2px solid #e0e0e0',
  textAlign: 'left',
  fontSize: 15,
};
const tdStyle = {
  padding: '10px 10px',
  fontSize: 15,
};

export default UserPage; 