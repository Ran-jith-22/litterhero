import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Award, 
  CheckCircle, 
  Clock, 
  Eye, 
  Sparkles, 
  Upload, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { PhotoCompareModal } from '../components/PhotoCompareModal';
import { ExplainableScoreModal } from '../components/ExplainableScoreModal';

export function MissionsPage({ setActivePage, setSelectedMissionForEvidence }) {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'ALL',
    category: 'ALL',
    severity: 'ALL',
    search: ''
  });

  const [inspectMission, setInspectMission] = useState(null);
  const [scoreModalMission, setScoreModalMission] = useState(null);
  const [claimingId, setClaimingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadMissions = async () => {
    setLoading(true);
    try {
      const data = await api.getMissions(filters);
      setMissions(data);
    } catch (err) {
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, [filters]);

  const handleClaim = async (mission) => {
    if (!user) {
      alert('Please log in or select a demo citizen persona to claim missions.');
      return;
    }

    setClaimingId(mission.id);
    try {
      const res = await api.claimMission(mission.id);
      setNotification({
        type: 'success',
        message: `Mission "${mission.title}" successfully claimed! You are now assigned to conduct this cleanup.`
      });
      loadMissions();
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to claim mission.'
      });
    } finally {
      setClaimingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-emerald">Available</span>;
      case 'CLAIMED':
        return <span className="badge badge-blue">Claimed (In Progress)</span>;
      case 'PENDING_REVIEW':
        return <span className="badge badge-amber">Pending Verification</span>;
      case 'APPROVED':
        return <span className="badge badge-purple">Verified &amp; Awarded</span>;
      case 'REJECTED':
        return <span className="badge badge-rose">Needs Revision</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest-dark)' }}>Cleanup Missions Explorer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Browse active hotspot missions, claim an area, clean it, and submit photographic evidence for verified rewards.
          </p>
        </div>

        <button 
          onClick={() => setActivePage('report')}
          className="btn btn-primary"
        >
          + Report New Hotspot
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

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div className="grid grid-cols-4 gap-4" style={{ alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-light)" style={{ position: 'absolute', left: 12, top: 13 }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search landmark, trail, area..." 
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{ paddingLeft: '2.3rem' }}
            />
          </div>

          {/* Status Filter */}
          <select 
            className="form-select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available to Claim</option>
            <option value="CLAIMED">Claimed / In Progress</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Verified Completed</option>
          </select>

          {/* Category Filter */}
          <select 
            className="form-select"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="ALL">All Categories</option>
            <option value="plastic">Plastic &amp; Synthetic</option>
            <option value="paper">Paper &amp; Cardboard</option>
            <option value="food">Food Waste</option>
            <option value="mixed">Mixed Waste</option>
            <option value="hazardous">Hazardous / Glass</option>
          </select>

          {/* Severity Filter */}
          <select 
            className="form-select"
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical Severity</option>
            <option value="high">High Severity</option>
            <option value="medium">Medium Severity</option>
            <option value="low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading missions data...
        </div>
      ) : missions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <AlertCircle size={36} color="var(--text-light)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>No missions match your filter criteria</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Try adjusting your search terms or status filters.
          </p>
          <button 
            onClick={() => setFilters({ status: 'ALL', category: 'ALL', severity: 'ALL', search: '' })}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {missions.map((mission) => {
            const isClaimedByMe = user && mission.claimedBy === user.id;

            return (
              <div key={mission.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Mission Header Image */}
                <div style={{ position: 'relative', height: '180px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: '#e2ebe4' }}>
                  <img 
                    src={mission.beforePhotoUrl || 'data:image/svg+xml;utf8,<svg width="400" height="200"><rect fill="%23eee"/></svg>'} 
                    alt={mission.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: '0.4rem' }}>
                    {getStatusBadge(mission.status)}
                  </div>

                  <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
                    <button 
                      onClick={() => setScoreModalMission(mission)}
                      className="badge badge-purple"
                      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.95)', border: '1px solid #c084fc', color: '#6b21a8' }}
                      title="Click to view explainable heuristic breakdown"
                    >
                      Priority: {mission.priorityScore}/100 ℹ️
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
                    <span className="badge badge-gray">{mission.category.toUpperCase()}</span>
                    <span className={`badge badge-${mission.severity === 'critical' ? 'rose' : mission.severity === 'high' ? 'amber' : 'blue'}`}>
                      {mission.severity.toUpperCase()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{mission.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flex: 1, lineHeight: 1.5 }}>
                    {mission.description}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="var(--color-leaf-dark)" />
                    {mission.location}
                  </div>

                  {/* Claim Status Info */}
                  {mission.claimedByName && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card-muted)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                      Claimed by: <strong>{mission.claimedByName}</strong> {isClaimedByMe && <span style={{ color: 'var(--color-leaf-dark)', fontWeight: 700 }}>(You)</span>}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-leaf-dark)' }}>
                      ⭐ {mission.rewardPoints} pts
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Evidence inspection if submitted or completed */}
                      {(mission.status === 'PENDING_REVIEW' || mission.status === 'APPROVED' || mission.status === 'REJECTED') && (
                        <button 
                          onClick={() => setInspectMission(mission)}
                          className="btn btn-secondary btn-sm"
                          title="Inspect before-and-after photographic evidence"
                        >
                          <Eye size={13} /> Evidence
                        </button>
                      )}

                      {/* Claim or Submit Evidence CTA */}
                      {mission.status === 'AVAILABLE' && (
                        <button 
                          onClick={() => handleClaim(mission)}
                          className="btn btn-primary btn-sm"
                          disabled={claimingId === mission.id}
                        >
                          {claimingId === mission.id ? 'Claiming...' : 'Claim Mission'}
                        </button>
                      )}

                      {mission.status === 'CLAIMED' && isClaimedByMe && (
                        <button 
                          onClick={() => {
                            setSelectedMissionForEvidence(mission);
                            setActivePage('evidence');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ background: '#2563eb' }}
                        >
                          <Upload size={13} /> Submit Proof
                        </button>
                      )}

                      {mission.status === 'CLAIMED' && !isClaimedByMe && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                          Claimed by another hero
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {inspectMission && (
        <PhotoCompareModal 
          mission={inspectMission}
          onClose={() => setInspectMission(null)}
          isAdmin={false}
        />
      )}

      {scoreModalMission && (
        <ExplainableScoreModal 
          mission={scoreModalMission}
          onClose={() => setScoreModalMission(null)}
        />
      )}
    </div>
  );
}
