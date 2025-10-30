// Viewer entry: join a live session and see stream/products/Q&A
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LiveSessionViewer from '../../components/viewer/LiveSessionViewer';
import ProductsShowcase from '../../components/viewer/ProductsShowcase';
import ReactionsPanel from '../../components/viewer/ReactionsPanel';
import QuestionsPanel from '../../components/viewer/QuestionsPanel';

const ViewerPage = () => {
  const [liveSession, setLiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  // Fetch live session
  const fetchLiveSession = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sessions/live/current');
      setLiveSession(response.data.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching live session:', error);
      }
      setLiveSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSession();

    // Poll for live session every 30 seconds
    const interval = setInterval(fetchLiveSession, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      setHasJoined(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live session...</p>
        </div>
      </div>
    );
  }

  if (!liveSession) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-8xl mb-6">📺</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              No Live Session Right Now
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Check back soon for our next live commerce session!
            </p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎥</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Live Session is On!
            </h2>
            <p className="text-gray-600">{liveSession.title}</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Enter your name to join
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!userName.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Live Session
            </button>
          </form>

          <Link
            to="/"
            className="block text-center text-gray-600 hover:text-gray-800 mt-4 text-sm"
          >
            ← Back to Home
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
                to="/"
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Live Commerce</h1>
                <p className="text-sm text-gray-600">Watching as {userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              <span className="font-semibold text-red-600">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Stream & Products */}
          <div className="lg:col-span-2 space-y-6">
            <LiveSessionViewer session={liveSession} userName={userName} />
            <ProductsShowcase products={liveSession.products} highlightedProductId={liveSession.highlightedProduct} />
          </div>

          {/* Right Column - Reactions & Questions */}
          <div className="space-y-6">
            <ReactionsPanel sessionId={liveSession._id} userName={userName} />
            <QuestionsPanel sessionId={liveSession._id} userName={userName} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;