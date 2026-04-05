import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function AuthPage() {
   const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
       if (data.session) navigate('/'); 
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError = null;

    if (isLogin) {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = err;
      
      if (!err && data.session) {
         navigate('/');
         return;
      }
    } else {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      authError = err;
      
      if (!err && data.user) {
        if (!data.session) {
          setError("Registration successful! Please check your email for a confirmation link to log in.");
        } else {
          navigate('/');
          return;
        }
      }
    }

    if (authError) {
      console.error("Auth Error:", authError);
      setError(authError.message);
    }
    setLoading(false);
  };

  return (
   <div className="auth-layout" style={{ display: 'flex', minHeight: '100dvh', width: '100%', background: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
         <button
            type="button"
            className="top-action-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ position: 'fixed', top: 24, right: 24, zIndex: 200 }}
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
      
      {/* Left Massive Typography Region */}
      <div className="auth-hero" style={{ flex: 1, padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
         <div>
            <div className="serif-font" style={{ fontSize: 42, letterSpacing: '-0.01em', lineHeight: 1 }}>Flux</div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 12, color: 'var(--text-tertiary)' }}>A Next-Gen Scheduling Company</div>
         </div>

         <div className="serif-font" style={{ fontWeight: 500, fontSize: 'clamp(60px, 9.5vw, 160px)', lineHeight: 0.85, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginTop: 'auto', marginBottom: 20 }}>
            <div>WE</div>
            <div>CREATE</div>
            <div style={{ color: 'var(--primary)' }}>
              HAR<span style={{ fontSize: '0.9em' }}>♥</span>ONIOUS
            </div>
            <div>W<span style={{ fontSize: '0.9em', color: 'var(--text-primary)' }}>✻</span>RKFLOWS</div>
            <div>FOR TE<span style={{ fontSize: '0.9em', color: 'var(--text-primary)' }}>✦</span>MS.</div>
         </div>
      </div>

      {/* Right Auth Form Region */}
      <div className="auth-form-container" style={{ 
        width: '420px', 
        padding: '48px', 
        display: 'flex', 
        flexDirection: 'column', 
            background: 'var(--auth-pane-bg)', 
            borderLeft: '1px solid var(--auth-pane-border)', 
            boxShadow: 'var(--auth-pane-shadow)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        zIndex: 10
      }}>
         <div className="auth-header-links" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 'auto', color: 'var(--text-tertiary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>WORK</span>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>COMPANY</span>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>CAPABILITIES</span>
            </div>
            <div>INFO@FLUX.COM</div>
         </div>

         <div className="fade-in" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <h2 className="serif-font" style={{ fontSize: 32, marginBottom: 12 }}>
               {isLogin ? 'Welcome back.' : 'Join the Collective.'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.6 }}>
               {isLogin ? 'Enter your credentials to access your dashboard.' : 'Configure your rhythmic boundaries seamlessly.'}
            </p>

            {error && (
               <div style={{ background: 'rgba(255, 71, 71, 0.1)', border: '1px solid rgba(255, 71, 71, 0.3)', color: '#FF7070', padding: '14px 18px', borderRadius: 4, fontSize: 13, marginBottom: 32 }}>
                {error}
               </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
               {!isLogin && (
                 <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full Name</label>
                    <input 
                       type="text" 
                       placeholder="Elena Gilbert" 
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required={!isLogin}
                       className="input-field"
                       style={{ background: 'transparent', padding: '14px 0', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border-light)' }}
                    />
                 </div>
               )}
               <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
                  <input 
                     type="email" 
                     placeholder="name@company.com" 
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="input-field"
                     style={{ background: 'transparent', padding: '14px 0', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border-light)' }}
                  />
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                  <input 
                     type="password" 
                     placeholder="••••••••" 
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="input-field"
                     style={{ background: 'transparent', padding: '14px 0', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--border-light)' }}
                  />
               </div>
               
               <button 
                type="submit" 
                disabled={loading} 
                className="btn-primary"
                style={{ width: '100%', padding: '20px', fontSize: 14, fontWeight: 600, letterSpacing: '0.05em', background: 'var(--text-primary)', color: 'var(--bg-main)', border: 'none', textTransform: 'uppercase' }}
               >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In →' : 'Create Account →')}
               </button>
            </form>
         </div>

         <div className="auth-footer" style={{ marginTop: 'auto', fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', color: 'var(--text-tertiary)' }}>
            {isLogin ? "DON'T HAVE AN ACCOUNT? " : "ALREADY ESTABLISHED? "}
            <span 
               onClick={() => { setIsLogin(!isLogin); setError(null); }}
               style={{ color: 'var(--text-primary)', textDecoration: 'underline', cursor: 'pointer', marginLeft: 4, fontWeight: 700 }}
            >
               {isLogin ? 'SIGN UP.' : 'SIGN IN.'}
            </span>
         </div>
      </div>
    </div>
  );
}
