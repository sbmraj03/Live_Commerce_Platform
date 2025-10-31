import { useState, useEffect } from 'react';
import api from '../../services/api';

const DetailedAnalyticsModal = ({ isOpen, onClose, sessionId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchAnalytics();
      setAiInsight('');
      setAiError('');
    }
  }, [isOpen, sessionId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/analytics/session/${sessionId}`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (!sessionId) return;
    setAiLoading(true);
    setAiError('');
    try {
      const response = await api.post(`/api/analytics/session/${sessionId}/insight`);
      setAiInsight(response.data?.data?.insight || '');
    } catch (err) {
      console.error('AI insight error:', err);
      setAiError('Failed to get AI insight.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-500 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b z-10 flex items-center justify-between p-6">
          <h2 className="text-2xl font-bold text-gray-800">Detailed Analytics</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={askAI}
              className="px-4 py-2 w-30 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-60"
              disabled={aiLoading}
            >
              {aiLoading ? 'Asking AI…' : 'Ask AI'}
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        ) : analytics ? (
          <div className="p-6 space-y-6">
            {/* AI Insight (if any) */}
            {(aiInsight || aiError) && (
              <div className={`p-4 rounded-lg ${aiError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                <h4 className="font-semibold mb-1">AI Summary</h4>
                <p className="text-sm text-gray-800 whitespace-pre-line">{aiError || aiInsight}</p>
              </div>
            )}

            {/* Session Info */}
            <div className="bg-linear-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{analytics.session.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="opacity-80">Status:</span>
                  <span className="ml-2 font-semibold">{analytics.session.status.toUpperCase()}</span>
                </div>
                <div>
                  <span className="opacity-80">Start Time:</span>
                  <span className="ml-2 font-semibold">
                    {new Date(analytics.session.startTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Viewer Stats */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">👥 Viewer Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {analytics.viewers.current}
                  </div>
                  <div className="text-sm text-gray-600">Current Viewers</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {analytics.viewers.peak}
                  </div>
                  <div className="text-sm text-gray-600">Peak Viewers</div>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-3">📊 Engagement Metrics</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-pink-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-pink-600">
                    {analytics.engagement.totalReactions}
                  </div>
                  <div className="text-sm text-gray-600">Total Reactions</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analytics.engagement.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {analytics.engagement.answeredQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Answered</div>
                </div>
              </div>

              {/* Reaction Breakdown */}
              {Object.keys(analytics.engagement.reactionBreakdown).length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-gray-700 mb-3">Reaction Breakdown</h5>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(analytics.engagement.reactionBreakdown).map(([type, count]) => {
                      const emojis = {
                        love: '❤️',
                        fire: '🔥',
                        best: '👌',
                        laugh: '😂',
                        wow: '😮',
                        disagree: '👎',
                        angry: '😠',
                        cry: '😭'
                      };
                      return (
                        <div key={type} className="bg-white p-3 rounded text-center">
                          <div className="text-2xl mb-1">{emojis[type]}</div>
                          <div className="text-lg font-bold text-gray-800">{count}</div>
                          <div className="text-xs text-gray-600 capitalize">{type}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Top Questions */}
            {analytics.topQuestions && analytics.topQuestions.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">❓ Top Questions</h4>
                <div className="space-y-3">
                  {analytics.topQuestions.map((q, index) => (
                    <div key={q._id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-1">
                            {q.userName}
                          </p>
                          <p className="text-gray-700 mb-2">{q.question}</p>
                          {q.isAnswered && q.answer && (
                            <div className="bg-green-50 border-l-4 border-green-500 p-3 mt-2">
                              <p className="text-sm font-semibold text-green-700 mb-1">
                                ✓ Answer:
                              </p>
                              <p className="text-sm text-gray-700">{q.answer}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>👍 {q.likes} likes</span>
                            {q.isAnswered && (
                              <span className="text-green-600 font-semibold">✓ Answered</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Featured Products */}
            {analytics.products && analytics.products.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-3">
                  📦 Featured Products ({analytics.products.length})
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {analytics.products.map((product) => (
                    <div key={product._id} className="bg-gray-50 rounded-lg p-4 flex gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100';
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                          {product.name}
                        </h5>
                        <p className="text-lg font-bold text-purple-600">
                         ₹{product.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Stock: {product.stock}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-600">
            No analytics data available
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t p-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailedAnalyticsModal;