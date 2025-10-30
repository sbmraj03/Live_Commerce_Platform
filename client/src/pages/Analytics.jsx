import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/analytics/StatsCard';
import SessionAnalyticsCard from '../components/analytics/SessionAnalyticsCard';
import DetailedAnalyticsModal from '../components/analytics/DetailedAnalyticsModal';

const Analytics = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sessions');
      setSessions(response.data.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      alert('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const openDetailedAnalytics = (sessionId) => {
    setSelectedSessionId(sessionId);
  };

  const closeDetailedAnalytics = () => {
    setSelectedSessionId(null);
  };

  // Calculate overall stats
  const stats = {
    totalSessions: sessions.length,
    liveSessions: sessions.filter(s => s.status === 'live').length,
    totalViewers: sessions.reduce((sum, s) => sum + (s.peakViewers || 0), 0),
    totalReactions: sessions.reduce((sum, s) => sum + (s.totalReactions || 0), 0),
    totalQuestions: sessions.reduce((sum, s) => sum + (s.totalQuestions || 0), 0),
    avgViewers: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.peakViewers || 0), 0) / sessions.length)
      : 0
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  // Sort by date (newest first)
  const sortedSessions = [...filteredSessions].sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your live commerce performance</p>
            </div>
            <Link
              to="/"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
              <StatsCard
                icon="📊"
                label="Total Sessions"
                value={stats.totalSessions}
                color="purple"
              />
              <StatsCard
                icon="🔴"
                label="Live Now"
                value={stats.liveSessions}
                color="red"
              />
              <StatsCard
                icon="👥"
                label="Total Viewers"
                value={stats.totalViewers}
                color="blue"
              />
              <StatsCard
                icon="📈"
                label="Avg Viewers"
                value={stats.avgViewers}
                color="green"
              />
              <StatsCard
                icon="❤️"
                label="Total Reactions"
                value={stats.totalReactions}
                color="pink"
              />
              <StatsCard
                icon="❓"
                label="Total Questions"
                value={stats.totalQuestions}
                color="yellow"
              />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-semibold">Filter:</span>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All Sessions
                  </button>
                  <button
                    onClick={() => setFilter('live')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'live'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setFilter('scheduled')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'scheduled'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Scheduled
                  </button>
                  <button
                    onClick={() => setFilter('ended')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filter === 'ended'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Ended
                  </button>
                </div>
              </div>
            </div>

            {/* Session Analytics Cards */}
            {sortedSessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                  No Sessions Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all'
                    ? 'Create your first live session to see analytics'
                    : `No ${filter} sessions found`}
                </p>
                <Link
                  to="/admin/sessions"
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Create Session
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Session Performance ({sortedSessions.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedSessions.map((session) => (
                    <SessionAnalyticsCard
                      key={session._id}
                      session={session}
                      onClick={() => openDetailedAnalytics(session._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="mt-8 bg-linear-to-r from-purple-600 to-blue-600 rounded-lg shadow-md p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/admin"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
                >
                  <div className="text-3xl mb-2">🎛️</div>
                  <p className="font-semibold text-black">Admin Dashboard</p>
                </Link>
                <Link
                  to="/admin/sessions"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
                >
                  <div className="text-3xl mb-2">🎥</div>
                  <p className="font-semibold text-black">Manage Sessions</p>
                </Link>
                <Link
                  to="/viewer"
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg transition-all text-center"
                >
                  <div className="text-3xl mb-2">📺</div>
                  <p className="font-semibold text-black">Join Live Session</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Analytics Modal */}
      <DetailedAnalyticsModal
        isOpen={!!selectedSessionId}
        onClose={closeDetailedAnalytics}
        sessionId={selectedSessionId}
      />
    </div>
  );
};

export default Analytics;
