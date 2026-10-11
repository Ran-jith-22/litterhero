import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MissionsPage } from './pages/MissionsPage';
import { ReportPage } from './pages/ReportPage';
import { EvidencePage } from './pages/EvidencePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LeaderboardPage } from './pages/LeaderboardPage';

function AppContent() {
  const [activePage, setActivePage] = useState('home');
  const [selectedMissionForEvidence, setSelectedMissionForEvidence] = useState(null);
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-warm)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-leaf)', margin: '0 auto 1rem auto', animation: 'spin 1.5s linear infinite' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest-dark)' }}>Initializing LitterHero Platform...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main style={{ flex: 1 }}>
        {activePage === 'home' && <HomePage setActivePage={setActivePage} />}
        {activePage === 'missions' && (
          <MissionsPage 
            setActivePage={setActivePage} 
            setSelectedMissionForEvidence={setSelectedMissionForEvidence} 
          />
        )}
        {activePage === 'report' && <ReportPage setActivePage={setActivePage} />}
        {activePage === 'evidence' && (
          <EvidencePage 
            selectedMission={selectedMissionForEvidence} 
            setActivePage={setActivePage} 
          />
        )}
        {activePage === 'admin' && <AdminDashboard setActivePage={setActivePage} />}
        {activePage === 'leaderboard' && <LeaderboardPage />}
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
