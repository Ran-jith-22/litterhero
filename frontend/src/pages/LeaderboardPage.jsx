import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Award, Sparkles, CheckCircle2, Shield, Star } from 'lucide-react';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await api.getLeaderboard();
        setLeaderboard(data);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getRankBadge = (index) => {
    if (index === 0) return <span style={{ fontSize: '1.4rem' }}>🥇</span>;
    if (index === 1) return <span style={{ fontSize: '1.4rem' }}>🥈</span>;
    if (index === 2) return <span style={{ fontSize: '1.4rem' }}>🥉</span>;
    return <span style={{ fontWeight: 800, color: 'var(--text-light)', fontSize: '1.1rem' }}>#{index + 1}</span>;
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '920px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#d97706', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Trophy size={16} /> Verified Civic Recognition
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--color-forest-dark)', marginTop: '0.25rem' }}>
          Community Impact Leaderboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Rankings are calculated strictly from verified, admin-approved cleanup missions. Points cannot be client-side modified or self-awarded.
        </p>
      </div>

      <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.75rem', fontSize: '0.85rem', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>
          🛡️ <strong>Tamper-Resistant Scoring:</strong> Points are disbursed exclusively through server-side verified transactions.
        </span>
        <span style={{ fontSize: '0.75rem', background: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
          DEMO DATA LABELED
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading verified rankings...
        </div>
      ) : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '1rem 1.25rem', width: '80px', textAlign: 'center' }}>Rank</th>
                <th style={{ padding: '1rem 1.25rem' }}>Volunteer Hero</th>
                <th style={{ padding: '1rem 1.25rem' }}>Verified Cleanups</th>
                <th style={{ padding: '1rem 1.25rem' }}>Earned Badges</th>
                <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Verified Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, index) => {
                const isCurrent = user && user.id === item.id;

                return (
                  <tr 
                    key={item.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isCurrent ? '#f0fdf4' : 'transparent',
                      fontWeight: isCurrent ? 700 : 500
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }}>
                      {getRankBadge(index)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700 }}>
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <div>{item.name} {isCurrent && <span style={{ color: 'var(--color-leaf-dark)', fontSize: '0.8rem' }}>(You)</span>}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-emerald">
                        {item.completedCleanups} Cleanups
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {item.badges.map((b, i) => (
                          <span key={i} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 800, color: 'var(--color-leaf-dark)', fontSize: '1.05rem' }}>
                      ⭐ {item.points} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
