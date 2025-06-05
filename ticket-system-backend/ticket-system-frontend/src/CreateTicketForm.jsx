import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateTicketForm = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [statusId, setStatusId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    axios.get('http://127.0.0.1:8000/api/ticket-statuses', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStatuses(res.data));
    axios.get('http://127.0.0.1:8000/api/users?role=specialist', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSpecialists(res.data));
  }, []);

  useEffect(() => {
    if (statuses.length > 0 && !statusId) {
      setStatusId(statuses[0].id);
    }
  }, [statuses]);

  const today = new Date().toLocaleDateString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (file) formData.append('file', file);
    if (statusId) formData.append('status_id', statusId);
    if (assignedTo) formData.append('assigned_to', assignedTo);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/tickets', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      setSuccess('Заявка успешно создана!');
      setTitle('');
      setDescription('');
      setFile(null);
      if (onCreated) onCreated();
    } catch (err) {
      setError('Ошибка при создании заявки');
    }
  };

  const formContainerStyle = {
    maxWidth: 400,
    margin: '40px auto',
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px #e3eaf2',
    padding: '36px 32px 28px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  const labelStyle = {
    width: '100%',
    fontWeight: 500,
    marginBottom: 6,
    color: '#222',
  };
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
  const textareaStyle = {
    ...inputStyle,
    minHeight: 80,
    resize: 'vertical',
  };
  const fileInputStyle = {
    margin: '8px 0 18px 0',
    width: '100%',
  };
  const buttonStyle = {
    width: '100%',
    padding: '14px',
    background: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 600,
    fontSize: 18,
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

  return (
    <form onSubmit={handleSubmit} style={formContainerStyle}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18, color: '#263238', letterSpacing: 1 }}>Данные заявки:</h2>
      <label style={labelStyle}>
        Тема
        <input
          type="text"
          placeholder="Тема"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={inputStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Развернутое описание проблемы:
        <textarea
          placeholder="Описание"
          value={description}
          onChange={e => setDescription(e.target.value)}
          style={textareaStyle}
          required
        />
      </label>
      <label style={labelStyle}>
        Файл
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={fileInputStyle}
        />
      </label>
      <div style={{ width: '100%', display: 'flex', gap: 16, margin: '18px 0 0 0', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Дата обращения:</div>
          <div style={{ color: '#222', fontSize: 16 }}>{today}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Исполнитель:</div>
          <select
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            style={{ ...inputStyle, minWidth: 120 }}
          >
            <option value="">Выбрать исполнителя</option>
            {specialists.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ width: '100%', margin: '18px 0 0 0' }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>Статус:</div>
        <select
          value={statusId}
          onChange={e => setStatusId(e.target.value)}
          style={{ ...inputStyle, minWidth: 120 }}
        >
          {statuses.map(st => (
            <option key={st.id} value={st.id}>{st.name}</option>
          ))}
        </select>
      </div>
      {error && <div style={errorStyle}>{error}</div>}
      {success && <div style={successStyle}>{success}</div>}
      <button type="submit" style={{ ...buttonStyle, marginTop: 24 }}>Сохранить и выйти</button>
    </form>
  );
};

export default CreateTicketForm; 