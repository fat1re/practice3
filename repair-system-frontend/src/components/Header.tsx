import type { User } from '../types';
import '../styles/header.css';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1>Система учета заявок на ремонт</h1>
        <div className="header-user">
          <span>{user?.fio}</span>
        </div>
      </div>
    </header>
  );
}