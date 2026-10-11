import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowLeft, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export function EvidencePage({ selectedMission, setActivePage }) {
  const { user } = useAuth();
  const [activeMission, setActiveMission] = useState(selectedMission);
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [afterPhotoPreview, setAfterPhotoPreview] = useState(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [bagsCollected, setBagsCollected] = useState(1);
  const [estimatedWasteKg, setEstimatedWasteKg] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Fetch claimed missions for the current user if not provided
  useEffect(() => {
    async function fetchUserClaimed() {
      try {
        const all = await api.getMissions();
        const userMissions = all.filter(m => m.claimedBy === user?.id && (m.status === 'CLAIMED' || m.status === 'REJECTED'));
        setClaimedMissions(userMissions);
        if (!activeMission && userMissions.length > 0) {
          setActiveMission(userMissions[0]);
        }
      } catch (err) {
        console.error('Error fetching claimed missions:', err);
      }
    }
    fetchUserClaimed();
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file size exceeds 10MB limit.');
      return;
    }

    setAfterPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitEvidence = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!activeMission) {
      setErrorMsg('Please select an active claimed mission.');
      return;
    }

    if (!afterPhotoPreview) {
      setErrorMsg('Please upload photographic evidence of the cleaned area.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalAfterUrl = afterPhotoPreview;
      if (afterPhotoFile) {
        try {
          const uploadRes = await api.uploadImage(afterPhotoFile);
          finalAfterUrl = uploadRes.url;
        } catch (uploadErr) {
          console.warn('Backend image upload fallback to preview data:', uploadErr);
        }
      }

      const res = await api.submitEvidence(activeMission.id, {
        afterPhotoUrl: finalAfterUrl,
        notes: notes || 'Area thoroughly cleared and bagged.',
        bagsCollected: Number(bagsCollected),
        estimatedWasteKg: Number(estimatedWasteKg)
      });

      setSuccessResult(res);
    } catch (err) {
      setErrorMsg(err.message || 'Evidence submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '850px' }}>
      <button 
        onClick={() => setActivePage('missions')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={14} /> Back to Missions Explorer
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>
          Step 3: Signature Evidence Verification
        </span>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--color-forest-dark)', marginTop: '0.25rem' }}>
          Submit After-Cleanup Evidence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Provide clear visual proof that the reported hotspot has been cleaned. Submitting evidence enters the <strong>Pending Review</strong> status for administrative moderation.
        </p>
      </div>

      {successResult ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', background: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <CheckCircle2 size={36} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#065f46', marginBottom: '0.5rem' }}>
            Evidence Submitted for Verification!
          </h2>
          <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            ⏳ STATUS: PENDING ADMIN REVIEW (0 POINTS AWARDED YET)
          </div>
          <p style={{ color: '#047857', fontSize: '1rem', maxWidth: '580px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
            Your cleanup evidence for <strong>"{activeMission.title}"</strong> has been securely logged. An authorized administrator will inspect your before-and-after photo evidence. Once verified, <strong>{activeMission.rewardPoints} points</strong> will be credited to your verified profile.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button 
              onClick={() => setActivePage('missions')}
              className="btn btn-secondary"
            >
              Browse More Missions
            </button>
            <button 
              onClick={() => setActivePage('home')}
              className="btn btn-primary"
            >
              Back to Overview
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '2.25rem' }}>
          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', color: '#991b1b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mission Selector if multiple claimed */}
          {claimedMissions.length > 1 && (
            <div className="form-group">
              <label className="form-label">Select Claimed Mission</label>
              <select
                className="form-select"
                value={activeMission?.id}
                onChange={(e) => {
                  const m = claimedMissions.find(x => x.id === e.target.value);
                  setActiveMission(m);
                }}
              >
                {claimedMissions.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.rewardPoints} pts) - {m.location}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!activeMission ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No active claimed missions found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You must claim a mission from the Explorer before submitting evidence.
              </p>
              <button onClick={() => setActivePage('missions')} className="btn btn-primary">
                Explore Available Missions
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvidence}>
              {/* Previous Rejection Banner if applicable */}
              {activeMission.status === 'REJECTED' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                    ⚠️ Previous Submission Needs Revision:
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#7f1d1d' }}>
                    Reason: {activeMission.evidence?.rejectionReason || 'Please provide clearer evidence.'}
                  </div>
                </div>
              )}

              {/* Before Photo Display */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label className="form-label">1. Baseline Before Photo (From Initial Report)</label>
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '200px', background: '#e2ebe4', border: '2px solid #fca5a5' }}>
                  <img 
                    src={activeMission.beforePhotoUrl || 'data:image/svg+xml;utf8,<svg width="400" height="200"><rect fill="%23eee"/></svg>'} 
                    alt="Before condition"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-rose" style={{ position: 'absolute', top: 10, left: 10 }}>
                    HOTSPOT BASELINE
                  </span>
                </div>
              </div>

              {/* After Photo Upload with Instant Preview */}
              <div className="form-group">
                <label className="form-label">2. After-Cleanup Photographic Evidence *</label>
                <div style={{ border: '2px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-card-muted)' }}>
                  {afterPhotoPreview ? (
                    <div>
                      <img 
                        src={afterPhotoPreview} 
                        alt="After evidence preview" 
                        style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 'var(--radius-md)', margin: '0 auto 1rem auto', display: 'block', objectFit: 'cover' }}
                      />
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload size={14} /> Replace Photo
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Camera size={36} color="var(--color-leaf-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--color-forest)', marginBottom: '0.25rem' }}>
                        Upload Clear After-Cleanup Photo
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                        Capture the same viewpoint showing the litter collected into bags or containers.
                      </p>
                      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                        <Upload size={14} /> Select File
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantified Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Heavy-Duty Bags Collected</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    value={bagsCollected}
                    onChange={(e) => setBagsCollected(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Estimated Waste Diverted (kg)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    className="form-input"
                    value={estimatedWasteKg}
                    onChange={(e) => setEstimatedWasteKg(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Volunteer Notes */}
              <div className="form-group">
                <label className="form-label">Cleanup Description &amp; Disposal Notes</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Cleared 200m section of trail. Recycled all aluminum cans, bagged remaining plastic packaging, disposed at municipal waste transfer station."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Security Boundary Warning Box */}
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.75rem', fontSize: '0.82rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} />
                <span>
                  <strong>Anti-Cheat Security Policy:</strong> Evidence submission puts this mission into Pending Review. No reward points are issued until an authorized administrator verifies the submission.
                </span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
                disabled={isSubmitting}
              >
                <Upload size={18} />
                {isSubmitting ? 'Uploading & Submitting Evidence...' : 'Submit Evidence for Verification'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
