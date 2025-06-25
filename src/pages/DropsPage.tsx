import { useState } from 'react';
import Navigation from '../components/Navigation';
import { Link } from 'react-router-dom';

const mockDrops = [
  {
    id: 'drop1',
    image: 'https://via.placeholder.com/300x200?text=Prize+1',
    title: 'Solana Hoodie',
    winners: ['alice', 'bob', 'carol'],
  },
  {
    id: 'drop2',
    image: 'https://via.placeholder.com/300x200?text=Prize+2',
    title: 'Limited Edition NFT',
    winners: ['dave', 'eve', 'frank'],
  },
  {
    id: 'drop3',
    image: 'https://via.placeholder.com/300x200?text=Prize+3',
    title: 'Token Airdrop',
    winners: ['grace', 'heidi', 'ivan'],
  },
];

const dropsItems = [
  ...mockDrops,
];

export default function DropsPage() {
  const [selectedDrop, setSelectedDrop] = useState<null | typeof mockDrops[0]>(null);

  return (
    <div className="main-container">
      <Navigation currentPage="drops" />
      <main className="page-content">
        <div className="content-wrapper">
          <h1 className="hero-title">Drop Gallery</h1>
          <p style={{ color: '#cbd5e1', marginBottom: 32 }}>View prizes from past drop events. Click 'Winners' to see who won each prize!</p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 28,
            justifyContent: 'center',
            alignItems: 'stretch',
            margin: '0 auto',
            width: '100%',
            maxWidth: 900,
          }}>
            {dropsItems.map((drop, idx) => drop ? (
              <div key={drop.id} style={{ background: 'linear-gradient(135deg, #23272f 0%, #18181b 100%)', borderRadius: 16, boxShadow: '0 4px 24px rgba(24,24,27,0.18)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 340, justifyContent: 'space-between', border: '1.5px solid #333', transition: 'box-shadow 0.2s', color: '#f4f4f5' }}>
                <img src={drop.image} alt={drop.title} style={{ width: '100%', borderRadius: 12, marginBottom: 18, objectFit: 'cover', height: 200, background: '#23272f', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }} />
                <h3 style={{ color: '#f4f4f5', marginBottom: 8, fontWeight: 700, fontSize: '1.18rem', textShadow: '0 2px 8px #18181b' }}>{drop.title}</h3>
                <button className="btn btn-secondary" style={{ fontSize: '0.98rem', padding: '8px 22px', background: 'rgba(36,37,46,0.7)', border: '1.5px solid #6366f1', color: '#c7d2fe', marginTop: 10, borderRadius: 8, fontWeight: 600 }} onClick={() => setSelectedDrop(drop)}>
                  Winners
                </button>
              </div>
            ) : (
              <div key={idx} style={{ background: 'linear-gradient(135deg, #23272f 0%, #18181b 100%)', borderRadius: 16, border: '1.5px dashed #444', minHeight: 340, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '1.1rem', fontWeight: 500 }}>
                <span style={{ fontSize: 48, marginBottom: 12 }}>🕳️</span>
                <span>No drop yet</span>
              </div>
            ))}
          </div>

          {/* Modal for winners */}
          {selectedDrop && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.85)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setSelectedDrop(null)}
            >
              <div
                style={{
                  background: 'linear-gradient(135deg, #18181b 0%, #23272f 100%)',
                  borderRadius: 20,
                  padding: 32,
                  minWidth: 0,
                  maxWidth: 400,
                  width: '95vw',
                  maxHeight: 500,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#f4f4f5',
                  border: '2px solid #6366f1',
                  overflow: 'hidden',
                }}
                onClick={e => e.stopPropagation()}
              >
                <h2 style={{ color: '#c7d2fe', marginBottom: 20, fontWeight: 700, fontSize: '1.35rem', letterSpacing: 0.5, textAlign: 'center' }}>🏆 Winners for {selectedDrop.title}</h2>
                <div style={{
                  width: '100%',
                  overflowY: 'auto',
                  maxHeight: 400,
                  background: 'rgba(36,37,46,0.7)',
                  borderRadius: 12,
                  boxShadow: '0 2px 12px rgba(36,37,46,0.18)',
                  marginBottom: 18,
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f4f4f5', fontSize: '0.98rem', tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '30%' }} />
                      <col style={{ width: '70%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: 'rgba(99,102,241,0.12)' }}>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#a5b4fc', fontSize: '1rem' }}>Rank</th>
                        <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: '#a5b4fc', fontSize: '1rem' }}>Username</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDrop.winners.map((winner, idx) => (
                        <tr key={winner} style={{ borderBottom: '1px solid rgba(99,102,241,0.18)', background: idx % 2 === 0 ? 'rgba(36,37,46,0.5)' : 'rgba(36,37,46,0.3)' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600, color: '#c7d2fe', textAlign: 'left', verticalAlign: 'middle' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'left', verticalAlign: 'middle', wordBreak: 'break-all' }}>
                            <Link
                              to={`/profile/${encodeURIComponent(winner)}`}
                              style={{ color: '#6366f1', textDecoration: 'underline', fontWeight: 600, fontSize: '0.98rem', cursor: 'pointer', display: 'inline-block', textAlign: 'left', verticalAlign: 'middle' }}
                              onClick={e => { e.stopPropagation(); }}
                            >
                              {winner}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{
                    marginTop: 0,
                    background: 'rgba(99,102,241,0.12)',
                    border: '1.5px solid #6366f1',
                    color: '#c7d2fe',
                    fontSize: '1rem',
                    padding: '8px 24px',
                    borderRadius: 10,
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                  }}
                  onClick={() => setSelectedDrop(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 