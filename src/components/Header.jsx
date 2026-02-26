import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { lang, toggleLang, t } = useLang();

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
        <button className="lang-selector" onClick={toggleLang}>
          🌐 <span>{t('langLabel')}</span> ▾
        </button>

        <Link to="/notifications" className="header-icon-btn" aria-label="Notifications">
          🔔
          <span className="notif-dot"></span>
        </Link>

        <Link to="/profile" className="profile-btn">
          <div className="profile-avatar">U</div>
          <span>{t('user')}</span>
        </Link>
      </div>
    </header>
  );
}
