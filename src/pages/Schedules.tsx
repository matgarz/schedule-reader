import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Schedules() {
  const [eventName, setEventName] = useState('');
  const [duration, setDuration] = useState('60 mins');
  const [windowLimit, setWindowLimit] = useState('Next 7 Days');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const navigate = useNavigate();

  const initiateFocus = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([{}])
        .select()
        .single();
        
      if (error) throw error;
      if (data && data.id) {
        navigate(`/g/${data.id}?event=${encodeURIComponent(eventName)}`);
      }
    } catch (e: any) {
      console.error(e);
      alert("Failed to initiate focus session.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCollective = () => {
    if (!inviteLink) return;
    try {
      // Basic parsing of the invite link (e.g. http://localhost:5173/g/some-uuid)
      const url = new URL(inviteLink);
      const pathParts = url.pathname.split('/');
      const groupId = pathParts[pathParts.indexOf('g') + 1];
      
      if (groupId && groupId.length > 20) { // Simple UUID check
        navigate(`/g/${groupId}`);
      } else {
        alert("Invalid invite link format.");
      }
    } catch (e) {
      // Try local path if it's not a full URL
      if (inviteLink.startsWith('/g/')) {
        navigate(inviteLink);
      } else {
        alert("Please enter a valid Flux invite link.");
      }
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 40, maxWidth: 600 }}>
        <h1 className="serif-font" style={{ fontSize: 42, marginBottom: 16 }}>Initiate Collective Focus</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
          Define your event parameters and invite participants. We will synchronize their calendars to find the optimal moment for alignment.
        </p>
      </div>

      <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 340px' }}>
        
        {/* Left Form Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          <div>
            <div className="section-title-small" style={{ marginBottom: 12 }}>EVENT IDENTITY</div>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Strategic Roadmap Q4" 
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              style={{ padding: '18px 24px', fontSize: 18 }}
            />
          </div>

          <div>
            <div className="section-title-small" style={{ marginBottom: 12 }}>PARTICIPANT ACCESS</div>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Add via email address" 
                style={{ padding: '18px 24px' }}
              />
              <div style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', cursor: 'pointer', fontSize: 20 }}>
                ⊕
              </div>
            </div>
          </div>

          <div>
             <div className="section-title-small" style={{ marginBottom: 12 }}>TEMPORAL CONSTRAINTS</div>
             <div style={{ display: 'flex', gap: 16 }}>
               <div style={{ flex: 1, position: 'relative' }}>
                 <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}>Duration</div>
                 <input className="input-field" type="text" value={duration} onChange={e => setDuration(e.target.value)} style={{ paddingLeft: 80, width: '100%', textAlign: 'right', fontWeight: 600, boxSizing: 'border-box' }} />
               </div>
               <div style={{ flex: 1, position: 'relative' }}>
                 <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, pointerEvents: 'none' }}>Window</div>
                 <input className="input-field" type="text" value={windowLimit} onChange={e => setWindowLimit(e.target.value)} style={{ paddingLeft: 80, width: '100%', textAlign: 'right', fontWeight: 600, boxSizing: 'border-box' }} />
               </div>
             </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ padding: '20px', fontSize: 16, background: '#E0E0E0', color: '#111', marginTop: 16 }}
            onClick={initiateFocus}
            disabled={loading}
          >
            {loading ? 'Initiating...' : 'Find Best Time →'}
          </button>
        </div>

        {/* Right Info Column: Join Collective */}
        <div className="schedules-join-container" style={{ position: 'relative' }}>
          <div className="card gs-schedule-card" style={{ padding: 32, height: '80%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h3 className="serif-font" style={{ fontSize: 24 }}>Join Collective</h3>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 32 }}>
                Paste an invite link to synchronize your temporal flow with an existing group. 
              </p>

              <div style={{ marginBottom: 24 }}>
                <div className="section-title-small" style={{ marginBottom: 12 }}>PASTE INVITE LINK</div>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. http://flux.sync/g/..." 
                  value={inviteLink}
                  onChange={(e) => setInviteLink(e.target.value)}
                  style={{ fontSize: 12, padding: '14px 16px' }}
                />
              </div>

              <button 
                className="btn-primary" 
                onClick={handleJoinCollective}
                style={{ width: '100%', padding: '16px', fontSize: 13, background: 'var(--primary)', color: '#fff', border: 'none' }}
              >
                Sync and Join →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
