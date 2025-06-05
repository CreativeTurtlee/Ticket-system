import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/tickets', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
      .then(res => setTickets(res.data))
      .catch(() => setError('Ошибка загрузки заявок'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ margin: 20 }}>
      <h2>Мои заявки</h2>
      <table border="1" cellPadding="8" style={{ margin: '0 auto' }}>
        <thead>
          <tr>
            <th>Тема</th>
            <th>Статус</th>
            <th>Автор</th>
            <th>Исполнитель</th>
            <th>Дата</th>
            <th>Файл</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.title}</td>
              <td>{ticket.status?.name}</td>
              <td>{ticket.author?.name}</td>
              <td>{ticket.assigned_to?.name || '-'}</td>
              <td>{new Date(ticket.created_at).toLocaleString()}</td>
              <td>
                {ticket.file
                  ? <a href={`http://127.0.0.1:8000/storage/${ticket.file}`} target="_blank" rel="noopener noreferrer">Файл</a>
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsList; 