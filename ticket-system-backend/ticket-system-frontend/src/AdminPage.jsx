import React, { useEffect, useState } from 'react';
import axios from 'axios';

const statusColors = {
  'Новая': 'red',
  'В работе': 'blue',
  'Выполнена': 'green',
  'Закрыта': 'gray',
};

const sidebarItems = [
  { label: 'Все заявки', icon: '📄', key: 'all' },
  { label: 'Назначенные заявки', icon: '📋', key: 'assigned' },
  { label: 'Статистика', icon: '📊', key: 'stats' },
  { label: 'Управление пользователями', icon: '👤', key: 'users' },
];

const AdminPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState('all');
  const [specialists, setSpecialists] = useState([]);
  const [assigning, setAssigning] = useState({}); // { [ticketId]: specialistId }
  const [assignLoading, setAssignLoading] = useState({}); // { [ticketId]: bool }
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [editRoles, setEditRoles] = useState({}); // { [userId]: [roleName, ...] }
  const [saveLoading, setSaveLoading] = useState({});
  const [selectedTicket, setSelectedTicket] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Получить заявки и специалистов
  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    Promise.all([
      axios.get('http://127.0.0.1:8000/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }),
      axios.get('http://127.0.0.1:8000/api/users?role=specialist', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
    ])
      .then(([ticketsRes, specialistsRes]) => {
        setTickets(ticketsRes.data);
        setSpecialists(specialistsRes.data);
      })
      .catch(() => setError('Ошибка загрузки заявок или специалистов'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (activeMenu === 'stats') {
      setStatsLoading(true);
      setStatsError('');
      const token = localStorage.getItem('access_token');
      axios.get('http://127.0.0.1:8000/api/tickets/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
        .then(res => setStats(res.data))
        .catch(() => setStatsError('Ошибка загрузки статистики'))
        .finally(() => setStatsLoading(false));
    }
    // eslint-disable-next-line
  }, [activeMenu]);

  useEffect(() => {
    if (activeMenu === 'users') {
      setUsersLoading(true);
      setUsersError('');
      const token = localStorage.getItem('access_token');
      Promise.all([
        axios.get('http://127.0.0.1:8000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://127.0.0.1:8000/api/roles', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
        .then(([usersRes, rolesRes]) => {
          setUsers(usersRes.data);
          setRoles(rolesRes.data);
          // Заполняем editRoles начальными ролями
          const initial = {};
          usersRes.data.forEach(u => {
            initial[u.id] = u.roles.map(r => r.name);
          });
          setEditRoles(initial);
        })
        .catch(() => setUsersError('Ошибка загрузки пользователей или ролей'))
        .finally(() => setUsersLoading(false));
    }
    // eslint-disable-next-line
  }, [activeMenu]);

  // Назначить исполнителя
  const handleAssign = async (ticketId) => {
    const specialistId = assigning[ticketId];
    if (!specialistId) return;
    setAssignLoading(prev => ({ ...prev, [ticketId]: true }));
    const token = localStorage.getItem('access_token');
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tickets/${ticketId}`, { assigned_to: specialistId }, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      fetchData();
    } catch (e) {
      alert('Ошибка назначения исполнителя');
    } finally {
      setAssignLoading(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleRoleChange = (userId, roleName, checked) => {
    setEditRoles(prev => {
      const current = prev[userId] || [];
      let updated;
      if (checked) {
        updated = [...current, roleName];
      } else {
        updated = current.filter(r => r !== roleName);
      }
      return { ...prev, [userId]: updated };
    });
  };

  const handleSaveRoles = async (userId) => {
    setSaveLoading(prev => ({ ...prev, [userId]: true }));
    const token = localStorage.getItem('access_token');
    try {
      await axios.patch(`http://127.0.0.1:8000/api/users/${userId}/roles`, { roles: editRoles[userId] }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Обновить пользователей после сохранения
      setUsersLoading(true);
      const usersRes = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
      setUsersLoading(false);
    } catch (e) {
      alert('Ошибка при сохранении ролей');
    } finally {
      setSaveLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя?')) return;
    setSaveLoading(prev => ({ ...prev, [userId]: true }));
    const token = localStorage.getItem('access_token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Обновить пользователей после удаления
      setUsersLoading(true);
      const usersRes = await axios.get('http://127.0.0.1:8000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
      setUsersLoading(false);
    } catch (e) {
      alert('Ошибка при удалении пользователя');
    } finally {
      setSaveLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const closeTicketModal = () => setSelectedTicket(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#f8f9fa', borderRight: '1px solid #e0e0e0', padding: '30px 0' }}>
        <div style={{ marginBottom: 40, textAlign: 'center', color: '#888', fontSize: 16 }}>
          Добро пожаловать
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
      <div style={{ flex: 1, background: '#fff', minHeight: '100vh' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '30px 40px 10px 40px', borderBottom: '1px solid #e0e0e0' }}>
          <div></div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Роль: Администратор</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#1976d2', fontWeight: 500, fontSize: 16 }}>{user.name}</span>
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: '#f5f5f5', fontWeight: 600, cursor: 'pointer' }}>Выйти</button>
          </div>
        </header>

        {/* Table */}
        <div style={{ padding: '40px' }}>
          {activeMenu === 'all' && (
            <>
              <h2 style={{ marginBottom: 24 }}>Все заявки</h2>
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
                        <th style={thStyle}>Автор</th>
                        <th style={thStyle}>Исполнитель</th>
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
                          <td style={tdStyle}>{ticket.author?.name}</td>
                          <td style={tdStyle}>
                            {ticket.assigned_to?.name || '-'}
                            <div style={{ marginTop: 6 }}>
                              <select
                                value={assigning[ticket.id] || ''}
                                onChange={e => setAssigning(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #ccc', minWidth: 120 }}
                              >
                                <option value="">Выбрать исполнителя</option>
                                {specialists.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleAssign(ticket.id)}
                                disabled={!assigning[ticket.id] || assignLoading[ticket.id]}
                                style={{ marginLeft: 8, padding: '4px 12px', borderRadius: 6, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', fontWeight: 500, cursor: 'pointer' }}
                              >
                                {assignLoading[ticket.id] ? 'Назначение...' : 'Назначить'}
                              </button>
                            </div>
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
            </>
          )}
          {activeMenu === 'assigned' && (
            <>
              <h2 style={{ marginBottom: 24 }}>Назначенные заявки</h2>
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
                        <th style={thStyle}>Автор</th>
                        <th style={thStyle}>Исполнитель</th>
                        <th style={thStyle}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.filter(ticket => ticket.assigned_to).map((ticket, idx) => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={tdStyle}>{idx + 1}</td>
                          <td style={tdStyle}>{ticket.title}</td>
                          <td style={tdStyle}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                          <td style={{ ...tdStyle, color: statusColors[ticket.status?.name] || '#222', fontWeight: 600 }}>
                            {ticket.status?.name}
                          </td>
                          <td style={tdStyle}>{ticket.author?.name}</td>
                          <td style={tdStyle}>{ticket.assigned_to?.name || '-'}</td>
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
            </>
          )}
          {activeMenu === 'stats' && (
            <>
              <h2 style={{ marginBottom: 24 }}>Статистика заявок</h2>
              {statsLoading ? (
                <div>Загрузка...</div>
              ) : statsError ? (
                <div style={{ color: 'red' }}>{statsError}</div>
              ) : stats ? (
                <div style={{ maxWidth: 700 }}>
                  <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
                    <div style={{ background: '#e3f0ff', borderRadius: 12, padding: '24px 32px', minWidth: 160, textAlign: 'center' }}>
                      <div style={{ fontSize: 15, color: '#1976d2', marginBottom: 8 }}>Всего заявок</div>
                      <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total}</div>
                    </div>
                    <div style={{ background: '#f3f6fa', borderRadius: 12, padding: '24px 32px', minWidth: 220 }}>
                      <div style={{ fontSize: 15, color: '#1976d2', marginBottom: 8 }}>По статусам</div>
                      {Object.entries(stats.by_status).map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ width: 12, height: 12, borderRadius: 6, background: statusColors[status] || '#aaa', display: 'inline-block' }}></span>
                          <span style={{ fontSize: 15 }}>{status}:</span>
                          <span style={{ fontWeight: 600 }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '24px 32px', minWidth: 320 }}>
                    <div style={{ fontSize: 15, color: '#1976d2', marginBottom: 8 }}>Топ-5 специалистов по количеству заявок</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none' }}>
                      <thead>
                        <tr style={{ color: '#888', fontWeight: 500, fontSize: 15 }}>
                          <th style={{ textAlign: 'left', padding: '6px 0' }}>Имя</th>
                          <th style={{ textAlign: 'left', padding: '6px 0' }}>Заявок</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.by_specialist.length === 0 && (
                          <tr><td colSpan={2} style={{ color: '#aaa', padding: '8px 0' }}>Нет данных</td></tr>
                        )}
                        {stats.by_specialist.map(s => (
                          <tr key={s.id}>
                            <td style={{ padding: '6px 0' }}>{s.name}</td>
                            <td style={{ padding: '6px 0', fontWeight: 600 }}>{s.assigned_tickets_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </>
          )}
          {activeMenu === 'users' && (
            <>
              <h2 style={{ marginBottom: 24 }}>Управление пользователями</h2>
              {usersLoading ? (
                <div>Загрузка...</div>
              ) : usersError ? (
                <div style={{ color: 'red' }}>{usersError}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 700, background: '#fff' }}>
                    <thead>
                      <tr style={{ background: '#f3f6fa', fontWeight: 600 }}>
                        <th style={thStyle}>Имя</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Роли</th>
                        <th style={thStyle}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                          <td style={tdStyle}>{user.name}</td>
                          <td style={tdStyle}>{user.email}</td>
                          <td style={tdStyle}>
                            {roles.map(role => (
                              <label key={role.id} style={{ marginRight: 12, fontWeight: 400 }}>
                                <input
                                  type="checkbox"
                                  checked={editRoles[user.id]?.includes(role.name) || false}
                                  onChange={e => handleRoleChange(user.id, role.name, e.target.checked)}
                                  style={{ marginRight: 4 }}
                                />
                                {role.name}
                              </label>
                            ))}
                          </td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => handleSaveRoles(user.id)}
                              disabled={saveLoading[user.id]}
                              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', fontWeight: 500, cursor: 'pointer', marginRight: 8 }}
                            >
                              {saveLoading[user.id] ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={saveLoading[user.id]}
                              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #d32f2f', background: '#fff', color: '#d32f2f', fontWeight: 500, cursor: 'pointer' }}
                            >
                              Удалить
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
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
              <div style={{ marginBottom: 10 }}><b>Автор:</b> {selectedTicket.author?.name}</div>
              <div style={{ marginBottom: 10 }}><b>Исполнитель:</b> {selectedTicket.assigned_to?.name || '-'}</div>
              <div style={{ marginBottom: 10 }}><b>Дата создания:</b> {new Date(selectedTicket.created_at).toLocaleString()}</div>
              {selectedTicket.file && (
                <div style={{ marginBottom: 10 }}><b>Файл:</b> <a href={`http://127.0.0.1:8000/storage/${selectedTicket.file}`} target="_blank" rel="noopener noreferrer">Скачать</a></div>
              )}
            </div>
          </div>
        )}
      </div>
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

export default AdminPage; 