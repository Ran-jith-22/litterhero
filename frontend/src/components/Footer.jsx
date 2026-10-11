import React from 'react';
import { ShieldCheck, Heart, Leaf, Cloud } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ background: 'var(--color-forest-dark)', color: '#d1fae5', padding: '3.5rem 0 2rem 0', marginTop: '4rem', borderTop: '4px solid var(--color-leaf)' }}>
      <div className="container">
        <div className="grid grid-cols-4 gap-8" style={{ marginBottom: '2.5rem' }}>
          {/* Brand Column */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--color-leaf)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={18} color="#09281e" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>LitterHero</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: '#a7f3d0', maxWidth: '420px', lineHeight: 1.6, marginBottom: '1rem' }}>
              Spot it. Report it. Clean it. Prove it. Turning community action into verifiable environmental impact.
            </p>
            <div style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 600 }}>
              Brand Slogan: <em>Small Actions. Cleaner Communities.</em>
            </div>
          </div>

          {/* Impact Workflow */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Verified Loop
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#a7f3d0' }}>
              <li>1. Report Hotspot</li>
              <li>2. Claim Cleanup Mission</li>
              <li>3. Submit Photo Evidence</li>
              <li>4. Admin Verification</li>
              <li>5. Verified Impact Points</li>
            </ul>
          </div>

          {/* Cloud Architecture */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AWS Architecture
            </h4>
            <div style={{ fontSize: '0.82rem', color: '#a7f3d0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div>📦 <strong>Amazon S3:</strong> Presigned photo storage</div>
              <div>⚡ <strong>Amazon DynamoDB:</strong> Idempotent data layer</div>
              <div>🔑 <strong>Amazon Cognito:</strong> JWT role authorization</div>
              <div>🚀 <strong>AWS Lambda:</strong> Serverless event API</div>
              <div>📊 <strong>CloudWatch:</strong> Audit &amp; error monitoring</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6ee7b7' }}>
          <div>
            © 2026 LitterHero — Waste &amp; Environment Hackathon Track. Built with precision and civic passion.
          </div>
          <div>
            Dual-Role Architecture • Server-Enforced Security
          </div>
        </div>
      </div>
    </footer>
  );
}
