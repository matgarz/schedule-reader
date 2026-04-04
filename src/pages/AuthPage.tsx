import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
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
    <div className="auth-layout" style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-main)', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      
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
        background: 'linear-gradient(165deg, rgba(26, 26, 34, 0.95) 0%, rgba(21, 21, 26, 0.98) 100%)', 
        borderLeft: '1px solid rgba(255, 255, 255, 0.12)', 
        boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(24px)',
        position: 'relative',
        zIndex: 10
      }}>
         <div className="auth-header-links" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 'auto', color: 'var(--text-tertiary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>WORK</span>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>COMPANY</span>
               <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'inherit'}>CAPABILITIES</span>
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
