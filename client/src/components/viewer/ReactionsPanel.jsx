// Viewer-side reactions (send/stream lightweight events)
import { useState, useEffect } from 'react';
import socketService from '../../services/socket';
import api from '../../services/api';

const ReactionsPanel = ({ sessionId, userName }) => {
  const [recentReactions, setRecentReactions] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const reactions = [
    { type: 'love', emoji: '❤️', label: 'love' },
    { type: 'fire', emoji: '🔥', label: 'fire' },
    { type: 'best', emoji: '👌', label: 'best' },
    { type: 'laugh', emoji: '😂', label: 'laugh' },
    { type: 'wow', emoji: '😮', label: 'wow' },
    { type: 'disagree', emoji: '👎', label: 'disagree' },
    { type: 'angry', emoji: '😠', label: 'angry' },
    { type: 'cry', emoji: '😭', label: 'cry' },
    
  ];

  const fetchReactions = async () => {
    if (!sessionId) return;
    try {
      const res = await api.get(`/api/sessions/${sessionId}/reactions`, {
        params: { limit: 20 }
      });
      setRecentReactions(res.data.data || []);
    } catch (err) {
      console.error('Failed to load recent reactions', err);
    }
  };

  useEffect(() => {
    const socket = socketService.getSocket();

    // Initial fetch
    fetchReactions();

    if (socket) {
      const onConnect = () => fetchReactions();
      socket.on('connect', onConnect);

      socket.on('reaction:new', (data) => {
        // Add reaction to recent list
        setRecentReactions(prev => [
          { ...data },
          ...prev.slice(0, 19) // Keep last 20
        ]);
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('reaction:new');
      };
    }
  }, [sessionId]);

  const handleReaction = (type) => {
    const socket = socketService.getSocket();
    if (socket && sessionId) {
      socket.emit('reaction:send', {
        sessionId,
        type,
        userName
      });

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-linear-to-r from-pink-600 to-purple-600 p-4">
        <h3 className="text-white font-bold text-lg">Send Reactions</h3>
      </div>

      {/* Reaction Buttons */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={`flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-purple-50 rounded-lg transition-all border-2 border-transparent hover:border-purple-300 ${
                isAnimating ? 'scale-95' : ''
              }`}
            >
              <span className="text-3xl mb-1">{reaction.emoji}</span>
              <span className="text-xs font-semibold text-gray-700">
                {reaction.label}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Reactions Feed */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Recent Reactions
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentReactions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No reactions yet. Be the first!
              </p>
            ) : (
              recentReactions.map((reaction) => (
                <div
                  key={reaction.id}
                  className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded animate-fade-in"
                >
                  <span className="text-xl">{
                    reactions.find(r => r.type === reaction.type)?.emoji
                  }</span>
                  <span className="text-gray-700">
                    <span className="font-semibold">{reaction.userName}</span>
                    {' '}reacted
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactionsPanel;