// Viewer-side Q&A: send/receive questions in realtime
import { useState, useEffect } from 'react';
import socketService from '../../services/socket';
import api from '../../services/api';

const QuestionsPanel = ({ sessionId, userName }) => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Fetch existing questions (for page reloads/reconnects)
  const fetchQuestions = async () => {
    if (!sessionId) return;
    try {
      const res = await api.get(`/api/sessions/${sessionId}/questions`);
      setQuestions(res.data.data || []);
    } catch (err) {
      // Keep silent in UI; console for debugging
      console.error('Failed to load existing questions', err);
    }
  };

  useEffect(() => {
    const socket = socketService.getSocket();

    // Initial fetch on mount
    fetchQuestions();

    if (socket) {
      // Re-populate on reconnect
      const onConnect = () => fetchQuestions();
      socket.on('connect', onConnect);

      // Listen for new questions
      socket.on('question:new', (data) => {
        setQuestions(prev => [data, ...prev]);
      });

      // Listen for answered questions
      socket.on('question:answered', (data) => {
        setQuestions(prev =>
          prev.map(q => q.id === data.id ? data : q)
        );
      });

      // Listen for question likes
      socket.on('question:liked', (data) => {
        setQuestions(prev =>
          prev.map(q => q.id === data.id ? { ...q, likes: data.likes } : q)
        );
      });

      return () => {
        socket.off('connect', onConnect);
        socket.off('question:new');
        socket.off('question:answered');
        socket.off('question:liked');
      };
    }
  }, [sessionId]);

  const handleSendQuestion = () => {
    if (!newQuestion.trim() || isSending) return;

    const socket = socketService.getSocket();
    if (socket && sessionId) {
      setIsSending(true);
      
      socket.emit('question:send', {
        sessionId,
        question: newQuestion.trim(),
        userName
      });

      socket.once('question:sent', (data) => {
        if (data.success) {
          setNewQuestion('');
        }
        setIsSending(false);
      });
    }
  };

  const handleLikeQuestion = (questionId) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('question:like', { questionId });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-linear-to-r from-blue-600 to-purple-600 p-4">
        <h3 className="text-white font-bold text-lg">Q&A</h3>
      </div>

      {/* Question Input */}
      <div className="p-4 border-b">
        <textarea
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          disabled={isSending}
        />
        <button
          onClick={handleSendQuestion}
          disabled={!newQuestion.trim() || isSending}
          className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? 'Sending...' : 'Ask Question'}
        </button>
      </div>

      {/* Questions List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {questions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No questions yet. Be the first to ask!
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div
                key={q.id}
                className={`p-4 rounded-lg ${
                  q.isAnswered ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
                }`}
              >
                {/* Question */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {q.userName}
                    </p>
                    <p className="text-gray-700 mt-1">{q.question}</p>
                  </div>
                  <button
                    onClick={() => handleLikeQuestion(q.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 transition-colors"
                  >
                    <span>👍</span>
                    <span className="font-semibold">{q.likes || 0}</span>
                  </button>
                </div>

                {/* Answer */}
                {q.isAnswered && q.answer && (
                  <div className="mt-3 pl-4 border-l-4 border-green-500">
                    <p className="text-sm font-semibold text-green-700 mb-1">
                      ✓ Answered by Host:
                    </p>
                    <p className="text-sm text-gray-700">{q.answer}</p>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(q.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPanel;