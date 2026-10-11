import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  Layers,
  Sparkles,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoCompareModal } from '../components/PhotoCompareModal';

export function AdminDashboard({ setActivePage }) {
  const { user, isAdmin, refreshUser, switchDemoAccount } = useAuth();
  const [reviewsData, setReviewsData] = useState({ pending: [], history: [], pendingCount: 0 });
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history' | 'audit'
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const loadAdminData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [revs, logs] = await Promise.all([
        api.getAdminReviews(),
        api.getAuditLogs()
      ]);
      setReviewsData(revs);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin verification data:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Access denied by server authorization policy.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  const handleApprove = async (missionId) => {
    try {
      const res = await api.reviewEvidence(missionId, {
        decision: 'APPROVED',
        notes: 'Verified photographic evidence shows complete cleanup compliance.'
      });

      // Fire celebratory confetti for verified community impact
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#84cc16', '#059669', '#3b82f6']
        });
      } catch (_) {}

      setNotification({
        type: 'success',
        message: `Mission approved! ${res.mission.rewardPoints} points credited to volunteer ${res.mission.claimedByName}.`
      });

      await refreshUser();
      loadAdminData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Approval failed.'
      });
    }
  };

  const handleReject = async (missionId, reason) => {
    try {
      const res = await api.reviewEvidence(missionId, {
        decision: 'REJECTED',
        rejectionReason: reason
      });

      setNotification({
        type: 'success',
        message: `Evidence rejected. Feedback and rejection reason communicated to ${res.mission.claimedByName}.`
      });

      loadAdminData();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Rejection failed.'
      });
    }
  };

  // ==========================================
  // NON-ADMIN CITIZEN USER: STRICT 403 GUARD
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '720px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', background: '#fff5f5', border: '2px solid #fecaca' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Lock size={32} />
          </div>

          <h2 style={{ fontSize: '1.8rem', color: '#991b1b', marginBottom: '0.5rem' }}>
            403 Forbidden: Administrator Access Restricted
          </h2>

          <p style={{ color: '#7f1d1d', fontSize: '1rem', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto 1.75rem auto' }}>
            You are currently signed in as <strong>{user?.name || 'Citizen User'} ({user?.email})</strong> with role <code>{user?.role || 'USER'}</code>. 
            Ordinary users are strictly barred from approving evidence, awarding points, or accessing administrative moderation APIs.
          </p>

          <div style={{ background: '#ffffff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid #fed7d7', maxWidth: '500px', margin: '0 auto 2rem auto', textAlign: 'left', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} /> Server-Side Role Enforcement:
            </div>
            <p style={{ color: '#4b5563' }}>
              This protection is enforced by backend JWT claims. Changing URLs, DOM elements, or request bodies cannot bypass this boundary.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => setActivePage('home')}
              className="btn btn-secondary"
            >
              Return to Citizen Overview
            </button>

            <button 
              onClick={() => switchDemoAccount('ADMIN')}
              className="btn btn-primary"
              style={{ background: '#dc2626' }}
            >
              <UserCheck size={16} />
              Switch to Admin Demo Account (Marcus)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED ADMINISTRATOR VIEW
  // ==========================================
  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
            <ShieldCheck size={24} color="#dc2626" />
            <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest-dark)' }}>
              Administrator Verification Dashboard
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Signed in as <strong>{user.name}</strong> (Administrator). Authorize verified environmental impact and disburse points.
          </p>
        </div>

        <button 
          onClick={loadAdminData}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {notification && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          background: notification.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${notification.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: notification.type === 'success' ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} style={{ fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2" style={{ borderBottom: '2px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'pending' ? '#991b1b' : 'var(--text-muted)',
            borderBottom: activeTab === 'pending' ? '3px solid #dc2626' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Clock size={16} />
          Pending Verification
          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
            {reviewsData.pending.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'history' ? '#991b1b' : 'var(--text-muted)',
            borderBottom: activeTab === 'history' ? '3px solid #dc2626' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <CheckCircle2 size={16} />
          Verification History ({reviewsData.history.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'audit' ? '#991b1b' : 'var(--text-muted)',
            borderBottom: activeTab === 'audit' ? '3px solid #dc2626' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={16} />
          Moderation Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: PENDING VERIFICATION */}
      {activeTab === 'pending' && (
        <div>
          {reviewsData.pending.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
              <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', color: 'var(--color-forest-dark)', marginBottom: '0.4rem' }}>
                All cleanup evidence is verified!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                There are no pending submissions awaiting moderation.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {reviewsData.pending.map((mission) => (
                <div key={mission.id} className="card" style={{ border: '2px solid #fed7aa', display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-amber">PENDING VERIFICATION</span>
                      <span className="badge badge-purple">⭐ {mission.rewardPoints} PTS</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(mission.evidence?.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{mission.title}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    📍 {mission.location} • Submitted by: <strong>{mission.claimedByName}</strong>
                  </div>

                  {/* Before & After Thumbnail Comparison */}
                  <div className="grid grid-cols-2 gap-2" style={{ marginBottom: '1rem' }}>
                    <div style={{ height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', border: '1px solid #fecaca' }}>
                      <img src={mission.beforePhotoUrl} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="badge badge-rose" style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem' }}>BEFORE</span>
                    </div>
                    <div style={{ height: '120px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', border: '1px solid #a7f3d0' }}>
                      <img src={mission.evidence?.afterPhotoUrl} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="badge badge-emerald" style={{ position: 'absolute', bottom: 4, left: 4, fontSize: '0.65rem' }}>AFTER</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', background: 'var(--bg-card-muted)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', flex: 1 }}>
                    "{mission.evidence?.notes}"
                  </p>

                  <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      📦 {mission.evidence?.bagsCollected} bags • ⚖️ {mission.evidence?.estimatedWasteKg} kg
                    </div>

                    <button
                      onClick={() => setSelectedMission(mission)}
                      className="btn btn-primary btn-sm"
                      style={{ background: '#dc2626' }}
                    >
                      <Eye size={14} /> Inspect &amp; Verify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VERIFICATION HISTORY */}
      {activeTab === 'history' && (
        <div className="card" style={{ padding: '0' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Mission</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Volunteer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Reward</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Review Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewsData.history.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{m.title}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{m.claimedByName || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-${m.status === 'APPROVED' ? 'emerald' : 'rose'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--color-leaf-dark)' }}>
                      {m.status === 'APPROVED' ? `+${m.rewardPoints} pts` : '0 pts'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {m.status === 'APPROVED' 
                        ? 'Approved & Points Credited' 
                        : (m.evidence?.rejectionReason || 'Rejected')}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button 
                        onClick={() => setSelectedMission(m)} 
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-forest-dark)' }}>
            Tamper-Resistant Moderation Trail
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div key={log.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-card-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>
                    {log.action} • {log.actorName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#4b5563' }}>
                    {log.details}
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection & Review Modal */}
      {selectedMission && (
        <PhotoCompareModal 
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
