import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import Spinner from "../components/Spinner";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createGroup = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("groups")
        .insert([{}])
        .select()
        .single();

      if (error) throw error;
      if (data && data.id) {
        navigate(`/g/${data.id}`);
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to create group. Please check your Supabase connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div className="hero">
          <div className="hero-top" style={{ justifyContent: 'center' }}>
            <div className="hero-icon">
              👥
            </div>
            <h1>Shared Team Scheduler</h1>
          </div>
          <p style={{ maxWidth: 600, margin: '0 auto', marginBottom: 24 }}>
            Create a shared space. Send the link to your team. Everyone uploads their schedule to instantly spot combined free time and coordinate plans.
          </p>
        </div>

        {error && (
          <div className="fade-up error-box" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <button
          className="primary-btn"
          disabled={loading}
          onClick={createGroup}
          style={{ width: 'auto', padding: '0 32px' }}
        >
          {loading ? <Spinner /> : <span>✨</span>}
          {loading ? "Creating..." : "Create New Shared Space"}
        </button>
      </div>
    </div>
  );
}
