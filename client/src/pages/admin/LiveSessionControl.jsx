import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LiveControlPanel from '../../components/admin/LiveControlPanel';

const LiveSessionControl = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/sessions/${sessionId}`);
      setSession(response.data.data);
    } catch (error) {
      console.error('Error fetching session:', error);
      alert('Failed to fetch session');
      navigate('/admin/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to end this live session?')) {
      try {
        await api.put(`/api/sessions/${sessionId}/end`);
        alert('Session ended successfully!');
        navigate('/admin/sessions');
      } catch (error) {
        console.error('Error ending session:', error);
        alert('Failed to end session');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Session not found</p>
          <Link
            to="/admin/sessions"
            className="mt-4 inline-block text-purple-600 hover:text-purple-700"
          >
            ← Back to Sessions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/sessions"
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Live Session Control</h1>
                <p className="text-sm text-gray-600">{session.title}</p>
              </div>
            </div>
            {session.status === 'live' && (
              <button
                onClick={handleEndSession}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                🛑 End Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LiveControlPanel session={session} />
      </div>
    </div>
  );
};

export default LiveSessionControl;