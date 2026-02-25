import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/jankhabar', icon: '🔎', label: 'JanKhabar' },
    { path: '/jansamasya', icon: '🛠', label: 'JanSamasya' },
    { path: '/track', icon: '📊', label: 'Track Complaints' },
];

const secondaryItems = [
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/notifications', icon: '🔔', label: 'Notifications' },
];

export default function Sidebar({ isOpen, onClose, onOpenAI }) {
    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Main Menu</div>
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

                    <div className="sidebar-section-label">Account</div>
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
                        Ask JanSeva AI
                    </button>
                </div>
            </aside>
        </>
    );
}
