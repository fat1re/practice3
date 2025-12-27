import { useNavigate } from 'react-router-dom';
import '../styles/sidebar.css';
import type { User } from '../types';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const navigate = useNavigate();

  const roleLabels: any = {
    Customer: 'Заказчик',
    Operator: 'Оператор',
    Specialist: 'Специалист',
    Manager: 'Менеджер',
    QualityManager: 'Менеджер по качеству',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Repair System</h2>
      </div>

      <nav className="sidebar-nav">
        <button 
          className="nav-item"
          onClick={() => navigate('/')}
        >
          📋 Заявки
        </button>

        {['Customer', 'Operator'].includes(user?.role || '') && (
          <button 
            className="nav-item"
            onClick={() => navigate('/create-request')}
          >
            ➕ Новая заявка
          </button>
        )}

        {['Manager', 'Specialist', 'Operator'].includes(user?.role || '') && (
          <button 
            className="nav-item"
            onClick={() => navigate('/statistics')}
          >
            📊 Статистика
          </button>
        )}

        {['Manager', 'QualityManager'].includes(user?.role || '') && (
          <button 
            className="nav-item"
            onClick={() => navigate('/users')}
          >
            👥 Пользователи
          </button>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <p className="user-name">{user?.fio}</p>
          <p className="user-role">{roleLabels[user?.role || '']}</p>
        </div>
        <button 
          className="btn btn-logout"
          onClick={onLogout}
        >
          Выход
        </button>
      </div>
    </aside>
  );
}