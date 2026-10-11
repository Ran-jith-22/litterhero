import React, { useState } from 'react';
import { X, ArrowRight, Eye, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export function PhotoCompareModal({ mission, onClose, onApprove, onReject, isAdmin }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'slider'
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mission) return null;

  const beforePhoto = mission.beforePhotoUrl || 'data:image/svg+xml;utf8,<svg width="400" height="300"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" text-anchor="middle">No Before Photo</text></svg>';
  const afterPhoto = mission.evidence?.afterPhotoUrl || 'data:image/svg+xml;utf8,<svg width="400" height="300"><rect width="100%" height="100%" fill="%23eee"/><text x="50%" y="50%" text-anchor="middle">No After Photo</text></svg>';

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(mission.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a specific rejection reason for the volunteer.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReject(mission.id, rejectionReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '950px', padding: '1.75rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge badge-emerald">{mission.category.toUpperCase()}</span>
              <span className={`badge badge-${mission.severity === 'critical' ? 'rose' : mission.severity === 'high' ? 'amber' : 'blue'}`}>
                {mission.severity.toUpperCase()} SEVERITY
              </span>
              <span className="badge badge-purple">⭐ {mission.rewardPoints} REWARD PTS</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', marginTop: '0.4rem' }}>{mission.title}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {mission.location}</p>
          </div>

          <button 
            onClick={onClose}
            style={{ padding: '0.4rem', borderRadius: '50%', background: '#f3f4f6', color: '#6b7280' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-forest)' }}>
            Signature Feature: Verified Before-and-After Inspection
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`btn btn-sm ${viewMode === 'side-by-side' ? 'btn-forest' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('slider')}
              className={`btn btn-sm ${viewMode === 'slider' ? 'btn-forest' : 'btn-secondary'}`}
              style={{ fontSize: '0.78rem' }}
            >
              <Layers size={13} /> Split Slider
            </button>
          </div>
        </div>

        {/* Image Comparison Area */}
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.25rem' }}>
            {/* Before */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid #fecaca', background: '#000' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                <span className="badge badge-rose" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                  1. BEFORE CLEANUP
                </span>
              </div>
              <img 
                src={beforePhoto} 
                alt="Before cleanup" 
                style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{ padding: '0.6rem 0.8rem', background: '#fff', fontSize: '0.78rem', color: '#4b5563' }}>
                Reported hotspot condition
              </div>
            </div>

            {/* After */}
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid #a7f3d0', background: '#000' }}>
              <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
                <span className="badge badge-emerald" style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                  2. AFTER CLEANUP EVIDENCE
                </span>
              </div>
              <img 
                src={afterPhoto} 
                alt="After cleanup" 
                style={{ width: '100%', height: '280px', objectFit: 'cover', display: 'block' }} 
              />
              <div style={{ padding: '0.6rem 0.8rem', background: '#fff', fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>
                Cleaned &amp; restored by {mission.claimedByName || 'Volunteer'}
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Slider */
          <div style={{ position: 'relative', width: '100%', height: '320px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.25rem', userSelect: 'none' }}>
            <img 
              src={afterPhoto} 
              alt="After" 
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${sliderPos}%`,
              height: '100%',
              overflow: 'hidden',
              borderRight: '3px solid #ffffff',
              boxShadow: '2px 0 10px rgba(0,0,0,0.4)'
            }}>
              <img 
                src={beforePhoto} 
                alt="Before" 
                style={{ position: 'absolute', top: 0, left: 0, width: '950px', height: '100%', objectFit: 'cover', maxWidth: 'none' }} 
              />
              <span className="badge badge-rose" style={{ position: 'absolute', top: 12, left: 12 }}>BEFORE</span>
            </div>
            <span className="badge badge-emerald" style={{ position: 'absolute', top: 12, right: 12 }}>AFTER</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderPos} 
              onChange={(e) => setSliderPos(e.target.value)}
              style={{
                position: 'absolute',
                bottom: 12,
                left: '10%',
                width: '80%',
                zIndex: 20,
                cursor: 'ew-resize'
              }}
            />
          </div>
        )}

        {/* Volunteer Notes & Impact Claim */}
        {mission.evidence && (
          <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Volunteer Submission Notes:
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
              "{mission.evidence.notes}"
            </p>
            <div className="flex items-center gap-4" style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>📦 Bags Collected: <strong>{mission.evidence.bagsCollected || 1}</strong></span>
              <span>⚖️ Estimated Waste: <strong>{mission.evidence.estimatedWasteKg || 10} kg</strong></span>
              <span>🕒 Submitted: <strong>{new Date(mission.evidence.submittedAt).toLocaleString()}</strong></span>
            </div>
          </div>
        )}

        {/* Admin Review Action Controls */}
        {isAdmin && mission.status === 'PENDING_REVIEW' && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            {!showRejectInput ? (
              <div className="flex items-center justify-between">
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Approve to atomically credit <strong>{mission.rewardPoints} points</strong> to {mission.claimedByName}.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="btn btn-secondary"
                    style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                    disabled={isSubmitting}
                  >
                    Reject with Reason
                  </button>
                  <button
                    onClick={handleApprove}
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    <CheckCircle2 size={17} />
                    {isSubmitting ? 'Verifying...' : 'Approve & Award Points'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fff1f2', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
                  Provide Rejection Reason (Required for volunteer notification)
                </div>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Evidence photo does not clearly show the area cleaned or litter is still present."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ marginBottom: '0.75rem', borderColor: '#fca5a5' }}
                />
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => setShowRejectInput(false)}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReject}
                    className="btn btn-danger btn-sm"
                    disabled={isSubmitting}
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Status Indicator */}
        {mission.status === 'APPROVED' && (
          <div style={{ background: '#ecfdf5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '0.88rem', fontWeight: 600 }}>
            ✅ Verified &amp; Approved by Administrator. Reward points have been safely disbursed.
          </div>
        )}

        {mission.status === 'REJECTED' && (
          <div style={{ background: '#fef2f2', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', color: '#991b1b', fontSize: '0.88rem' }}>
            ❌ <strong>Rejected:</strong> {mission.evidence?.rejectionReason || 'Did not meet cleanup verification standards.'}
          </div>
        )}
      </div>
    </div>
  );
}
