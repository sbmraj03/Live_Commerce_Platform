import { useState, useEffect } from 'react';
import socketService from '../../services/socket';
import api from '../../services/api';

const LiveControlPanel = ({ session }) => {
  const [questions, setQuestions] = useState([]);
  const [highlightedProduct, setHighlightedProduct] = useState(null);
  const [currentViewers, setCurrentViewers] = useState(0);
  const [answerText, setAnswerText] = useState({});

  useEffect(() => {
    if (session && session.status === 'live') {
      // Initialize from server state to keep admin UI in sync
      setHighlightedProduct(session.highlightedProduct || null);
      const socket = socketService.connect();

      // Join session as admin
      socket.emit('admin:join', { sessionId: session._id });

      // Listen for questions
      socket.on('question:new', (data) => {
        setQuestions(prev => [data, ...prev]);
      });

      // Listen for viewer updates
      socket.on('viewers:update', (data) => {
        setCurrentViewers(data.count);
      });

      // Fetch existing questions
      fetchQuestions();

      return () => {
        socket.emit('admin:leave', { sessionId: session._id });
        socket.off('question:new');
        socket.off('viewers:update');
      };
    }
  }, [session]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get(`/api/sessions/${session._id}/questions`);
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswerQuestion = async (questionId) => {
    const answer = answerText[questionId];
    if (!answer || !answer.trim()) {
      alert('Please enter an answer');
      return;
    }

    try {
      const socket = socketService.getSocket();
      socket.emit('question:answer', {
        questionId,
        answer: answer.trim()
      });

      // Clear answer text
      setAnswerText(prev => ({ ...prev, [questionId]: '' }));

      // Update local state
      setQuestions(prev =>
        prev.map(q => q.id === questionId ? { ...q, isAnswered: true, answer: answer.trim() } : q)
      );
    } catch (error) {
      console.error('Error answering question:', error);
      alert('Failed to answer question');
    }
  };

  const handleHighlightProduct = (productId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('product:highlight', {
        sessionId: session._id,
        productId
      });
      setHighlightedProduct(productId);
    }
  };

  const handleClearHighlight = () => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('product:highlight', {
        sessionId: session._id,
        productId: null
      });
      setHighlightedProduct(null);
    }
  };

  if (!session || session.status !== 'live') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-yellow-800 font-semibold">
          Control panel is only available during live sessions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Stats */}
      <div className="bg-linear-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 bg-white rounded-full animate-pulse"></span>
            <h2 className="text-2xl font-bold">LIVE CONTROL PANEL</h2>
          </div>
          <div className="text-xl font-bold">
            👥 {currentViewers} viewers
          </div>
        </div>
        <p className="text-red-100">{session.title}</p>
      </div>

      {/* Product Highlighting */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-purple-600 p-4">
          <h3 className="text-white font-bold text-lg">📦 Highlight Products</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {session.products && session.products.length > 0 ? (
              session.products.map((product) => (
                <div
                  key={product._id}
                  className={`flex items-center gap-4 p-3 rounded-lg border-2 transition-all ${
                    highlightedProduct === product._id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{product.name}</h4>
                    <p className="text-purple-600 font-bold">₹{product.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() =>
                      highlightedProduct === product._id
                        ? handleClearHighlight()
                        : handleHighlightProduct(product._id)
                    }
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      highlightedProduct === product._id
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {highlightedProduct === product._id ? 'Clear' : 'Highlight'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products in this session</p>
            )}
          </div>
        </div>
      </div>

      {/* Questions Management */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-4">
          <h3 className="text-white font-bold text-lg">
            ❓ Questions ({questions.length})
          </h3>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {questions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No questions yet</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-lg border-2 ${
                    q.isAnswered
                      ? 'border-green-300 bg-green-50'
                      : 'border-yellow-300 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-gray-800">{q.userName}</p>
                      <p className="text-gray-700 mt-1">{q.question}</p>
                    </div>
                    <span className="text-sm text-gray-600">
                      👍 {q.likes || 0}
                    </span>
                  </div>

                  {q.isAnswered ? (
                    <div className="mt-3 p-3 bg-green-100 rounded">
                      <p className="text-sm font-semibold text-green-700 mb-1">
                        ✓ Your Answer:
                      </p>
                      <p className="text-sm text-gray-700">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <textarea
                        value={answerText[q.id] || ''}
                        onChange={(e) =>
                          setAnswerText(prev => ({ ...prev, [q.id]: e.target.value }))
                        }
                        placeholder="Type your answer..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <button
                        onClick={() => handleAnswerQuestion(q.id)}
                        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        Answer Question
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveControlPanel;