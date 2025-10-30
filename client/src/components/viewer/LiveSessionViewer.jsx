// Shows live stream header and viewer counts for a session
import { useState, useEffect } from 'react';
import socketService from '../../services/socket';

const LiveSessionViewer = ({ session, userName }) => {
  const [viewers, setViewers] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    if (session && userName) {
      // Connect to socket
      const socket = socketService.connect();

      // Join session
      socket.emit('join:session', {
        sessionId: session._id,
        userName
      });

      // Listen for session joined confirmation
      socket.on('session:joined', (data) => {
        setHasJoined(true);
        setViewers(data.viewerCount);
        setPeakViewers(data.session.peakViewers);
      });

      // Listen for viewer updates
      socket.on('viewers:update', (data) => {
        setViewers(data.count);
        setPeakViewers(data.peakViewers);
      });

      // Listen for session ended
      socket.on('session:ended', () => {
        alert('This session has ended. Thank you for watching!');
      });

      // Cleanup on unmount
      return () => {
        if (hasJoined) {
          socket.emit('leave:session', { sessionId: session._id });
        }
        socket.off('session:joined');
        socket.off('viewers:update');
        socket.off('session:ended');
      };
    }
  }, [session, userName]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!session) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">📺</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Live Session</h3>
        <p className="text-gray-600">Check back soon for our next live session!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Live Indicator */}
      <div className="bg-linear-to-r from-red-600 to-pink-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="font-bold text-lg">LIVE</span>
            </div>
            <div className="text-sm opacity-90">
              👥 {viewers} {viewers === 1 ? 'viewer' : 'viewers'}
            </div>
          </div>
          <div className="text-sm opacity-90">
            Peak: {peakViewers} viewers
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{session.title}</h2>
        {session.description && (
          <p className="text-gray-600 mb-3">{session.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold">👤 Host:</span>
            <span>{session.hostName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">🕐 Started:</span>
            <span>{formatDate(session.startTime)}</span>
          </div>
        </div>
      </div>

      {/* Video/Stream Placeholder */}
      <div className="relative bg-linear-to-br from-purple-900 via-purple-700 to-pink-600 aspect-video">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎥</div>
            <h3 className="text-2xl font-bold mb-2">Live Stream</h3>
            <p className="text-purple-200">Video streaming would go here</p>
            <p className="text-sm text-purple-300 mt-2">
              (In production, will integrate with video streaming service)
            </p>
          </div>
        </div>
        
        {/* Floating Stats */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-4 py-2 text-white">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <span>👥</span>
              <span className="font-semibold">{viewers}</span>
            </div>
            <div className="w-px h-4 bg-white opacity-30"></div>
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="font-semibold">{peakViewers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 divide-x bg-gray-50">
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {session.products?.length || 0}
          </div>
          <div className="text-xs text-gray-600">Products</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-pink-600">
            {session.totalReactions || 0}
          </div>
          <div className="text-xs text-gray-600">Reactions</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {session.totalQuestions || 0}
          </div>
          <div className="text-xs text-gray-600">Questions</div>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionViewer;