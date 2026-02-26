import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useComplaints } from '../context/ComplaintContext';
import { useLang } from '../context/LanguageContext';
import './JanSamasya.css';

const CATEGORIES = [
    { value: 'Road & Infrastructure', label: '🚧 Road & Infrastructure', keywords: ['pothole', 'road', 'broken', 'crack', 'bridge', 'footpath'] },
    { value: 'Sanitation', label: '🗑 Sanitation', keywords: ['garbage', 'waste', 'trash', 'dump', 'dirty', 'clean'] },
    { value: 'Water Supply', label: '💧 Water Supply', keywords: ['water', 'leak', 'pipe', 'supply', 'drain', 'flood'] },
    { value: 'Electricity', label: '💡 Electricity', keywords: ['light', 'electric', 'power', 'wire', 'pole', 'dark'] },
    { value: 'Traffic', label: '🚦 Traffic', keywords: ['traffic', 'signal', 'sign', 'parking', 'jam'] },
    { value: 'Pollution', label: '🏭 Pollution', keywords: ['pollution', 'smoke', 'noise', 'air', 'dust'] },
    { value: 'Encroachment', label: '🏗 Encroachment', keywords: ['encroach', 'illegal', 'construction', 'block'] },
    { value: 'Other', label: '📋 Other', keywords: [] },
];

function detectCategory(text) {
    const lower = (text || '').toLowerCase();
    for (const cat of CATEGORIES) {
        if (cat.keywords.some(k => lower.includes(k))) return cat.value;
    }
    return 'Road & Infrastructure';
}

