import { NavLink } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose, onOpenAI }) {
    const { t } = useLang();

    const navItems = [
        { path: '/', icon: '🏠', label: t('home') },
        { path: '/jankhabar', icon: '🔎', label: t('jankhabar') },
        { path: '/jansamasya', icon: '🛠', label: t('jansamasya') },
        { path: '/track', icon: '📊', label: t('trackComplaints') },
    ];

    const secondaryItems = [
        { path: '/profile', icon: '👤', label: t('profile') },
        { path: '/notifications', icon: '🔔', label: t('notifications') },
    ];

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">{t('mainMenu')}</div>
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="sidebar-section-label">{t('account')}</div>
                    {secondaryItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-ai-btn" onClick={() => { onOpenAI(); onClose(); }}>
                        <span className="nav-icon">🤖</span>
                        {t('askAI')}
                    </button>
                </div>
            </aside>
        </>
    );
}
