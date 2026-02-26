import { useState } from 'react';
import { useLang } from '../context/LanguageContext';
import './Profile.css';

export default function Profile() {
    const { t } = useLang();
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
                    <h1>{t('user')}</h1>
                    <p>📍 New Delhi, India • {t('memberSince')}</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button className={`profile-tab ${tab === 'personal' ? 'active' : ''}`} onClick={() => setTab('personal')}>
                    👤 {t('personalInfo')}
                </button>
                <button className={`profile-tab ${tab === 'preferences' ? 'active' : ''}`} onClick={() => setTab('preferences')}>
                    ⚙ {t('preferences')}
                </button>
                <button className={`profile-tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>
                    📋 {t('activity')}
                </button>
            </div>

            {tab === 'personal' && (
                <div className="card profile-section">
                    <h3>{t('personalInfoTitle')}</h3>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>{t('fullName')}</label>
                            <input type="text" defaultValue="User Name" />
                        </div>
                        <div className="form-group">
                            <label>{t('phoneNumber')}</label>
                            <input type="tel" defaultValue="+91 98765 43210" />
                        </div>
                        <div className="form-group">
                            <label>{t('email')}</label>
                            <input type="email" defaultValue="user@example.com" />
                        </div>
                        <div className="form-group">
                            <label>{t('locationLabel')}</label>
                            <input type="text" defaultValue="New Delhi, India" />
                        </div>
                        <div className="form-group">
                            <label>{t('dateOfBirth')}</label>
                            <input type="date" defaultValue="1995-06-15" />
                        </div>
                        <div className="form-group">
                            <label>{t('occupation')}</label>
                            <select defaultValue="student">
                                <option value="student">{t('student')}</option>
                                <option value="employed">{t('employed')}</option>
                                <option value="self-employed">{t('selfEmployed')}</option>
                                <option value="farmer">{t('farmer')}</option>
                                <option value="retired">{t('retired')}</option>
                                <option value="other">{t('other')}</option>
                            </select>
                        </div>
                    </div>
                    <div className="save-btn-row">
                        <button className="btn btn-primary">{t('saveChanges')}</button>
                    </div>
                </div>
            )}

            {tab === 'preferences' && (
                <>
                    <div className="card profile-section">
                        <h3>{t('langRegion')}</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>{t('language')}</label>
                                <select defaultValue="en">
                                    <option value="en">English</option>
                                    <option value="hi">हिन्दी</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('state')}</label>
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
                        <h3>{t('notifSettings')}</h3>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>{t('smsNotif')}</h4>
                                <p>{t('smsDesc')}</p>
                            </div>
                            <button className={`toggle-switch ${toggles.sms ? 'on' : ''}`} onClick={() => toggleSwitch('sms')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>{t('emailNotif')}</h4>
                                <p>{t('emailDesc')}</p>
                            </div>
                            <button className={`toggle-switch ${toggles.email ? 'on' : ''}`} onClick={() => toggleSwitch('email')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>{t('pushNotif')}</h4>
                                <p>{t('pushDesc')}</p>
                            </div>
                            <button className={`toggle-switch ${toggles.push ? 'on' : ''}`} onClick={() => toggleSwitch('push')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>{t('schemeAlerts')}</h4>
                                <p>{t('schemeAlertsDesc')}</p>
                            </div>
                            <button className={`toggle-switch ${toggles.schemeAlerts ? 'on' : ''}`} onClick={() => toggleSwitch('schemeAlerts')} />
                        </div>
                        <div className="toggle-group">
                            <div className="toggle-label">
                                <h4>{t('complaintUpdates')}</h4>
                                <p>{t('complaintUpdatesDesc')}</p>
                            </div>
                            <button className={`toggle-switch ${toggles.complaintUpdates ? 'on' : ''}`} onClick={() => toggleSwitch('complaintUpdates')} />
                        </div>
                    </div>
                </>
            )}

            {tab === 'activity' && (
                <div className="card profile-section">
                    <h3>{t('activityHistory')}</h3>
                    <div className="activity-list">
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>{t('savedPMKisanAct')}</h4>
                                <p>{t('hoursAgo')(2)}</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon complaint-act">🚧</div>
                            <div className="act-text">
                                <h4>{t('submittedComplaint')}</h4>
                                <p>{t('daysAgo')(1)} • {t('roadInfra')}</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>{t('viewedAtalAct')}</h4>
                                <p>{t('daysAgo')(3)}</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon complaint-act">🗑</div>
                            <div className="act-text">
                                <h4>{t('complaintResAct')}</h4>
                                <p>{t('daysAgo')(4)} • {t('sanitation')}</p>
                            </div>
                        </div>
                        <div className="activity-history-item">
                            <div className="act-icon scheme-act">📗</div>
                            <div className="act-text">
                                <h4>{t('appliedScholarship')}</h4>
                                <p>{t('weeksAgo')(1)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
