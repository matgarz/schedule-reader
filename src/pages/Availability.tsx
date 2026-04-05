import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

type DayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

interface DayWindow {
  enabled: boolean;
  start: string;
  end: string;
}

const DAY_ORDER: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DENSITY_CHART_START_HOUR = 8;
const DENSITY_CHART_END_HOUR = 22;

const DEFAULT_DAILY_WINDOWS: Record<DayKey, DayWindow> = {
  Mon: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  Tue: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  Wed: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  Thu: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  Fri: { enabled: true, start: '09:00 AM', end: '05:00 PM' },
  Sat: { enabled: false, start: '10:00 AM', end: '02:00 PM' },
  Sun: { enabled: false, start: '10:00 AM', end: '02:00 PM' },
};

interface AvailabilitySettingsPayload {
  googleSync: boolean;
  outlookSync: boolean;
  buffer: number;
  dailyLimit: number;
  dailyWindows: Record<DayKey, DayWindow>;
}

function cloneDefaultDailyWindows(): Record<DayKey, DayWindow> {
  return {
    Mon: { ...DEFAULT_DAILY_WINDOWS.Mon },
    Tue: { ...DEFAULT_DAILY_WINDOWS.Tue },
    Wed: { ...DEFAULT_DAILY_WINDOWS.Wed },
    Thu: { ...DEFAULT_DAILY_WINDOWS.Thu },
    Fri: { ...DEFAULT_DAILY_WINDOWS.Fri },
    Sat: { ...DEFAULT_DAILY_WINDOWS.Sat },
    Sun: { ...DEFAULT_DAILY_WINDOWS.Sun },
  };
}

function normalizeDailyWindows(raw: unknown): Record<DayKey, DayWindow> {
  const fallback = cloneDefaultDailyWindows();
  if (!raw || typeof raw !== 'object') return fallback;

  const record = raw as Record<string, unknown>;
  for (const day of DAY_ORDER) {
    const candidate = record[day] as Record<string, unknown> | undefined;
    if (!candidate || typeof candidate !== 'object') continue;

    const enabled = typeof candidate.enabled === 'boolean' ? candidate.enabled : fallback[day].enabled;
    const start = typeof candidate.start === 'string' ? candidate.start : fallback[day].start;
    const end = typeof candidate.end === 'string' ? candidate.end : fallback[day].end;

    fallback[day] = { enabled, start, end };
  }

  return fallback;
}

