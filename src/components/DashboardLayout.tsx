import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isRouteActive = (path: string) => {
    return location.pathname === path || (path === '/schedules' && location.pathname.startsWith('/g/'));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="layout-container">
      {/* Main Area */}
      <main className="main-area">
        {/* Top Navbar */}
        <header className="topbar">
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="serif-font" style={{ fontSize: 26, fontStyle: 'italic', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>Flux</span>
          </div>

          <div className="top-tabs">
            <NavLink to="/" className={`top-tab ${isRouteActive('/') ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/schedules" className={`top-tab ${isRouteActive('/schedules') ? 'active' : ''}`}>
              Schedules
            </NavLink>
            <NavLink to="/availability" className={`top-tab ${isRouteActive('/availability') ? 'active' : ''}`}>
              Availability
            </NavLink>
          </div>

          <div className="top-actions">
            <div 
               onClick={handleSignOut}
               title="Sign Out"
               style={{ 
                 cursor: 'pointer', background: 'transparent', border: '1px solid var(--border-light)', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', 
                 width: 36, height: 36, borderRadius: '50%', color: 'var(--text-secondary)',
                 transition: 'all 0.2s'
               }}
               onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-primary)' }}
               onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div 
          className={`page-container ${location.pathname.startsWith('/g/') ? 'gs-page-lock' : ''}`}
          style={{ 
            height: location.pathname.startsWith('/g/') ? 'calc(100vh - 72px)' : undefined,
            display: location.pathname.startsWith('/g/') ? 'flex' : 'block',
            flexDirection: 'column'
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}
