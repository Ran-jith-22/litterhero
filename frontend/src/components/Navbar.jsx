import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  MapPin, 
  PlusCircle, 
  Trophy, 
  CheckCircle2, 
  User, 
  LogOut, 
  Lock, 
  Sparkles,
  RefreshCw,
  Server
} from 'lucide-react';

export function Navbar({ activePage, setActivePage }) {
  const { user, isAdmin, logout, switchDemoAccount, systemStatus } = useAuth();
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
      {/* Role & Security Banner */}
      <div className={`role-banner ${isAdmin ? 'role-banner-admin' : 'role-banner-user'}`}>
        <div className="container flex items-center justify-between" style={{ width: '100%', fontSize: '0.82rem' }}>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <ShieldCheck size={16} color="#dc2626" />
                <span><strong>ADMINISTRATIVE PRIVILEGES ACTIVE</strong> — Verification Portal &amp; Reward Authorization unlocked</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} color="#059669" />
                <span><strong>CITIZEN VOLUNTEER MODE</strong> — Administrative endpoints strictly protected by server-side JWT</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span style={{ opacity: 0.85 }}>
              <Server size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Storage: <strong>{systemStatus?.aws?.configured ? 'AWS DynamoDB + S3' : 'Local Persistent Engine'}</strong>
            </span>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'white' }}
                title="Switch demo persona to test Citizen vs Admin security boundary"
              >
                <RefreshCw size={12} />
                Switch Persona
              </button>

              {showDemoMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  background: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-subtle)',
                  padding: '0.5rem',
                  minWidth: '240px',
                  zIndex: 200
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '0.3rem 0.5rem', fontWeight: 600, borderBottom: '1px solid #f3f4f6' }}>
                    TEST SERVER-SIDE ROLE ENFORCEMENT
                  </div>
                  <button
                    onClick={() => { switchDemoAccount('ADMIN'); setShowDemoMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', borderRadius: '4px' }}
                    className="demo-btn-hover"
                  >
                    <ShieldCheck size={16} color="#dc2626" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#991b1b' }}>Admin: Marcus Vance</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Chief Officer (Can approve &amp; reward)</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('SARAH'); setShowDemoMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', borderRadius: '4px' }}
                    className="demo-btn-hover"
                  >
                    <User size={16} color="#059669" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#065f46' }}>Citizen: Sarah Green</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Submitted Mill Creek Trail evidence</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { switchDemoAccount('DEMO'); setShowDemoMenu(false); }}
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', borderRadius: '4px' }}
                    className="demo-btn-hover"
                  >
                    <Sparkles size={16} color="#2563eb" />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1e40af' }}>Citizen: Jordan Lee</div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>Fresh volunteer account</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container flex items-center justify-between" style={{ height: '72px' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('home')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0f382a 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-forest-dark)', lineHeight: 1 }}>
              Litter<span style={{ color: 'var(--color-leaf)' }}>Hero</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Small Actions. Cleaner Communities.
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1" style={{ fontSize: '0.92rem', fontWeight: 600 }}>
          <button 
            onClick={() => setActivePage('home')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              color: activePage === 'home' ? 'var(--color-forest)' : 'var(--text-muted)',
              background: activePage === 'home' ? 'var(--bg-card-muted)' : 'transparent',
              fontWeight: activePage === 'home' ? 700 : 500
            }}
          >
            Overview
          </button>

          <button 
            onClick={() => setActivePage('missions')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              color: activePage === 'missions' ? 'var(--color-forest)' : 'var(--text-muted)',
              background: activePage === 'missions' ? 'var(--bg-card-muted)' : 'transparent',
              fontWeight: activePage === 'missions' ? 700 : 500
            }}
          >
            Explore Missions
          </button>

          <button 
            onClick={() => setActivePage('leaderboard')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              color: activePage === 'leaderboard' ? 'var(--color-forest)' : 'var(--text-muted)',
              background: activePage === 'leaderboard' ? 'var(--bg-card-muted)' : 'transparent',
              fontWeight: activePage === 'leaderboard' ? 700 : 500
            }}
          >
            Leaderboard
          </button>

          {/* Admin Tab */}
          <button 
            onClick={() => setActivePage('admin')}
            style={{
              padding: '0.5rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              color: activePage === 'admin' ? '#991b1b' : (isAdmin ? '#b91c1c' : 'var(--text-muted)'),
              background: activePage === 'admin' ? '#fee2e2' : 'transparent',
              fontWeight: activePage === 'admin' ? 700 : 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            {isAdmin ? <ShieldCheck size={16} color="#dc2626" /> : <Lock size={15} color="#9ca3af" />}
            Admin Verification
            {isAdmin && <span className="badge badge-rose" style={{ fontSize: '0.65rem' }}>Admin</span>}
          </button>
        </nav>

        {/* User Stats & Action CTAs */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActivePage('report')}
            className="btn btn-primary"
            style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}
          >
            <PlusCircle size={17} />
            Report Litter
          </button>

          {user && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 0.8rem',
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest-dark)', lineHeight: 1.1 }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-leaf-dark)', fontWeight: 700 }}>
                  ⭐ {user.points || 0} pts
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
