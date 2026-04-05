import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
            <button
              type="button"
              className="top-action-btn"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3c0.5 0 0.75 0.6 0.39 0.96A7 7 0 0 0 20.04 12.4c0.36-0.36 0.96-0.11 0.96 0.39Z"></path>
                </svg>
              )}
            </button>

            <button
              type="button"
              className="top-action-btn"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
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
