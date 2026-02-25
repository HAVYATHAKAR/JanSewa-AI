import { createContext, useContext, useState } from 'react';

const ComplaintContext = createContext();

const INITIAL_COMPLAINTS = [
    {
        id: 'CMP-2026-4567',
        title: 'Pothole on MG Road',
        category: 'Road & Infrastructure',
        icon: '🚧',
        date: 'Feb 23, 2026',
        status: 'progress',
        statusLabel: 'In Progress',
        location: 'MG Road, Sector 14, Delhi',
        authority: 'Municipal Corporation of Delhi',
        description: 'Large pothole causing accidents near the bus stop.',
        timeline: [
            { label: 'Complaint Filed', date: 'Feb 23, 2026 — 10:30 AM', done: true },
            { label: 'Under Review', date: 'Feb 23, 2026 — 2:15 PM', done: true },
            { label: 'Assigned to Authority', date: 'Feb 24, 2026 — 9:00 AM', current: true },
            { label: 'Work In Progress', date: 'Pending' },
            { label: 'Resolved', date: 'Pending' },
        ],
    },
    {
        id: 'CMP-2026-4523',
        title: 'Garbage Accumulation Near Park',
        category: 'Sanitation',
        icon: '🗑',
        date: 'Feb 20, 2026',
        status: 'resolved',
        statusLabel: 'Resolved',
        location: 'Central Park, Sector 8, Delhi',
        authority: 'NDMC Sanitation Dept.',
        description: 'Garbage piled up near the park entrance.',
        timeline: [
            { label: 'Complaint Filed', date: 'Feb 20, 2026 — 8:00 AM', done: true },
            { label: 'Under Review', date: 'Feb 20, 2026 — 11:30 AM', done: true },
            { label: 'Assigned to Authority', date: 'Feb 20, 2026 — 3:00 PM', done: true },
            { label: 'Work Completed', date: 'Feb 22, 2026 — 4:30 PM', done: true },
            { label: 'Resolved', date: 'Feb 22, 2026 — 5:00 PM', done: true },
        ],
    },
    {
        id: 'CMP-2026-4498',
        title: 'Streetlight Not Working',
        category: 'Electricity',
        icon: '💡',
        date: 'Feb 18, 2026',
        status: 'filed',
        statusLabel: 'Filed',
        location: 'Main Market Road, Sector 22',
        authority: 'Pending Assignment',
        description: 'Streetlight near the market has been off for a week.',
        timeline: [
            { label: 'Complaint Filed', date: 'Feb 18, 2026 — 7:00 PM', done: true },
            { label: 'Under Review', date: 'Pending' },
            { label: 'Assigned to Authority', date: 'Pending' },
            { label: 'Resolved', date: 'Pending' },
        ],
    },
    {
        id: 'CMP-2026-4412',
        title: 'Water Leakage from Pipeline',
        category: 'Water Supply',
        icon: '💧',
        date: 'Feb 15, 2026',
        status: 'resolved',
        statusLabel: 'Resolved',
        location: 'Block B, Sector 11, Delhi',
        authority: 'Delhi Jal Board',
        description: 'Major water leakage from the pipeline near Block B.',
        timeline: [
            { label: 'Complaint Filed', date: 'Feb 15, 2026 — 9:00 AM', done: true },
            { label: 'Under Review', date: 'Feb 15, 2026 — 12:00 PM', done: true },
            { label: 'Assigned to Authority', date: 'Feb 16, 2026 — 10:00 AM', done: true },
            { label: 'Work Completed', date: 'Feb 17, 2026 — 2:00 PM', done: true },
            { label: 'Resolved', date: 'Feb 17, 2026 — 4:00 PM', done: true },
        ],
    },
];

// Map category keywords to icons
const CATEGORY_ICONS = {
    'road': '🚧',
    'pothole': '🚧',
    'infrastructure': '🚧',
    'garbage': '🗑',
    'sanitation': '🗑',
    'waste': '🗑',
    'light': '💡',
    'electricity': '💡',
    'power': '💡',
    'water': '💧',
    'drainage': '💧',
    'sewage': '💧',
    'noise': '🔊',
    'pollution': '🏭',
    'traffic': '🚦',
    'parking': '🅿️',
    'encroachment': '🏗',
    'stray': '🐕',
    'animal': '🐕',
};

function getCategoryIcon(category) {
    const lower = (category || '').toLowerCase();
    for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return '📋';
}

export function ComplaintProvider({ children }) {
    const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);

    const addComplaint = ({ title, category, location, description, photo }) => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        const id = `CMP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const newComplaint = {
            id,
            title: title || `${category || 'Civic Issue'} Report`,
            category: category || 'General',
            icon: getCategoryIcon(category),
            date: dateStr,
            status: 'filed',
            statusLabel: 'Filed',
            location: location || 'Location not specified',
            authority: 'Pending Assignment',
            description: description || '',
            photo: photo || null,
            timeline: [
                { label: 'Complaint Filed', date: `${dateStr} — ${timeStr}`, done: true },
                { label: 'Under Review', date: 'Pending' },
                { label: 'Assigned to Authority', date: 'Pending' },
                { label: 'Work In Progress', date: 'Pending' },
                { label: 'Resolved', date: 'Pending' },
            ],
        };

        setComplaints(prev => [newComplaint, ...prev]);
        return newComplaint;
    };

    return (
        <ComplaintContext.Provider value={{ complaints, addComplaint }}>
            {children}
        </ComplaintContext.Provider>
    );
}

export function useComplaints() {
    const ctx = useContext(ComplaintContext);
    if (!ctx) throw new Error('useComplaints must be used within ComplaintProvider');
    return ctx;
}
