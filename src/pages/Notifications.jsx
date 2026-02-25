import './Notifications.css';

const notificationsData = {
    today: [
        {
            id: 1,
            type: 'complaint-notif',
            icon: '🚧',
            title: 'Complaint Status Updated',
            text: 'Your complaint #CMP-2026-4567 (Pothole on MG Road) has been assigned to Municipal Corporation of Delhi.',
            time: '2 hours ago',
            unread: true,
        },
        {
            id: 2,
            type: 'scheme-notif',
            icon: '📗',
            title: 'New Scheme Match Found',
            text: 'Based on your profile, you may be eligible for PM Vishwakarma Yojana. Check it out!',
            time: '5 hours ago',
            unread: true,
        },
    ],
    thisWeek: [
        {
            id: 3,
            type: 'deadline-notif',
            icon: '⏰',
            title: 'Deadline Approaching',
            text: 'National Merit Scholarship application deadline is February 28, 2026. Apply now!',
            time: '2 days ago',
            unread: false,
        },
        {
            id: 4,
            type: 'complaint-notif',
            icon: '✅',
            title: 'Complaint Resolved',
            text: 'Complaint #CMP-2026-4523 (Garbage Accumulation) has been resolved. Thank you for your report!',
            time: '3 days ago',
            unread: false,
        },
        {
            id: 5,
            type: 'announce-notif',
            icon: '📢',
            title: 'Platform Update',
            text: 'JanSeva AI now supports voice-based complaint descriptions. Try it out in JanSamasya!',
            time: '4 days ago',
            unread: false,
        },
    ],
    earlier: [
        {
            id: 6,
            type: 'scheme-notif',
            icon: '📗',
            title: 'Scheme Application Successful',
            text: 'Your application for Atal Pension Yojana has been submitted successfully. Track it on the official portal.',
            time: '1 week ago',
            unread: false,
        },
        {
            id: 7,
            type: 'announce-notif',
            icon: '🎉',
            title: 'Welcome to JanSeva AI!',
            text: 'Thank you for joining. Explore government schemes and report civic issues easily.',
            time: '2 weeks ago',
            unread: false,
        },
    ],
};

export default function Notifications() {
    return (
        <div className="notif-page">
            <div className="notif-header">
                <h1>🔔 Notifications</h1>
                <button className="notif-mark-all">Mark all as read</button>
            </div>

            {Object.entries(notificationsData).map(([group, items]) => (
                <div className="notif-group" key={group}>
                    <div className="notif-group-label">
                        {group === 'today' ? 'Today' : group === 'thisWeek' ? 'This Week' : 'Earlier'}
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
