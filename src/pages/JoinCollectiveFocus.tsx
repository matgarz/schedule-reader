import { useNavigate } from 'react-router-dom';
import GeometricBlurMesh from '../components/GeometricBlurMesh';

export default function JoinCollectiveFocus() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100dvh', background: '#000' }}>
      {/* Background WebGL Shader */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <GeometricBlurMesh />
      </div>
      
      {/* Back Button Overlay */}
      <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 20 }}>
        <button 
          onClick={() => navigate('/schedules')}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          ABORT SEQUENCE
        </button>
      </div>

      {/* Foreground Card */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10, width: '100%', maxWidth: 500 }}>
        <div style={{ background: 'rgba(10, 12, 16, 0.4)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 48, textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          <div style={{ color: '#8A84FF', marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          </div>
          <h2 className="serif-font" style={{ fontSize: 36, color: '#fff', marginBottom: 16 }}>Join Collective Focus</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            The engine is currently calculating optimal temporal intersections across all participant horizons. Awaiting your authorization cascade.
          </p>
          <button className="btn-primary" style={{ width: '100%', background: '#E0E0E0', color: '#111', fontWeight: 600, letterSpacing: '0.05em', padding: '16px 24px', borderRadius: 4, transition: 'all 0.3s ease', cursor: 'pointer' }} onClick={() => navigate('/')}>
            AUTHORIZE SYNC
          </button>
        </div>
      </div>
    </div>
  );
}
