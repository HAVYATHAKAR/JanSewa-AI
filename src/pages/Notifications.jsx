import { useLang } from '../context/LanguageContext';
import './Notifications.css';

export default function Notifications() {
    const { t } = useLang();

    const notificationsData = {
        today: [
            {
                id: 1,
                type: 'complaint-notif',
                icon: '🚧',
                title: t('complaintStatusUpdated'),
                text: t('notifComplaintText'),
                time: t('hoursAgo')(2),
                unread: true,
            },
            {
                id: 2,
                type: 'scheme-notif',
                icon: '📗',
                title: t('newSchemeMatch'),
                text: t('notifSchemeText'),
                time: t('hoursAgo')(5),
                unread: true,
            },
        ],
        thisWeek: [
            {
                id: 3,
                type: 'deadline-notif',
                icon: '⏰',
                title: t('deadlineApproaching'),
                text: t('notifDeadlineText'),
                time: t('daysAgo')(2),
                unread: false,
            },
            {
                id: 4,
                type: 'complaint-notif',
                icon: '✅',
                title: t('complaintResolved'),
                text: t('notifResolvedText'),
                time: t('daysAgo')(3),
                unread: false,
            },
            {
                id: 5,
                type: 'announce-notif',
                icon: '📢',
                title: t('platformUpdate'),
                text: t('notifPlatformText'),
                time: t('daysAgo')(4),
                unread: false,
            },
        ],
        earlier: [
            {
                id: 6,
                type: 'scheme-notif',
                icon: '📗',
                title: t('schemeAppSuccess'),
                text: t('notifSchemeAppText'),
                time: t('weeksAgo')(1),
                unread: false,
            },
            {
                id: 7,
                type: 'announce-notif',
                icon: '🎉',
                title: t('welcomeJanSeva'),
                text: t('notifWelcomeText'),
                time: t('weeksAgo')(2),
                unread: false,
            },
        ],
    };

    const groupLabels = {
        today: t('today'),
        thisWeek: t('thisWeek'),
        earlier: t('earlier'),
    };

    return (
        <div className="notif-page">
            <div className="notif-header">
                <h1>{t('notifTitle')}</h1>
                <button className="notif-mark-all">{t('markAllRead')}</button>
            </div>

            {Object.entries(notificationsData).map(([group, items]) => (
                <div className="notif-group" key={group}>
                    <div className="notif-group-label">
                        {groupLabels[group]}
                    </div>
                    <div className="notif-list">
                        {items.map(notif => (
                            <div key={notif.id} className={`card notif-item ${notif.unread ? 'unread' : ''}`}>
                                <div className={`notif-icon ${notif.type}`}>{notif.icon}</div>
                                <div className="notif-content">
                                    <h4>{notif.title}</h4>
                                    <p>{notif.text}</p>
                                </div>
                                <span className="notif-time">{notif.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
