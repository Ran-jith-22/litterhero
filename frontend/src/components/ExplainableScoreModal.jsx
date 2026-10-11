import React from 'react';
import { X, HelpCircle, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';

export function ExplainableScoreModal({ mission, onClose }) {
  if (!mission) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <div className="flex items-center gap-2">
            <BarChart3 size={20} color="var(--color-leaf-dark)" />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-forest-dark)' }}>Explainable Priority Score</h3>
          </div>
          <button onClick={onClose} style={{ padding: '0.3rem', borderRadius: '50%', background: '#f3f4f6' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ textAlign: 'center', padding: '1.25rem', background: 'var(--bg-card-muted)', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-forest)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {mission.priorityScore} <span style={{ fontSize: '1rem', color: 'var(--text-light)', fontWeight: 500 }}>/ 100</span>
          </div>
          <div style={{ marginTop: '0.3rem' }}>
            <span className={`badge badge-${mission.priorityScore >= 75 ? 'rose' : mission.priorityScore >= 50 ? 'amber' : 'blue'}`}>
              {mission.priorityBadge || (mission.priorityScore >= 75 ? 'Critical Priority' : mission.priorityScore >= 50 ? 'High Priority' : 'Standard Priority')}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
            {mission.priorityExplanation || 'Calculated using transparent environmental risk heuristics.'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-forest)', textTransform: 'uppercase' }}>
            Algorithm Breakdown:
          </div>

          <div style={{ padding: '0.75rem', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              <span>1. Hazard Severity Rating ({mission.severity.toUpperCase()})</span>
              <span style={{ color: 'var(--color-leaf-dark)' }}>Weighted factor: 40%</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Ecological hazard potential, physical obstruction, and safety risks.
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              <span>2. Waste Material Category ({mission.category.toUpperCase()})</span>
              <span style={{ color: 'var(--color-leaf-dark)' }}>Weighted factor: 30%</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Non-biodegradable plastics and chemical contaminants carry highest environmental persistence weights.
            </div>
          </div>

          <div style={{ padding: '0.75rem', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <div className="flex items-center justify-between" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
              <span>3. Hotspot Cluster Density &amp; Urgency</span>
              <span style={{ color: 'var(--color-leaf-dark)' }}>Weighted factor: 30%</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Proximity to waterways, public recreational parks, and community reports in the same zone.
            </div>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#166534', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <CheckCircle size={16} />
          <span><strong>Transparent Heuristic:</strong> This score is mathematically explainable and does not rely on opaque black-box machine learning.</span>
        </div>
      </div>
    </div>
  );
}
