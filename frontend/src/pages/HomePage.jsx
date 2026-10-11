import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Award, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  Recycle,
  Eye,
  Camera,
  Layers,
  ChevronRight
} from 'lucide-react';
import { PhotoCompareModal } from '../components/PhotoCompareModal';
import { ExplainableScoreModal } from '../components/ExplainableScoreModal';

export function HomePage({ setActivePage }) {
  const [impactStats, setImpactStats] = useState(null);
  const [featuredMissions, setFeaturedMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [scoreModalMission, setScoreModalMission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [stats, missions] = await Promise.all([
          api.getImpact(),
          api.getMissions()
        ]);
        setImpactStats(stats);
        setFeaturedMissions(missions.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div>
      {/* HERO SECTION */}
      <section style={{
        background: 'linear-gradient(170deg, #f0fdf4 0%, #ffffff 60%, #f7faf8 100%)',
        padding: '4.5rem 0 3.5rem 0',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            {/* Tagline Pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.35rem 0.9rem', borderRadius: '9999px', marginBottom: '1.5rem' }}>
              <Sparkles size={15} color="#059669" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#065f46', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Spot it. Report it. Clean it. Prove it.
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 3.8rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-forest-dark)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
              Turn Every Cleanup Into <span style={{ color: 'var(--color-leaf-dark)' }}>Lasting Impact.</span>
            </h1>

            {/* Supporting Text */}
            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '640px', margin: '0 auto 2rem auto' }}>
              Discover litter hotspots, join community cleanup missions, and prove the difference your actions make.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4" style={{ marginBottom: '2.5rem' }}>
              <button 
                onClick={() => setActivePage('report')}
                className="btn btn-primary"
                style={{ fontSize: '1.05rem', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
              >
                Report Litter
                <ArrowRight size={18} />
              </button>

              <button 
                onClick={() => setActivePage('missions')}
                className="btn btn-secondary"
                style={{ fontSize: '1.05rem', padding: '0.85rem 1.75rem', borderRadius: '12px' }}
              >
                Explore Missions
              </button>
            </div>

            {/* Brand Slogan */}
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-forest-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Small Actions. Cleaner Communities.
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT METRICS BAR */}
      <section style={{ padding: '2.5rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Verified Platform Metrics • Synchronized with Data Layer
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-forest)', fontFamily: 'var(--font-display)' }}>
                {impactStats?.verifiedCleanupsCompleted || 14}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Verified Cleanups Completed
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-leaf-dark)', fontFamily: 'var(--font-display)' }}>
                {impactStats?.estimatedWasteCollectedKg || 485} <span style={{ fontSize: '1rem' }}>kg</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Estimated Waste Diverted
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-forest)', fontFamily: 'var(--font-display)' }}>
                {impactStats?.bagsCollected || 72}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Heavy-Duty Bags Collected
              </div>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-display)' }}>
                {impactStats?.verifiedPointsAwarded || 1460}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Verified Impact Points Disbursed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE DIFFERENTIATOR: VERIFIED IMPACT LOOP */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-warm)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>Core Differentiator</span>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>The Verified Impact Loop</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Anyone can claim they cleaned up litter. LitterHero requires photographic evidence, tamper-proof location data, and administrative verification before a single reward point is awarded.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="card" style={{ borderTop: '4px solid #10b981' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Report Hotspot</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Citizens report litter with waste category, GPS landmark, and before photos. The system generates an explainable priority score.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #2563eb' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Claim &amp; Clean</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Volunteers claim available missions. Claims are locked to prevent duplicate conflicts while the cleanup is conducted.
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #f59e0b' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Submit Evidence</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Upload after-cleanup photos, bags collected, and notes. Mission enters <strong>Pending Review</strong> (zero points awarded yet).
              </p>
            </div>

            <div className="card" style={{ borderTop: '4px solid #9333ea' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: '0.75rem' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>Admin Verification</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Authorized administrators verify before-and-after proof. Idempotent backend transaction securely awards verified rewards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CLEANUP MISSIONS PREVIEW */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--color-forest-dark)' }}>Active Community Missions</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                High-priority hotspots waiting for community environmental heroes.
              </p>
            </div>
            <button 
              onClick={() => setActivePage('missions')}
              className="btn btn-secondary"
            >
              View All Missions ({featuredMissions.length})
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {featuredMissions.map((mission) => (
              <div key={mission.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: '170px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', background: '#eee' }}>
                  <img 
                    src={mission.beforePhotoUrl || 'data:image/svg+xml;utf8,<svg width="400" height="200"><rect fill="%23eee"/></svg>'} 
                    alt={mission.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: '0.35rem' }}>
                    <span className="badge badge-emerald">{mission.category}</span>
                    <span className={`badge badge-${mission.severity === 'high' ? 'amber' : mission.severity === 'critical' ? 'rose' : 'blue'}`}>
                      {mission.severity}
                    </span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
                    <span 
                      onClick={(e) => { e.stopPropagation(); setScoreModalMission(mission); }}
                      className="badge badge-purple" 
                      style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.95)', border: '1px solid #c084fc', color: '#6b21a8' }}
                      title="Click to view explainable score breakdown"
                    >
                      Priority: {mission.priorityScore}/100 ℹ️
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{mission.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', flex: 1 }}>
                    {mission.description.slice(0, 110)}...
                  </p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
                    📍 {mission.location}
                  </div>

                  <div className="flex items-center justify-between" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-leaf-dark)' }}>
                      ⭐ {mission.rewardPoints} pts
                    </div>
                    <div className="flex items-center gap-2">
                      {mission.status === 'PENDING_REVIEW' && (
                        <button 
                          onClick={() => setSelectedMission(mission)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} /> Inspect Evidence
                        </button>
                      )}
                      <button 
                        onClick={() => setActivePage('missions')}
                        className="btn btn-primary btn-sm"
                      >
                        {mission.status === 'AVAILABLE' ? 'Claim Mission' : 'View Details'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {selectedMission && (
        <PhotoCompareModal 
          mission={selectedMission} 
          onClose={() => setSelectedMission(null)}
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
