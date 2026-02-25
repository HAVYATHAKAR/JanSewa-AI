import { useState } from 'react';
import './Profile.css';

export default function Profile() {
    const [tab, setTab] = useState('personal');
    const [toggles, setToggles] = useState({
        sms: true,
        email: true,
        push: false,
        schemeAlerts: true,
        complaintUpdates: true,
    });

    const toggleSwitch = (key) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="profile-avatar-large">U</div>
                <div className="profile-header-info">
                    <h1>User Name</h1>
                    <p>📍 New Delhi, India • Member since Jan 2026</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button className={`profile-tab ${tab === 'personal' ? 'active' : ''}`} onClick={() => setTab('personal')}>
                    👤 Personal Info
                </button>
                <button className={`profile-tab ${tab === 'preferences' ? 'active' : ''}`} onClick={() => setTab('preferences')}>
                    ⚙ Preferences
                </button>
                <button className={`profile-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
                    📋 Activity
                </button>
            </div>

            {tab === 'personal' && (
                <div className="card profile-section">
                    <h3>👤 Personal Information</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" defaultValue="User Name" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input type="tel" defaultValue="+91 98765 43210" />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" defaultValue="user@example.com" />
                        </div>
                        <div className="form-group">
                            <label>Location</label>
                            <input type="text" defaultValue="New Delhi, India" />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" defaultValue="1995-06-15" />
                        </div>
                        <div className="form-group">
                            <label>Occupation</label>
                            <select defaultValue="student">
                                <option value="student">Student</option>
                                <option value="employed">Employed</option>
                                <option value="self-employed">Self-Employed</option>
                                <option value="farmer">Farmer</option>
                                <option value="retired">Retired</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="save-btn-row">
                        <button className="btn btn-primary">Save Changes</button>
                    </div>
                </div>
            )}

            {tab === 'preferences' && (
                <>
                    <div className="card profile-section">
                        <h3>🌐 Language & Region</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Language</label>
                                <select defaultValue="en">
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी</option>
                                    <option value="ta">தமிழ்</option>
                                    <option value="te">తెలుగు</option>
                                    <option value="mr">मराठी</option>
                                    <option value="bn">বাংলা</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>State</label>
                                <select defaultValue="delhi">
                                    <option value="delhi">Delhi</option>
                                    <option value="maharashtra">Maharashtra</option>
                                    <option value="karnataka">Karnataka</option>
                                    <option value="tamilnadu">Tamil Nadu</option>
                                    <option value="up">Uttar Pradesh</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="card profile-section">
                        <h3>🔔 Notification Settings</h3>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>SMS Notifications</h4>
                                <p>Receive updates via SMS</p>
                            </div>
                            <button className={`toggle-switch ${toggles.sms ? 'on' : ''}`} onClick={() => toggleSwitch('sms')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>Email Notifications</h4>
                                <p>Receive updates via Email</p>
                            </div>
                            <button className={`toggle-switch ${toggles.email ? 'on' : ''}`} onClick={() => toggleSwitch('email')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>Push Notifications</h4>
                                <p>Browser push notifications</p>
                            </div>
                            <button className={`toggle-switch ${toggles.push ? 'on' : ''}`} onClick={() => toggleSwitch('push')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>Scheme Alerts</h4>
                                <p>Get notified about new matching schemes</p>
                            </div>
                            <button className={`toggle-switch ${toggles.schemeAlerts ? 'on' : ''}`} onClick={() => toggleSwitch('schemeAlerts')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>Complaint Updates</h4>
                                <p>Status changes on your complaints</p>
                            </div>
                            <button className={`toggle-switch ${toggles.complaintUpdates ? 'on' : ''}`} onClick={() => toggleSwitch('complaintUpdates')} />
                        </div>
                    </div>
                </>
            )}

            {tab === 'activity' && (
                <div className="card profile-section">
                    <h3>📋 Activity History</h3>
                    <div className="activity-list">
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>Saved PM Kisan Samman Nidhi</h4>
                                <p>2 hours ago</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon complaint-act">🚧</div>
                            <div className="act-text">
                                <h4>Submitted Complaint #CMP-2026-4567</h4>
                                <p>1 day ago • Road & Infrastructure</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>Viewed Atal Pension Yojana</h4>
                                <p>3 days ago</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon complaint-act">🗑</div>
                            <div className="act-text">
                                <h4>Complaint #CMP-2026-4523 Resolved</h4>
                                <p>4 days ago • Sanitation</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>Applied to National Scholarship Portal</h4>
                                <p>1 week ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