export default function Availability() {
  const { user } = useAuth();
  const [googleSync, setGoogleSync] = useState(true);
  const [outlookSync, setOutlookSync] = useState(false);
  const [buffer, setBuffer] = useState(15);
  const [dailyLimit, setDailyLimit] = useState(4);
  const [dailyWindows, setDailyWindows] = useState<Record<DayKey, DayWindow>>(cloneDefaultDailyWindows);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const raw = user?.user_metadata?.availabilitySettings as Partial<AvailabilitySettingsPayload> | undefined;
    if (!raw) return;

    if (typeof raw.googleSync === 'boolean') setGoogleSync(raw.googleSync);
    if (typeof raw.outlookSync === 'boolean') setOutlookSync(raw.outlookSync);
    if (typeof raw.buffer === 'number') setBuffer(raw.buffer);
    if (typeof raw.dailyLimit === 'number') setDailyLimit(raw.dailyLimit);
    setDailyWindows(normalizeDailyWindows(raw.dailyWindows));
  }, [user?.id]);

  const saveAvailabilitySettings = async () => {
    if (!user) return;

    setSaveState('saving');

    const payload: AvailabilitySettingsPayload = {
      googleSync,
      outlookSync,
      buffer,
      dailyLimit,
      dailyWindows,
    };

    const { error } = await supabase.auth.updateUser({
      data: {
        availabilitySettings: payload,
      },
    });

    if (error) {
      console.error('Failed to save availability settings', error);
      setSaveState('error');
      return;
    }

    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000);
  };

  const updateDayWindow = (day: DayKey, patch: Partial<DayWindow>) => {
    setDailyWindows((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        ...patch,
      },
    }));
  };

  const parseClock = (t: string) => {
    const split = t.split(/[: ]/);
    if (split.length < 3) return 0;
    let h = parseInt(split[0], 10);
    const m = parseInt(split[1], 10);
    const isPM = split[2].toUpperCase() === 'PM';
    if (isPM && h < 12) h += 12;
    if (!isPM && h === 12) h = 0;
    return h + m / 60;
  };

  const enabledDays = DAY_ORDER.filter((d) => dailyWindows[d].enabled);
  const avgCenter = enabledDays.length
    ? enabledDays.reduce((acc, d) => {
        const start = parseClock(dailyWindows[d].start);
        const end = parseClock(dailyWindows[d].end);
        return acc + (start + end) / 2;
      }, 0) / enabledDays.length
    : 12;

  return (
    <div className="fade-in availability-grid responsive-grid" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 1.5fr' }}>
      {/* 1st block on left */}
      <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
        <div>
          <h1 className="serif-font" style={{ fontSize: 42, marginBottom: 16 }}>Availability Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
            Define your rhythmic boundaries and sync your digital lifecycle.
          </p>
        </div>
          
        {/* Synced Calendars */}
          <div>
             <h2 className="serif-font" style={{ fontSize: 20, marginBottom: 6 }}>Synced Calendars</h2>
             <div className="section-title-small" style={{ marginBottom: 16 }}>EXTERNAL INTEGRATIONS</div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                         <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Google Calendar</div>
                         <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>alex.design@gmail.com</div>
                      </div>
                   </div>
                   <div className={`toggle-switch ${googleSync ? 'on' : ''}`} onClick={() => setGoogleSync(!googleSync)}>
                      <div className="toggle-knob" />
                   </div>
                </div>

                <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div>
                      <div>
                         <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Outlook Calendar</div>
                         <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Not connected</div>
                      </div>
                   </div>
                   <div className={`toggle-switch ${outlookSync ? 'on' : ''}`} onClick={() => setOutlookSync(!outlookSync)}>
                      <div className="toggle-knob" />
                   </div>
                </div>
             </div>
          </div>

          {/* Precision Settings */}
          <div>
            <h2 className="serif-font" style={{ fontSize: 20, marginBottom: 6 }}>Precision Settings</h2>
            <div className="section-title-small" style={{ marginBottom: 24 }}>FOCUS & LIMITS</div>

            <div style={{ marginBottom: 32 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                 <div style={{ fontSize: 14, fontWeight: 600 }}>Meeting Buffer</div>
                 <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>{buffer} MIN</div>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="60" 
                 step="5" 
                 value={buffer} 
                 onChange={(e) => setBuffer(parseInt(e.target.value))}
                 className="custom-slider"
                 style={{ width: '100%', cursor: 'pointer', marginBottom: 12 }}
               />
               <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Time added before and after events to prevent back-to-back fatigue.</p>
            </div>

            <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                 <div style={{ fontSize: 14, fontWeight: 600 }}>Daily Meeting Limit</div>
                 <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>{dailyLimit} SLOTS</div>
               </div>
               <input 
                 type="range" 
                 min="1" 
                 max="10" 
                 step="1" 
                 value={dailyLimit} 
                 onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                 className="custom-slider"
                 style={{ width: '100%', cursor: 'pointer', marginBottom: 12 }}
               />
               <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Maximum number of scheduled meetings per day to protect focus time.</p>
            </div>

          </div>

        </div>

        {/* Right Column */}
        <div className="card" style={{ padding: 32, display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
             <h2 className="serif-font" style={{ fontSize: 24 }}>Meeting Hours</h2>
             <button
               className="btn-primary"
               onClick={saveAvailabilitySettings}
               disabled={saveState === 'saving'}
               style={{
                 padding: '10px 16px',
                 fontSize: 12,
                 letterSpacing: '0.04em',
                 textTransform: 'uppercase',
                 opacity: saveState === 'saving' ? 0.7 : 1,
               }}
             >
               {saveState === 'saving' ? 'Saving...' : 'Save Settings'}
             </button>
           </div>
           {saveState === 'saved' ? (
             <p style={{ marginBottom: 8, fontSize: 12, color: '#8A84FF' }}>Saved to your account.</p>
           ) : null}
           {saveState === 'error' ? (
             <p style={{ marginBottom: 8, fontSize: 12, color: '#FF7070' }}>Could not save settings. Try again.</p>
           ) : null}
           <div className="section-title-small" style={{ marginBottom: 32 }}>DAY-BY-DAY AVAILABILITY WINDOWS</div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 48 }}>
             {DAY_ORDER.map((day) => {
               const dayWindow = dailyWindows[day];

               return (
                 <div
                   key={day}
                   style={{
                     background: dayWindow.enabled ? 'rgba(58, 46, 242, 0.05)' : 'rgba(255,255,255,0.02)',
                     border: dayWindow.enabled
                       ? '1px solid rgba(58, 46, 242, 0.2)'
                       : '1px solid rgba(255,255,255,0.05)',
                     borderRadius: 'var(--radius-md)',
                     padding: 20,
                     transition: 'all 0.2s ease',
                   }}
                 >
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: dayWindow.enabled ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                       <span style={{ color: dayWindow.enabled ? 'var(--primary)' : 'inherit', fontSize: 10 }}>●</span>
                       {day}
                     </div>
                     <div className={`toggle-switch ${dayWindow.enabled ? 'on' : ''}`} onClick={() => updateDayWindow(day, { enabled: !dayWindow.enabled })}>
                        <div className="toggle-knob" />
                     </div>
                   </div>

                   {dayWindow.enabled ? (
                     <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 10, marginBottom: 8, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>START</div>
                         <div style={{ background: '#1C1C24', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                           <input
                             value={dayWindow.start}
                             onChange={(e) => updateDayWindow(day, { start: e.target.value })}
                             style={{ background: 'transparent', border: 'none', color: '#fff', font: 'inherit', width: '100%', outline: 'none' }}
                           />
                         </div>
                       </div>
                       <div style={{ color: 'var(--text-tertiary)', marginTop: 24 }}>→</div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: 10, marginBottom: 8, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>END</div>
                         <div style={{ background: '#1C1C24', padding: '12px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
                           <input
                             value={dayWindow.end}
                             onChange={(e) => updateDayWindow(day, { end: e.target.value })}
                             style={{ background: 'transparent', border: 'none', color: '#fff', font: 'inherit', width: '100%', outline: 'none' }}
                           />
                         </div>
                       </div>
                     </div>
                   ) : (
                     <div style={{ border: '1px dashed var(--border-light)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                       Unavailable for bookings
                     </div>
                   )}
                 </div>
               );
             })}
           </div>

           <div className="section-title-small" style={{ marginBottom: 16 }}>AVAILABILITY DENSITY</div>
           
           {/* Dynamic Chart */}
           <div style={{ height: 80, display: 'flex', alignItems: 'flex-end', gap: 6, borderBottom: '1px solid var(--border-light)', paddingBottom: 8, marginBottom: 8 }}>
              {Array.from({ length: DENSITY_CHART_END_HOUR - DENSITY_CHART_START_HOUR }).map((_, i) => {
                const hour = DENSITY_CHART_START_HOUR + i;

                 let activeCount = 0;
                 for (const day of DAY_ORDER) {
                   const window = dailyWindows[day];
                   if (!window.enabled) continue;
                   const start = parseClock(window.start);
                   const end = parseClock(window.end);
                   if (hour >= start && hour < end) activeCount += 1;
                 }

                 let height = 12 + activeCount * 12;

                 // Slight peak around average center of enabled day windows.
                 const dist = Math.abs(hour - avgCenter);
                 if (activeCount > 0) height += Math.max(0, 20 - dist * 4);

                 const colors = ['#1A1A40', '#2414B3', '#3A2EF2', '#4F44F4', '#817BFF', '#A3A0FF'];
                 const colorIdx = Math.floor((height / 100) * (colors.length - 1));

                 return (
                   <div 
                    key={i} 
                    className="fade-in"
                    style={{ 
                      flex: 1, 
                      background: colors[colorIdx], 
                      height: `${Math.min(height, 100)}%`, 
                      borderRadius: '4px 4px 0 0',
                      transition: 'all 0.5s ease'
                    }} 
                   />
                 );
              })}
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600 }}>
             <span>08:00</span>
             <span>12:00</span>
             <span>16:00</span>
             <span>20:00</span>
             <span>22:00</span>
           </div>

        </div>
      </div>
  );
}
