import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Meeting {
  id: string;
  title: string;
  participants_count: number;
  location: string;
  time_start: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetchMeetings();
    
    // Subscribe to realtime changes on meetings
    const channel = supabase.channel('meetings-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, () => {
        fetchMeetings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMeetings = async () => {
    if (!user) return;
    
    // Ensure we scope to user
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setMeetings(data);
    }
  };

  return (
    <div className="fade-in">
      {/* Top Header Section */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <h1 className="serif-font" style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 24, color: 'var(--text-primary)' }}>
            Greetings, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}.
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              border: '1px solid rgba(58, 46, 242, 0.3)', 
              color: '#8A84FF', 
              padding: '6px 12px', 
              borderRadius: 20, 
              fontSize: 10, 
              fontWeight: 600, 
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: 6, fontSize: 10 }}>●</span> SYNCED: GOOGLE CALENDAR
            </div>
            <div className="serif-font" style={{ color: 'var(--text-secondary)', fontSize: 16, position: 'relative', top: '-4px' }}>
              ZERO-EFFORT SCHEDULING
            </div>
          </div>
        </div>
        
        <div className="dashboard-intent-btn" style={{ transform: 'translate(-24px, 72px)' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/schedules')}
            style={{ background: '#E0E0E0', color: '#111', fontWeight: 600, letterSpacing: '0.05em', padding: '16px 24px', borderRadius: 4, transition: 'all 0.3s ease', cursor: 'pointer', whiteSpace: 'nowrap' }} 
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)' }} 
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)' }}
          >
            + INITIALIZE NEW INTENT
          </button>
        </div>
      </div>

      <div style={{ width: '100%', height: 1, background: 'var(--border-light)', marginBottom: 40 }} />

      {/* Main Grid: Left 2/3 (Meetings) | Right 1/3 (Insights) */}
      <div className="responsive-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        
        {/* Left Column: Meetings */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <h2 className="serif-font" style={{ fontSize: 26, fontWeight: 500, color: 'var(--text-primary)' }}>Upcoming Meetings</h2>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {meetings.length === 0 ? (
               <div className="card" onClick={() => navigate('/schedules')} style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderColor: 'var(--border-light)', cursor: 'pointer', minHeight: 180 }}>
                 <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color: 'var(--text-secondary)' }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                 </div>
                 <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>INITIATE FOCUS</div>
               </div>
            ) : (
                meetings.map((meeting, idx) => (
               <div key={meeting.id} className="card meeting-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-light)' }}>
                  
                  {/* Timing */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 100 }}>
                     <div>
                        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 4 }}>STARTS AT</div>
                        <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'baseline', gap: 4 }}>
                           {meeting.time_start.split(' ')[0]} 
                           <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{meeting.time_start.split(' ')[1] || ''}</span>
                        </div>
                     </div>
                  </div>

                  {/* Info */}
                  <div className="meeting-info" style={{ flex: 1, paddingLeft: 40, borderLeft: '1px solid var(--border-light)' }}>
                     <h3 className="serif-font" style={{ fontSize: 20, marginBottom: 8, color: 'var(--text-primary)' }}>{meeting.title}</h3>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8"></polygon></svg> {meeting.location} • {meeting.participants_count} Participants
                     </div>
                  </div>

                  {/* Right Side: Avatars/Button & Dots */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        {idx % 2 !== 0 ? (
                           null
                        ) : (
                           <div style={{ display: 'flex' }}>
                              {[...Array(Math.min(meeting.participants_count, 5))].map((_, i) => {
                                 const colors = ['#3A2EF2', '#8A84FF', '#E0E0E0', '#666', '#444'];
                                 return (
                                    <div 
                                       key={i} 
                                       style={{ 
                                          width: 32, 
                                          height: 32, 
                                          borderRadius: '50%', 
                                          background: colors[i % colors.length], 
                                          marginLeft: i > 0 ? -12 : 0, 
                                          border: '2px solid var(--bg-card)',
                                          zIndex: 5 - i
                                       }} 
                                    />
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )))}
          </div>
        </div>

        {/* Right Column: Insights */}
        <div>
          <h2 className="serif-font" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 24 }}>Quick Insights</h2>
          
          <div className="card" style={{ padding: 40, background: 'var(--insight-card-bg)', border: '1px solid var(--insight-card-border)', borderRadius: 'var(--radius-lg)' }}>
             <div style={{ color: '#8A84FF', marginBottom: 24 }}>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                 <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
               </svg>
             </div>
             <h3 className="serif-font" style={{ fontSize: 22, fontWeight: 500, marginBottom: 16, color: 'var(--text-primary)' }}>Group Convergence</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
               Our engine identifies optimal meeting windows by analyzing cognitive load and peak focus hours across all participants.
             </p>
             
             <div onClick={() => navigate('/engine')} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}>
               LEARN HOW IT WORKS 
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
