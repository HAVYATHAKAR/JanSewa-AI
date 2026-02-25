import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <Link to="/" className="header-logo">
          <div className="logo-icon">🏛</div>
          JanSeva <span className="logo-ai">AI</span>
        </Link>
      </div>

      <div className="header-right">
        <button className="lang-selector">
          🌐 <span>English</span> ▾
        </button>

        <Link to="/notifications" className="header-icon-btn" aria-label="Notifications">
          🔔
          <span className="notif-dot"></span>
        </Link>

        <Link to="/profile" className="profile-btn">
          <div className="profile-avatar">U</div>
          <span>User</span>
        </Link>
      </div>
    </header>
  );
}
