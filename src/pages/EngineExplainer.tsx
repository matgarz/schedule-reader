import React from 'react';

export default function EngineExplainer() {
  return (
    <div className="fade-in" style={{ paddingBottom: 100 }}>
      {/* Back button */}
      <div style={{ marginBottom: 40 }}>
        <a href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          RETURN TO DASHBOARD
        </a>
      </div>

      <div>
        <div style={{ marginBottom: 60 }}>
          <h1 className="serif-font" style={{ fontSize: 56, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text-primary)' }}>
            The Convergence Engine.
          </h1>
          <p className="serif-font" style={{ fontSize: 22, color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
            Our scheduling algorithm doesn't just look for empty slots. It inherently models cognitive load, temporal density, and individual peak focus hours to identify truly optimal meeting windows.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 32 }}>
          {/* Concept 1 */}
          <div className="card" style={{ padding: 48, background: 'linear-gradient(180deg, rgba(30,30,30,0.4) 0%, rgba(20,20,20,0.2) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: '#8A84FF', marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="serif-font" style={{ fontSize: 28, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)' }}>Cognitive Load Balancing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
              A standard week operates on ebbs and flows of energy. The engine reads metadata across schedules to prevent dense clusters of high-impact meetings. It protects your deep-work zones by naturally spacing out collaborative syncs, ensuring your network doesn't face decision fatigue.
            </p>
          </div>

          {/* Concept 2 */}
          <div className="card" style={{ padding: 48, background: 'linear-gradient(180deg, rgba(30,30,30,0.4) 0%, rgba(20,20,20,0.2) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: '#8A84FF', marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3 className="serif-font" style={{ fontSize: 28, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)' }}>Peak Focus Hour Detection</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
              Not all hours are equal. By analyzing patterns of event creation, duration, and response velocity across your synchronized calendars (Google, Outlook), the algorithm maps your individual chronological focus peaks. Meetings are actively routed away from these identified high-focus zones.
            </p>
          </div>

          {/* Concept 3 */}
          <div className="card" style={{ padding: 48, background: 'linear-gradient(180deg, rgba(30,30,30,0.4) 0%, rgba(20,20,20,0.2) 100%)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ color: '#8A84FF', marginBottom: 24 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            </div>
            <h3 className="serif-font" style={{ fontSize: 28, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)' }}>Macro-Scale Group Phasing</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
              When aligning dozens of participants, standard systems immediately devolve into mathematical compromises. Flux utilizes dimensional graph analysis to construct a holistic temporal map, locating convergence points that maximize collective energy without violating rigid individual parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
