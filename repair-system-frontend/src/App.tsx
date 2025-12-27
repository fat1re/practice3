import React, { useState, useEffect, Suspense } from 'react';
import QRCode from 'react-qr-code';
import './App.css';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'Admin' | 'QualityManager' | 'Master' | 'Client';
}

interface Request {
  id: string;
  clientId: string;
  title: string;
  description: string;
  deviceType: string;
  deviceModel: string;
  status: 'Новая' | 'В процессе' | 'Завершена' | 'Отклонена';
  priority: 'Низкий' | 'Средний' | 'Высокий';
  masterId?: string;
  createdAt: string;
  assignedAt?: string;
  updatedAt?: string;
}

interface Feedback {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'requests' | 'create' | 'feedback' | 'users' | 'profile' | 'admin-stats'>('dashboard');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Form states
  const [newUserForm, setNewUserForm] = useState({ name: '', phone: '', role: 'Client' as const });
  const [newRequestForm, setNewRequestForm] = useState({
    title: '',
    description: '',
    deviceType: '',
    deviceModel: '',
    priority: 'Средний' as const,
  });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });

  // Load from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    const savedRequests = localStorage.getItem('requests');
    const savedFeedback = localStorage.getItem('feedback');
    const savedCurrentUser = localStorage.getItem('currentUser');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedRequests) setRequests(JSON.parse(savedRequests));
    if (savedFeedback) setFeedback(JSON.parse(savedFeedback));
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('feedback', JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Permission checks
  const canChangeStatus = currentUser?.role === 'Admin' || currentUser?.role === 'QualityManager';
  const canAssignMaster = currentUser?.role === 'Admin' || currentUser?.role === 'QualityManager';
  const canDeleteUser = currentUser?.role === 'Admin';
  const canEditRequest = currentUser?.role === 'Client';
  const canDeleteRequest = currentUser?.role === 'Admin' || currentUser?.role === 'Client';
  const canLeaveFeedback = currentUser?.role === 'Client';
  const canViewStats = currentUser?.role === 'Admin' || currentUser?.role === 'QualityManager';

  const availableMasters = users.filter(u => u.role === 'Master');

  // Statistics functions
  const getStatistics = () => {
    return {
      total: requests.length,
      new: requests.filter(r => r.status === 'Новая').length,
      inProgress: requests.filter(r => r.status === 'В процессе').length,
      completed: requests.filter(r => r.status === 'Завершена').length,
      rejected: requests.filter(r => r.status === 'Отклонена').length,
      avgRating: feedback.length > 0 
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : '0',
    };
  };

  // Filtered requests for admin
  const getFilteredRequests = () => {
    let filtered = requests;

    if (statusFilter) {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    if (priorityFilter) {
      filtered = filtered.filter(r => r.priority === priorityFilter);
    }

    return filtered;
  };

  // Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.phone) {
      setError('Заполните все поля');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: newUserForm.name,
      phone: newUserForm.phone,
      role: newUserForm.role as any,
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setNewUserForm({ name: '', phone: '', role: 'Client' });
    setError('');
  };

  // Login
  const handleLogin = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      setError('');
    }
  };

  // Delete user
  const handleDeleteUser = (userId: string) => {
    if (!canDeleteUser) {
      setError('У вас нет прав на удаление пользователей');
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  };

  // Create request
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'Client') {
      setError('Только клиенты могут создавать заявки');
      return;
    }
    if (!newRequestForm.title || !newRequestForm.description || !newRequestForm.deviceType) {
      setError('Заполните все обязательные поля');
      return;
    }

    const newRequest: Request = {
      id: Date.now().toString(),
      clientId: currentUser.id,
      title: newRequestForm.title,
      description: newRequestForm.description,
      deviceType: newRequestForm.deviceType,
      deviceModel: newRequestForm.deviceModel,
      status: 'Новая',
      priority: newRequestForm.priority as any,
      createdAt: new Date().toLocaleString('ru-RU'),
    };

    setRequests([...requests, newRequest]);
    setNewRequestForm({
      title: '',
      description: '',
      deviceType: '',
      deviceModel: '',
      priority: 'Средний',
    });
    setError('');
    setCurrentPage('requests');
  };

  // Change request status
  const handleChangeStatus = (requestId: string, newStatus: Request['status']) => {
    if (!canChangeStatus) {
      setError('У вас нет прав на изменение статуса');
      return;
    }
    setRequests(requests.map(r =>
      r.id === requestId ? { ...r, status: newStatus, updatedAt: new Date().toLocaleString('ru-RU') } : r
    ));
    setShowStatusModal(false);
  };

  // Edit request
  const handleEditRequest = (e: React.FormEvent, requestId: string) => {
    e.preventDefault();
    if (!canEditRequest || !selectedRequest || selectedRequest.clientId !== currentUser?.id) {
      setError('Вы можете редактировать только свои заявки');
      return;
    }

    setRequests(requests.map(r =>
      r.id === requestId
        ? {
            ...r,
            title: selectedRequest.title,
            description: selectedRequest.description,
            deviceType: selectedRequest.deviceType,
            deviceModel: selectedRequest.deviceModel,
            priority: selectedRequest.priority,
            updatedAt: new Date().toLocaleString('ru-RU'),
          }
        : r
    ));
    setShowDetailModal(false);
    setError('');
  };

  // Delete request
  const handleDeleteRequest = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const isOwner = req.clientId === currentUser?.id;
    const isAdmin = currentUser?.role === 'Admin';

    if (!isOwner && !isAdmin) {
      setError('Вы не можете удалить эту заявку');
      return;
    }

    if (req.status !== 'Новая' && !isAdmin) {
      setError('Можно удалить только новые заявки');
      return;
    }

    setRequests(requests.filter(r => r.id !== requestId));
    setError('');
  };

  // Assign master
  const handleAssignMaster = (requestId: string, masterId: string) => {
    if (!canAssignMaster) {
      setError('У вас нет прав на назначение специалистов');
      return;
    }
    setRequests(requests.map(r =>
      r.id === requestId ? { ...r, masterId, assignedAt: new Date().toLocaleString('ru-RU') } : r
    ));
    setShowDetailModal(false);
    setError('');
  };

  // Leave feedback
  const handleLeaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canLeaveFeedback) {
      setError('Только клиенты могут оставлять отзывы');
      return;
    }
    if (!selectedRequest || feedbackForm.rating === 0) {
      setError('Выберите рейтинг');
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      requestId: selectedRequest.id,
      userId: currentUser!.id,
      userName: currentUser!.name,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      createdAt: new Date().toLocaleString('ru-RU'),
    };

    setFeedback([...feedback, newFeedback]);
    setFeedbackForm({ rating: 0, comment: '' });
    setShowDetailModal(false);
    setError('');
  };

  // Get user name
  const getUserName = (userId: string) => {
    return users.find(u => u.id === userId)?.name || 'Неизвестно';
  };

  // Get master name
  const getMasterName = (masterId: string | undefined) => {
    if (!masterId) return 'Не назначен';
    return users.find(u => u.id === masterId)?.name || 'Неизвестно';
  };

  // Get feedback for request
  const getRequestFeedback = (requestId: string) => {
    return feedback.filter(f => f.requestId === requestId);
  };

  // Get my requests (for clients)
  const getMyRequests = () => {
    if (currentUser?.role === 'Client') {
      return requests.filter(r => r.clientId === currentUser.id);
    }
    return requests;
  };

  // Get role label
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      Admin: '👨‍💼 Администратор',
      QualityManager: '📊 Менеджер качества',
      Master: '👨‍🔧 Специалист',
      Client: '👤 Клиент',
    };
    return labels[role] || role;
  };

  // Render based on login state
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="modal-content" style={{ maxWidth: '500px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>🔧 Система управления ремонтом</h2>

          {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>⚠️ {error}</div>}

          {users.length === 0 ? (
            <div>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>Первый пользователь (Регистрация)</h3>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Выберите роль</label>
                  <select
                    className="form-control"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  >
                    <option value="Admin">👨‍💼 Admin</option>
                    <option value="QualityManager">📊 QualityManager</option>
                    <option value="Master">👨‍🔧 Master</option>
                    <option value="Client">👤 Client</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ФИО</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Острый перец"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+7 (999) 999-99-99"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  ✅ Создать
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h3 style={{ color: '#333', marginBottom: '20px' }}>Вход в систему</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleLogin(user.id)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '12px 16px',
                      marginBottom: '8px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#764ba2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
                  >
                    {getRoleLabel(user.role)} • {user.name}
                  </button>
                ))}
              </div>

              <hr style={{ margin: '20px 0', borderColor: '#ddd' }} />

              <h4 style={{ color: '#333', marginBottom: '15px' }}>Новый пользователь</h4>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Роль</label>
                  <select
                    className="form-control"
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                  >
                    <option value="Admin">👨‍💼 Admin</option>
                    <option value="QualityManager">📊 QualityManager</option>
                    <option value="Master">👨‍🔧 Master</option>
                    <option value="Client">👤 Client</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>ФИО</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  ✅ Создать
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stats = getStatistics();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>🔧 Управление ремонтом</h1>
            <p style={{ margin: 0, opacity: 0.95, fontSize: '14px' }}>
              {getRoleLabel(currentUser.role)} • {currentUser.name} • {currentUser.phone}
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentUser(null);
              setError('');
              setStatusFilter('');
              setPriorityFilter('');
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.25)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          >
            🚪 Выход
          </button>
        </div>
      </header>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '12px 20px', borderBottom: '2px solid #c62828' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>⚠️ {error}</div>
        </div>
      )}

      <nav style={{ background: 'white', borderBottom: '2px solid #f0f0f0', padding: '0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0', overflowX: 'auto' }}>
          <button onClick={() => setCurrentPage('dashboard')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'dashboard' ? '#667eea' : 'transparent', color: currentPage === 'dashboard' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>📊 Главная</button>
          <button onClick={() => setCurrentPage('requests')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'requests' ? '#667eea' : 'transparent', color: currentPage === 'requests' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>📋 Заявки</button>
          {currentUser.role === 'Client' && <button onClick={() => setCurrentPage('create')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'create' ? '#667eea' : 'transparent', color: currentPage === 'create' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>➕ Новая заявка</button>}
          <button onClick={() => setCurrentPage('feedback')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'feedback' ? '#667eea' : 'transparent', color: currentPage === 'feedback' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>⭐ Отзывы ({feedback.length})</button>
          {canViewStats && <button onClick={() => setCurrentPage('admin-stats')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'admin-stats' ? '#667eea' : 'transparent', color: currentPage === 'admin-stats' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>📈 Статистика</button>}
          {canDeleteUser && <button onClick={() => setCurrentPage('users')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'users' ? '#667eea' : 'transparent', color: currentPage === 'users' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>👥 Пользователи ({users.length})</button>}
          <button onClick={() => setCurrentPage('profile')} style={{ padding: '16px 20px', border: 'none', background: currentPage === 'profile' ? '#667eea' : 'transparent', color: currentPage === 'profile' ? 'white' : '#333', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', whiteSpace: 'nowrap', marginLeft: 'auto' }}>👤 Профиль</button>
        </div>
      </nav>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
        {currentPage === 'dashboard' && (
          <div>
            <h2>📊 Главная</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#667eea', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Всего заявок</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '600', color: '#333' }}>{stats.total}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#667eea', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Новых</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '600', color: '#ff9800' }}>{stats.new}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#667eea', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>В процессе</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '600', color: '#2196f3' }}>{stats.inProgress}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#667eea', fontSize: '14px', fontWeight: '500', textTransform: 'uppercase' }}>Завершено</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: '600', color: '#4caf50' }}>{stats.completed}</p>
              </div>
            </div>
            <h3>📋 Последние заявки</h3>
            {requests.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>Нет заявок</p>
            ) : (
              <div className="requests-grid">
                {requests.slice(-6).reverse().map(req => (
                  <div key={req.id} className="request-item">
                    <h3>#{req.id.slice(0, 5)} - {req.title}</h3>
                    <p style={{ fontSize: '13px', color: '#666' }}>{req.deviceType}</p>
                    <div className="meta">
                      <span className="status">{req.status}</span>
                      <span className="priority">{req.priority}</span>
                    </div>
                    <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="btn-small">👁️ Просмотр</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'admin-stats' && canViewStats && (
          <div>
            <h2>📈 Статистика заявок</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', border: '1px solid #ffe0b2' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#e65100', fontSize: '14px', fontWeight: '500' }}>Новые</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#e65100' }}>{stats.new}</p>
              </div>
              <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1565c0', fontSize: '14px', fontWeight: '500' }}>В процессе</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#1565c0' }}>{stats.inProgress}</p>
              </div>
              <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32', fontSize: '14px', fontWeight: '500' }}>Завершено</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#2e7d32' }}>{stats.completed}</p>
              </div>
              <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', border: '1px solid #ffcdd2' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#c62828', fontSize: '14px', fontWeight: '500' }}>Отклонено</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#c62828' }}>{stats.rejected}</p>
              </div>
              <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', border: '1px solid #f8bbd0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#ad1457', fontSize: '14px', fontWeight: '500' }}>Средняя оценка</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#ad1457' }}>{stats.avgRating}⭐</p>
              </div>
              <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', border: '1px solid #e1bee7' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#6a1b9a', fontSize: '14px', fontWeight: '500' }}>Всего отзывов</h3>
                <p style={{ margin: 0, fontSize: '48px', fontWeight: '600', color: '#6a1b9a' }}>{feedback.length}</p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #eee', marginBottom: '30px' }}>
              <h3>🔍 Фильтры</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Статус</label>
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="">Все статусы</option>
                    <option value="Новая">Новая</option>
                    <option value="В процессе">В процессе</option>
                    <option value="Завершена">Завершена</option>
                    <option value="Отклонена">Отклонена</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>Приоритет</label>
                  <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  >
                    <option value="">Все приоритеты</option>
                    <option value="Низкий">Низкий</option>
                    <option value="Средний">Средний</option>
                    <option value="Высокий">Высокий</option>
                  </select>
                </div>
              </div>
            </div>

            <h3>📋 Заявки ({getFilteredRequests().length})</h3>
            {getFilteredRequests().length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>Нет заявок по выбранным фильтрам</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Название</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Клиент</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Мастер</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Статус</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Приоритет</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#333' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredRequests().map(req => (
                      <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', color: '#666' }}>#{req.id.slice(0, 5)}</td>
                        <td style={{ padding: '12px', color: '#333', fontWeight: '500' }}>{req.title}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{getUserName(req.clientId)}</td>
                        <td style={{ padding: '12px', color: '#666' }}>{getMasterName(req.masterId)}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            background: req.status === 'Новая' ? '#fff3e0' : req.status === 'В процессе' ? '#e3f2fd' : req.status === 'Завершена' ? '#e8f5e9' : '#ffebee',
                            color: req.status === 'Новая' ? '#e65100' : req.status === 'В процессе' ? '#1565c0' : req.status === 'Завершена' ? '#2e7d32' : '#c62828'
                          }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: '#666' }}>{req.priority}</td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => { setSelectedRequest(req); setShowDetailModal(true); }} className="btn-small">👁️ Просмотр</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {currentPage === 'create' && (
          <div>
            <h2>➕ Новая заявка</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #eee', maxWidth: '600px' }}>
              <form onSubmit={handleCreateRequest}>
                <div className="form-group">
                  <label>Название проблемы *</label>
                  <input type="text" className="form-control" placeholder="Например: Кондиционер не охлаждает" value={newRequestForm.title} onChange={(e) => setNewRequestForm({ ...newRequestForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Описание проблемы *</label>
                  <textarea className="form-control" placeholder="Подробно опишите проблему..." value={newRequestForm.description} onChange={(e) => setNewRequestForm({ ...newRequestForm, description: e.target.value })} rows={5} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Тип устройства *</label>
                    <select className="form-control" value={newRequestForm.deviceType} onChange={(e) => setNewRequestForm({ ...newRequestForm, deviceType: e.target.value })} required>
                      <option value="">Выберите тип</option>
                      <option>Кондиционер</option>
                      <option>Холодильник</option>
                      <option>Стиральная машина</option>
                      <option>Телевизор</option>
                      <option>Другое</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Модель</label>
                    <input type="text" className="form-control" placeholder="Например: Samsung LG-500" value={newRequestForm.deviceModel} onChange={(e) => setNewRequestForm({ ...newRequestForm, deviceModel: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Приоритет</label>
                  <select className="form-control" value={newRequestForm.priority} onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value as any })}>
                    <option>Низкий</option>
                    <option>Средний</option>
                    <option>Высокий</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setCurrentPage('requests')}>Отмена</button>
                  <button type="submit" className="btn-primary">✅ Создать заявку</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {currentPage === 'requests' && (
          <div>
            <h2>📋 Заявки ({getMyRequests().length})</h2>
            {getMyRequests().length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <p style={{ fontSize: '18px', marginBottom: '10px' }}>📭 Нет заявок</p>
                {currentUser.role === 'Client' && <button onClick={() => setCurrentPage('create')} className="btn-primary" style={{ marginTop: '20px' }}>➕ Создать первую заявку</button>}
              </div>
            ) : (
              <div className="requests-grid">
                {getMyRequests().map(request => (
                  <div key={request.id} className="request-item">
                    <h3>#{request.id.slice(0, 5)} - {request.title}</h3>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>{request.description.substring(0, 80)}...</p>
                    <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '12px' }}>
                      <p style={{ margin: '4px 0' }}>🔧 {request.deviceType}</p>
                      {request.deviceModel && <p style={{ margin: '4px 0' }}>📱 {request.deviceModel}</p>}
                    </div>
                    <div className="meta">
                      <span className="status">{request.status}</span>
                      <span className="priority">{request.priority}</span>
                    </div>
                    {request.masterId && <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px', padding: '8px', background: '#e8f5e9', borderRadius: '4px' }}>👨‍🔧 Мастер: {getMasterName(request.masterId)}</div>}
                    <p style={{ fontSize: '11px', color: '#999', margin: '8px 0' }}>Создана: {request.createdAt}</p>
                    <div className="actions">
                      <button onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }} className="btn-small">👁️ Просмотр</button>
                      {canChangeStatus && <button onClick={() => { setSelectedRequest(request); setShowStatusModal(true); }} className="btn-small">📊 Статус</button>}
                      {canAssignMaster && availableMasters.length > 0 && (
                        <select onChange={(e) => handleAssignMaster(request.id, e.target.value)} defaultValue="" style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>
                          <option value="">🔧 Назначить</option>
                          {availableMasters.map(master => (<option key={master.id} value={master.id}>{master.name}</option>))}
                        </select>
                      )}
                      {canEditRequest && request.clientId === currentUser?.id && request.status === 'Новая' && <button onClick={() => { setSelectedRequest(request); setShowDetailModal(true); }} className="btn-small">✏️ Редактировать</button>}
                      {canDeleteRequest && <button onClick={() => handleDeleteRequest(request.id)} className="btn-small danger">🗑️ Удалить</button>}
                      {request.status === 'Завершена' && canLeaveFeedback && <button onClick={() => { setSelectedRequest(request); setFeedbackForm({ rating: 0, comment: '' }); setShowDetailModal(true); }} className="btn-small">📝 Отзыв</button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentPage === 'feedback' && (
          <div>
            <h2>⭐ Отзывы ({feedback.length})</h2>
            {feedback.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                <p style={{ fontSize: '18px' }}>📭 Нет отзывов</p>
              </div>
            ) : (
              <div className="feedback-grid">
                {feedback.map(f => {
                  const req = requests.find(r => r.id === f.requestId);
                  return (
                    <div key={f.id} className="feedback-item">
                      <h4>👤 {f.userName}</h4>
                      <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>Заявка #{f.requestId.slice(0, 5)}: {req?.title}</p>
                      <div className="stars">
                        {Array.from({ length: 5 }).map((_, i) => (<span key={i} className={`star ${i < f.rating ? 'filled' : ''}`}>⭐</span>))}
                        <span className="rating-num">{f.rating}/5</span>
                      </div>
                      {f.comment && <p className="comment">"{f.comment}"</p>}
                      <small>{f.createdAt}</small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentPage === 'users' && canDeleteUser && (
          <div>
            <h2>👥 Пользователи ({users.length})</h2>
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <h3>{user.name}</h3>
                  <p className="role">{getRoleLabel(user.role)}</p>
                  <p>📱 {user.phone}</p>
                  {user.id !== currentUser.id && <button onClick={() => handleDeleteUser(user.id)} className="btn-small danger">🗑️ Удалить</button>}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'profile' && (
          <div>
            <h2>👤 Мой профиль</h2>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #eee', maxWidth: '600px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>ФИО</label>
                <p style={{ fontSize: '18px', margin: '0', fontWeight: '500', color: '#333' }}>{currentUser.name}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>Роль</label>
                <p style={{ fontSize: '16px', margin: '0', fontWeight: '500', color: '#667eea' }}>{getRoleLabel(currentUser.role)}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>Телефон</label>
                <p style={{ fontSize: '16px', margin: '0', color: '#333' }}>{currentUser.phone}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#999', marginBottom: '4px' }}>ID</label>
                <p style={{ fontSize: '14px', margin: '0', fontFamily: 'monospace', color: '#666' }}>{currentUser.id}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2>#{selectedRequest.id.slice(0, 5)} - {selectedRequest.title}</h2>
              <button onClick={() => setShowQRModal(!showQRModal)} style={{ padding: '8px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>📱 QR</button>
            </div>

            {showQRModal && (
              <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>⏳ Загрузка QR...</div>}>
                <div className="qr-code-container">
                  <QRCode value={JSON.stringify({ id: selectedRequest.id, title: selectedRequest.title, status: selectedRequest.status, master: getMasterName(selectedRequest.masterId) })} size={256} bgColor="#ffffff" fgColor="#000000" />
                  <p className="qr-hint">Отсканируйте QR для деталей заявки</p>
                </div>
              </Suspense>
            )}

            <div className="request-details">
              <div className="detail-group">
                <label>Описание</label>
                <p>{selectedRequest.description}</p>
              </div>
              <div className="detail-group">
                <label>Тип устройства</label>
                <p>{selectedRequest.deviceType}</p>
              </div>
              {selectedRequest.deviceModel && (
                <div className="detail-group">
                  <label>Модель</label>
                  <p>{selectedRequest.deviceModel}</p>
                </div>
              )}
              <div className="detail-group">
                <label>Статус</label>
                <p><span className="status-badge">{selectedRequest.status}</span></p>
              </div>
              <div className="detail-group">
                <label>Приоритет</label>
                <p>{selectedRequest.priority}</p>
              </div>
              <div className="detail-group">
                <label>Мастер</label>
                <p>{getMasterName(selectedRequest.masterId)}</p>
              </div>
              <div className="detail-group">
                <label>Дата создания</label>
                <p>{selectedRequest.createdAt}</p>
              </div>
              {selectedRequest.updatedAt && (
                <div className="detail-group">
                  <label>Последнее обновление</label>
                  <p>{selectedRequest.updatedAt}</p>
                </div>
              )}
            </div>

            {canEditRequest && selectedRequest.clientId === currentUser?.id && selectedRequest.status === 'Новая' && (
              <form onSubmit={(e) => handleEditRequest(e, selectedRequest.id)} style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                <h3>✏️ Редактировать заявку</h3>
                <div className="form-group">
                  <label>Название</label>
                  <input type="text" className="form-control" value={selectedRequest.title} onChange={(e) => setSelectedRequest({ ...selectedRequest, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Описание</label>
                  <textarea className="form-control" value={selectedRequest.description} onChange={(e) => setSelectedRequest({ ...selectedRequest, description: e.target.value })} rows={4} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Тип устройства</label>
                    <input type="text" className="form-control" value={selectedRequest.deviceType} onChange={(e) => setSelectedRequest({ ...selectedRequest, deviceType: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Модель</label>
                    <input type="text" className="form-control" value={selectedRequest.deviceModel} onChange={(e) => setSelectedRequest({ ...selectedRequest, deviceModel: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Приоритет</label>
                  <select className="form-control" value={selectedRequest.priority} onChange={(e) => setSelectedRequest({ ...selectedRequest, priority: e.target.value as any })}>
                    <option>Низкий</option>
                    <option>Средний</option>
                    <option>Высокий</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowDetailModal(false)}>Отмена</button>
                  <button type="submit" className="btn-primary">💾 Сохранить</button>
                </div>
              </form>
            )}

            {currentUser.role === 'Client' && selectedRequest.status === 'Завершена' && !getRequestFeedback(selectedRequest.id).some(f => f.userId === currentUser.id) && (
              <form onSubmit={handleLeaveFeedback} style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                <h3>⭐ Оставить отзыв</h3>
                <div className="form-group">
                  <label>Оценка</label>
                  <div className="stars-select">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" className={`star ${feedbackForm.rating >= star ? 'active' : ''}`} onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}>⭐</button>
                    ))}
                  </div>
                  <p className="rating-value">{feedbackForm.rating > 0 ? `${feedbackForm.rating} из 5` : 'Выберите оценку'}</p>
                </div>
                <div className="form-group">
                  <label>Комментарий</label>
                  <textarea className="form-control" placeholder="Ваши впечатления о работе..." value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} rows={4} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowDetailModal(false)}>Отмена</button>
                  <button type="submit" className="btn-primary">✅ Отправить отзыв</button>
                </div>
              </form>
            )}

            {getRequestFeedback(selectedRequest.id).length > 0 && (
              <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid #eee' }}>
                <h3>⭐ Отзывы</h3>
                {getRequestFeedback(selectedRequest.id).map(f => (
                  <div key={f.id} style={{ background: '#f9f9f9', padding: '15px', borderRadius: '6px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <strong>{f.userName}</strong>
                      <div>{Array.from({ length: 5 }).map((_, i) => (<span key={i} style={{ opacity: i < f.rating ? 1 : 0.3 }}>⭐</span>))}</div>
                    </div>
                    {f.comment && <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>"{f.comment}"</p>}
                    <small style={{ color: '#999' }}>{f.createdAt}</small>
                  </div>
                ))}
              </div>
            )}

            <div className="form-actions" style={{ marginTop: '30px' }}>
              <button onClick={() => setShowDetailModal(false)} className="btn-secondary">Закрыть</button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h2>📊 Изменить статус</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Заявка: <strong>#{selectedRequest.id.slice(0, 5)} - {selectedRequest.title}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Новая', 'В процессе', 'Завершена', 'Отклонена'].map(status => (
                <button key={status} onClick={() => handleChangeStatus(selectedRequest.id, status as any)} style={{ padding: '12px 16px', background: selectedRequest.status === status ? '#667eea' : '#f5f5f5', color: selectedRequest.status === status ? 'white' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left' }} onMouseEnter={(e) => { if (selectedRequest.status !== status) e.currentTarget.style.background = '#e0e0e0'; }} onMouseLeave={(e) => { if (selectedRequest.status !== status) e.currentTarget.style.background = '#f5f5f5'; }}>
                  {status === 'Новая' && '🆕'} {status === 'В процессе' && '▶️'} {status === 'Завершена' && '✅'} {status === 'Отклонена' && '❌'} {status}
                </button>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}