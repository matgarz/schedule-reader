import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase, ScheduleModel } from "../lib/supabase";
import { parseScheduleImage } from "../lib/api";
import UploadZone from "../components/UploadZone";
import { buildPipeline } from "../lib/scheduling";
import Spinner from "../components/Spinner";
import GeometricBlurMesh from "../components/GeometricBlurMesh";
import AsmrBackground from "../components/AsmrBackground";

export default function GroupSpace() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const eventName = searchParams.get('event') || 'Strategy Sync';
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schedules, setSchedules] = useState<ScheduleModel[]>([]);
  const [showContributorMode, setShowContributorMode] = useState(false);
  const [pastedUrl, setPastedUrl] = useState('');
  const [pasting, setPasting] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  
  const [userName, setUserName] = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(false);

  // Upload state
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    // Initial fetch
    supabase.from("schedules").select("*").eq("group_id", id).then(res => {
      if (res.data) setSchedules(res.data);
    });

    // Subscriptions
    const subS = supabase.channel('schedules-ch')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'schedules', filter: `group_id=eq.${id}` }, payload => {
        setSchedules(prev => [...prev, payload.new as ScheduleModel]);
      }).subscribe();
      
    return () => {
      supabase.removeChannel(subS);
    };
  }, [id]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewSrc(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
      setImageType(file.type || "image/jpeg");
    };
    reader.readAsDataURL(file);
  }, []);

  const reset = () => {
    setImageBase64(null);
    setPreviewSrc(null);
    setError(null);
  };

  const uploadAndAnalyze = async () => {
    if (!imageBase64 || !nameConfirmed || !userName) return;
    setLoading(true);
    setError(null);
    try {
      const parsedData = await parseScheduleImage(imageBase64, imageType);
      const { error: insertError } = await supabase.from("schedules").insert([{
        group_id: id,
        user_name: userName,
        schedule_data: parsedData
      }]);
      if (insertError) throw insertError;
      reset();
    } catch (e: any) {
      console.error(e);
      setError("Failed to parse and upload the schedule.");
    } finally {
      setLoading(false);
    }
  };

  const groupedResults = schedules.map(s => s.schedule_data);
  const pipeline = useMemo(() => buildPipeline(groupedResults), [groupedResults]);
  const optimalTime = pipeline.bestTimes[selectedTimeIndex] || pipeline.bestTimes[0];

  const hasUploaded = schedules.some(s => s.user_name === userName);

  if (!nameConfirmed) {
     return (
        <div className="fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#000' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, filter: 'blur(20px)', transform: 'scale(1.1)' }}>
              <GeometricBlurMesh />
           </div>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(10, 12, 16, 0.5)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 16, padding: 48, maxWidth: 400, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
              <h1 className="serif-font" style={{ fontSize: 24, marginBottom: 12 }}>Join Collective Focus</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>Enter your identifier to access the {eventName} synchronization matrix.</p>
              <input 
                 className="input-field"
                 value={userName} 
                 onChange={e => setUserName(e.target.value)} 
                 placeholder="e.g. Elena Vance" 
                 style={{ marginBottom: 16, textAlign: 'center' }}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' && userName.trim()) {
                     setNameConfirmed(true);
                     supabase.from("messages").insert([{ group_id: id, user_name: "System", content: `${userName.trim()} joined the space!` }]).then();
                   }
                 }}
              />
              <button 
                className="btn-primary" 
                onClick={() => { 
                  if(userName.trim()) {
                    setNameConfirmed(true);
                    supabase.from("messages").insert([{ group_id: id, user_name: "System", content: `${userName.trim()} joined the space!` }]).then();
                  }
                }}
                style={{ width: '100%', padding: '16px' }}
              >
                Join Space →
              </button>
           </div>
          </div>
        </div>
     );
  }

  const handlePasteLink = async () => {
    if (!pastedUrl) return;
    setPasting(true);
    setError(null);
    try {
      const match = pastedUrl.match(/\/g\/([a-zA-Z0-9-]+)/);
      const otherId = match ? match[1] : pastedUrl;

      if (otherId === id) throw new Error("Cannot link the same session.");

      const { data, error: fetchError } = await supabase
        .from('schedules')
        .select('*')
        .eq('group_id', otherId);

      if (fetchError) throw fetchError;
      if (!data || data.length === 0) throw new Error("No schedules found at this destination.");

      // Batch insert into current group
      const newSchedules = data.map(s => ({
        group_id: id,
        user_name: s.user_name,
        raw_data: s.raw_data,
        processed_data: s.processed_data
      }));

      const { error: insertError } = await supabase.from('schedules').insert(newSchedules);
      if (insertError) throw insertError;

      // Refresh local list
      const { data: refreshed } = await supabase.from('schedules').select('*').eq('group_id', id);
      if (refreshed) setSchedules(refreshed);
      
      setShowContributorMode(false);
      setPastedUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPasting(false);
    }
  };

  const saveToCalendar = async () => {
    if (!user || !optimalTime) return;
    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('meetings').insert({
        user_id: user.id,
        title: eventName,
        participants_count: schedules.length,
        location: "Strategy Engine v4.2",
        time_start: `${optimalTime.start} ${optimalTime.day}`
      });

      if (insertError) throw insertError;
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
       {/* New fixed AsmrBackground */}
       <div className="gs-bg-canvas">
          <div style={{ filter: 'blur(16px)', width: '100%', height: '100%', transform: 'scale(1.05)' }}>
             <AsmrBackground />
          </div>
       </div>

      
      {/* Container to center content */}
      <div className={`gs-main-container gs-scrollable-mobile ${optimalTime ? 'gs-optimal-view' : ''}`} style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: optimalTime ? 'flex-start' : 'center', 
        alignItems: 'center', 
        padding: '0 40px', 
        width: '100%',
        overflowY: 'auto'
      }}>
      
      <div className="gs-card-container" style={{ 
         display: 'flex', 
         flexDirection: (showContributorMode && optimalTime) ? 'row' : 'column', 
         alignItems: (showContributorMode && optimalTime) ? 'flex-start' : 'center', 
         justifyContent: 'center', 
         gap: 48,
         width: '100%',
         maxWidth: (showContributorMode && optimalTime) ? 1700 : 'none'
      }}>


      {optimalTime ? (
         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: showContributorMode ? 0 : 60, flexShrink: 0 }}>
            <h1 className="serif-font" style={{ fontSize: 54, marginBottom: 40, textAlign: 'center' }}>Optimal Time Found</h1>
            
            <div className="card gs-optimal-card" style={{ width: '100%', maxWidth: 800, padding: 0, display: 'flex' }}>
               
               {/* Main Display Window */}
               <div className="gs-display-window" style={{ flex: 1.5, padding: 40, borderRight: '1px solid var(--border-light)' }}>
                  <div className="section-title-small" style={{ marginBottom: 16 }}>THE SELECTION</div>
                  <div style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                     <span style={{ color: 'var(--primary)', fontSize: 16 }}>●</span> 
                     {optimalTime.day}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
                     <div className="gs-time-display" style={{ fontSize: 96, fontFamily: 'Playfair Display, serif', lineHeight: 1, letterSpacing: '-0.02em' }}>
                        {optimalTime.start}
                     </div>
                     <div style={{ paddingTop: 16 }}>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 600 }}>GMT</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>-05:00</div>
                     </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 60 }}>
                     <div style={{ display: 'flex', marginLeft: 10 }}>
                        {schedules.map((s, i) => (
                           <div key={i} title={s.user_name} style={{ width: 32, height: 32, borderRadius: '50%', background: '#333', marginLeft: -10, border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                             {s.user_name.charAt(0).toUpperCase()}
                           </div>
                        ))}
                     </div>
                     <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}>
                        "Consensus reached by Strategy Engine v4.2"
                     </div>
                  </div>
               </div>

               {/* Right Parameters Window: Alternative Timings */}
               <div style={{ flex: 1, padding: 40 }}>
                  <div className="section-title-small" style={{ marginBottom: 32 }}>ALTERNATIVE WINDOWS</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                     {pipeline.bestTimes.length > 1 ? (
                        pipeline.bestTimes.map((time, i) => {
                           if (i === selectedTimeIndex) return null;
                           return (
                              <div 
                                 key={i} 
                                 onClick={() => setSelectedTimeIndex(i)}
                                 style={{ 
                                    display: 'flex', 
                                    gap: 16, 
                                    alignItems: 'center', 
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    marginLeft: '-8px',
                                    transition: 'background 0.2s'
                                 }}
                                 onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                 onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                              >
                                 <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-tertiary)' }} />
                                 <div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{time.day}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{time.start} – {time.end}</div>
                                 </div>
                              </div>
                           );
                        })
                     ) : (
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No other high-confidence windows available for this collective.</div>
                     )}
                  </div>
               </div>
            </div>

            <div className="gs-action-buttons" style={{ display: 'flex', gap: 16, marginTop: 40 }}>
               <button className="btn-secondary" onClick={saveToCalendar} style={{ background: '#E0E0E0', color: '#111', padding: '16px 32px' }}>
                  {loading ? <Spinner /> : "Accept and Calendar"}
               </button>
               <button className="btn-secondary" onClick={() => setShowContributorMode(!showContributorMode)} style={{ padding: '16px 32px', border: showContributorMode ? '1px solid var(--primary)' : '1px solid var(--border-light)' }}>
                  {showContributorMode ? "ESC CONTRIBUTOR MODE" : "➕ JOIN COLLECTIVE"}
               </button>
               <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(window.location.href)} style={{ padding: '16px 32px' }}>🔗 Copy Share Link</button>
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--text-secondary)', marginTop: 24, textTransform: 'uppercase' }}>
               Invitations will be dispatched immediately upon acceptance.
            </div>
         </div>
      ) : null}

      {/* Awaiting Sync & Upload Zone Container or Contributor Mode */}
      {(!optimalTime || showContributorMode) && (
         <div className="fade-in card" style={{ 
            width: '100%', 
            maxWidth: showContributorMode ? (optimalTime ? 500 : 800) : 1100, 
            margin: (showContributorMode && optimalTime) ? '0' : '0 auto', 
            marginBottom: (showContributorMode && optimalTime) ? '0' : 40, 
            border: '1px solid rgba(255,255,255,0.05)', 
            background: 'rgba(10, 12, 16, 0.4)', 
            backdropFilter: 'blur(32px)', 
            WebkitBackdropFilter: 'blur(32px)', 
            marginTop: showContributorMode ? (optimalTime ? 20 : 40) : 0,
            alignSelf: (showContributorMode && optimalTime) ? 'flex-start' : 'center'
         }}>
            {!showContributorMode && (
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: !hasUploaded ? 32 : 0, marginBottom: !hasUploaded ? 32 : 0, borderBottom: !hasUploaded ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <h1 className="serif-font" style={{ fontSize: 42, marginBottom: 16 }}>Awaiting Sync</h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32 }}>
                     Not enough overlapping schedules yet for '{eventName}'.
                  </p>
                  <div className="badge" style={{ fontSize: 12 }}>{schedules.length} SCHEDULES SYNCED</div>
               </div>
            )}
            
            {showContributorMode && (
               <div className="gs-contributor-header" style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 className="serif-font" style={{ fontSize: 24, marginBottom: 16 }}>Collective Expansion</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Paste a schedule link from another collective to merge results, or upload a new file below.</p>
                  
                  <div style={{ position: 'relative' }}>
                     <input 
                        type="text" 
                        placeholder="" 
                        value={pastedUrl}
                        onChange={(e) => setPastedUrl(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', padding: '16px 20px', borderRadius: 8, color: '#fff', fontSize: 14 }}
                     />
                     <button 
                        disabled={pasting || !pastedUrl}
                        onClick={handlePasteLink}
                        style={{ position: 'absolute', right: 8, top: 8, bottom: 8, background: 'var(--primary)', border: 'none', borderRadius: 6, color: '#fff', padding: '0 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', opacity: pasting ? 0.5 : 1 }}
                     >
                        {pasting ? "LINKING..." : "LINK SCHEDULE"}
                     </button>
                  </div>
               </div>
            )}

            {!hasUploaded && (
               <div>
                  <h3 className="serif-font" style={{ fontSize: 20, marginBottom: 16 }}>Sync Your Schedule</h3>
                  {error && <div style={{ color: '#FF7A7A', fontSize: 13, marginBottom: 16 }}>{error}</div>}
                  <UploadZone
               previewSrc={previewSrc}
               dragging={false}
               onFile={handleFile}
               onDragOver={(e) => e.preventDefault()}
               onDragLeave={() => {}}
               onDrop={(e) => {
                 e.preventDefault();
                 const file = e.dataTransfer.files[0];
                 if (file) handleFile(file);
               }}
               onReset={reset}
             />
             {previewSrc && (
               <button 
                  className="btn-primary" 
                  disabled={loading} 
                  onClick={uploadAndAnalyze} 
                  style={{ 
                    marginTop: 20, 
                    width: '100%', 
                    padding: 18,
                    background: '#E0E0E0', 
                    color: '#111', 
                    fontWeight: 600, 
                    letterSpacing: '0.05em',
                    transition: 'all 0.3s ease'
                  }}
               >
                  {loading ? (
                    <div className="tech-loading-text" style={{ position: 'relative', padding: '0 20px', width: '100%', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(90deg, transparent, rgba(58, 46, 242, 0.4), transparent)', animation: 'scan-horizontal 1.5s linear infinite' }} />
                      <span>INITIALIZING SYNC SEQUENCE...</span>
                    </div>
                  ) : "Execute Sync Sequence"}
               </button>
             )}
               </div>
            )}
         </div>
      )}

      </div>
      </div>
    </div>
  );
}
