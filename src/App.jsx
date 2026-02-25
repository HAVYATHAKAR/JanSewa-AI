import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ComplaintProvider } from './context/ComplaintContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AIChat from './components/AIChat';
import Home from './pages/Home';
import JanKhabar from './pages/JanKhabar';
import SchemeDetail from './pages/SchemeDetail';
import JanSamasya from './pages/JanSamasya';
import TrackComplaints from './pages/TrackComplaints';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  return (
    <BrowserRouter>
      <ComplaintProvider>
        <div className="app-layout">
          <Header onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onOpenAI={() => setAiChatOpen(true)}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home onOpenAI={() => setAiChatOpen(true)} />} />
              <Route path="/jankhabar" element={<JanKhabar onOpenAI={() => setAiChatOpen(true)} />} />
              <Route path="/jankhabar/:id" element={<SchemeDetail onOpenAI={() => setAiChatOpen(true)} />} />
              <Route path="/jansamasya" element={<JanSamasya />} />
              <Route path="/track" element={<TrackComplaints />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </main>
          <AIChat isOpen={aiChatOpen} onClose={() => setAiChatOpen(false)} />
        </div>
      </ComplaintProvider>
    </BrowserRouter>
  );
}