export default function JanSamasya() {
    const { addComplaint } = useComplaints();
    const { t } = useLang();
    const [step, setStep] = useState(0);
    const [photo, setPhoto] = useState(null);
    const [description, setDescription] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submittedComplaint, setSubmittedComplaint] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('Road & Infrastructure');

    const steps = [
        { label: t('photo'), icon: '📷' },
        { label: t('location'), icon: '📍' },
        { label: t('describe'), icon: '✏️' },
        { label: t('aiReview'), icon: '🤖' },
        { label: t('confirm'), icon: '✅' },
    ];

    const [location, setLocation] = useState({
        lat: null,
        lng: null,
        address: '',
        loading: false,
        error: null,
        manualOverride: false,
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(URL.createObjectURL(file));
        }
    };

    const detectLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser' }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(prev => ({ ...prev, lat: latitude, lng: longitude }));

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                        {
                            headers: {
                                'Accept-Language': 'en',
                                'User-Agent': 'JanSevaAI/1.0',
                            },
                        }
                    );
                    const data = await response.json();

                    if (data && data.display_name) {
                        const addr = data.address || {};
                        const formattedAddress = [
                            addr.road || addr.pedestrian || addr.neighbourhood || '',
                            addr.suburb || addr.village || '',
                            addr.city || addr.town || addr.county || '',
                            addr.state || '',
                            addr.postcode || '',
                        ].filter(Boolean).join(', ');

                        setLocation(prev => ({
                            ...prev,
                            address: formattedAddress || data.display_name,
                            loading: false,
                        }));
                    } else {
                        setLocation(prev => ({
                            ...prev,
                            address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
                            loading: false,
                        }));
                    }
                } catch (err) {
                    console.error('Reverse geocoding failed:', err);
                    setLocation(prev => ({
                        ...prev,
                        address: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`,
                        loading: false,
                    }));
                }
            },
            (error) => {
                let errorMsg = 'Unable to detect location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = 'Location access denied. Please enable location permissions.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMsg = 'Location request timed out. Please try again.';
                        break;
                }
                setLocation(prev => ({ ...prev, loading: false, error: errorMsg }));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, []);

    useEffect(() => {
        if (step === 1 && !location.lat && !location.loading && !location.manualOverride) {
            detectLocation();
        }
    }, [step, location.lat, location.loading, location.manualOverride, detectLocation]);

    const handleManualAddress = (e) => {
        setLocation(prev => ({
            ...prev,
            address: e.target.value,
            manualOverride: true,
        }));
    };

    useEffect(() => {
        if (description.trim().length > 5) {
            setSelectedCategory(detectCategory(description));
        }
    }, [description]);

    const nextStep = () => {
        if (step === 4) {
            const result = addComplaint({
                title: description.substring(0, 60) || `${selectedCategory} Report`,
                category: selectedCategory,
                location: location.address || 'Location not specified',
                description: description || 'Civic issue reported via JanSamasya',
                photo: photo,
            });
            setSubmittedComplaint(result);
            setSubmitted(true);
        }
        setStep(prev => Math.min(prev + 1, 4));
    };

    const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

    const getMapUrl = () => {
        if (location.lat && location.lng) {
            return `https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.005},${location.lat - 0.003},${location.lng + 0.005},${location.lat + 0.003}&layer=mapnik&marker=${location.lat},${location.lng}`;
        }
        return null;
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div>
                        <h2>{t('captureIssue')}</h2>
                        <p className="step-desc">{t('captureDesc')}</p>
                        <label>
                            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                            <div className="photo-upload-area">
                                <div className="upload-icon">📸</div>
                                <h3>{t('clickUpload')}</h3>
                                <p>{t('uploadFormat')}</p>
                            </div>
                        </label>
                        {photo && (
                            <div className="photo-preview">
                                <img src={photo} alt="Issue preview" />
                            </div>
                        )}
                    </div>
                );
            case 1:
                return (
                    <div>
                        <h2>{t('pinLocation')}</h2>
                        <p className="step-desc">{t('pinDesc')}</p>

                        <div className="map-container" style={{ height: location.lat ? '300px' : undefined }}>
                            {location.loading ? (
                                <>
                                    <div className="map-pin" style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>📡</div>
                                    <div className="map-label">{t('detectLocation')}...</div>
                                </>
                            ) : location.lat ? (
                                <iframe
                                    src={getMapUrl()}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        borderRadius: 'var(--radius-lg)',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                    }}
                                    title="Location map"
                                    loading="lazy"
                                />
                            ) : (
                                <>
                                    <div className="map-pin">📍</div>
                                    <div className="map-label">
                                        {location.error || t('detectLocation')}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="location-info" style={{ marginTop: 'var(--space-4)' }}>
                            <span>📍</span>
                            {location.address ? (
                                <input
                                    type="text"
                                    value={location.address}
                                    onChange={handleManualAddress}
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: 'var(--fs-sm)',
                                        color: 'var(--text-primary)',
                                        padding: '0',
                                    }}
                                />
                            ) : (
                                <span style={{ flex: 1, fontSize: 'var(--fs-sm)', color: 'var(--text-tertiary)' }}>
                                    {t('enterManually')}
                                </span>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={detectLocation}
                                disabled={location.loading}
                                style={{ flex: 1 }}
                            >
                                {t('detectLocation')}
                            </button>
                            <button
                                className="btn btn-outline"
                                onClick={() => setLocation(prev => ({ ...prev, manualOverride: true, error: null }))}
                                style={{ flex: 1 }}
                            >
                                ✏️ {t('enterManually')}
                            </button>
                        </div>

                        {location.error && (
                            <div style={{
                                marginTop: 'var(--space-3)',
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--fs-sm)',
                                color: 'var(--accent-red)',
                            }}>
                                ⚠ {location.error}
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2>{t('describeIssue')}</h2>
                        <p className="step-desc">{t('describeDesc')}</p>
                        <textarea
                            className="complaint-textarea"
                            placeholder={t('complaintPlaceholder')}
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                );
            case 3:
                return (
                    <div>
                        <h2>{t('aiPreviewTitle')}</h2>
                        <div className="ai-preview">
                            <div className="ai-preview-header">
                                <span className="ai-badge">AI</span>
                                <h3>{t('aiPreviewTitle')}</h3>
                            </div>
                            <div className="ai-detected">
                                <h4>{t('detectedCategory')}</h4>
                                <div className="detected-value">
                                    {CATEGORIES.find(c => c.value === selectedCategory)?.label || selectedCategory}
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    style={{
                                        marginTop: 'var(--space-2)',
                                        padding: 'var(--space-2) var(--space-3)',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        fontSize: 'var(--fs-sm)',
                                        background: 'var(--bg-primary)',
                                    }}
                                >
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="ai-formal">
                                <h4>{t('formalDescription')}</h4>
                                <p>{description || `A civic issue has been identified at ${location.address || 'the reported location'}.`}</p>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                if (submitted && submittedComplaint) {
                    return (
                        <div className="confirmation-screen">
                            <div className="confirm-icon">✅</div>
                            <h2>{t('complaintSubmitted')}</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                {t('complaintSubmittedDesc')}
                            </p>
                            <div className="confirm-details">
                                <div className="detail-row">
                                    <span className="detail-label">{t('complaintId')}</span>
                                    <span className="detail-value">#{submittedComplaint.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('category')}</span>
                                    <span className="detail-value">{submittedComplaint.category}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('location')}</span>
                                    <span className="detail-value">{submittedComplaint.location}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">{t('status')}</span>
                                    <span className="detail-value">{t('filed')}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                                <Link to="/track" className="btn btn-primary">{t('goToTrack')}</Link>
                                <Link to="/jansamasya" className="btn btn-outline" onClick={() => { setStep(0); setSubmitted(false); setPhoto(null); setDescription(''); }}>{t('fileAnother')}</Link>
                            </div>
                        </div>
                    );
                }
                return (
                    <div>
                        <h2>✅ {t('confirm')}</h2>
                        <div className="confirm-details" style={{ width: '100%', display: 'flex' }}>
                            <div className="detail-row">
                                <span className="detail-label">{t('photo')}</span>
                                <span className="detail-value">{photo ? '✅' : '⚠'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t('location')}</span>
                                <span className="detail-value">{location.address || '⚠'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t('category')}</span>
                                <span className="detail-value">{selectedCategory}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">{t('description')}</span>
                                <span className="detail-value">{description.substring(0, 60) || '—'}{description.length > 60 ? '...' : ''}</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="jansamasya-page">
            <div className="jansamasya-header">
                <h1>🛠 {t('jansamasyaTitle')}</h1>
                <p>{t('jansamasyaDesc')}</p>
            </div>

            <div className="wizard-progress">
                {steps.map((s, i) => (
                    <div key={i} style={{ display: 'contents' }}>
                        <div className={`wizard-step-indicator ${i === step ? 'active' : ''} ${i < step || submitted ? 'completed' : ''}`}>
                            <div className="wizard-step-circle">
                                {i < step || submitted ? '✓' : s.icon}
                            </div>
                            <span className="wizard-step-label">{s.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`wizard-step-line ${i < step ? 'completed' : ''}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="card wizard-content">
                {renderStep()}

                {!submitted && (
                    <div className="wizard-nav">
                        <button className="btn btn-ghost" onClick={prevStep} disabled={step === 0}>
                            {t('previous')}
                        </button>
                        <button className="btn btn-primary" onClick={nextStep}>
                            {step === 4 ? t('submitComplaint') : t('continueBtn')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
