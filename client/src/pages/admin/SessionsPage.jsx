import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SessionCard from '../../components/admin/SessionCard';
import SessionFormModal from '../../components/admin/SessionFormModal';

const SessionsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filter, setFilter] = useState('all');

    // Fetch sessions and products
    const fetchData = async () => {
        try {
            setLoading(true);
            const [sessionsRes, productsRes] = await Promise.all([
                api.get('/api/sessions'),
                api.get('/api/products')
            ]);

            setSessions(sessionsRes.data.data);
            setProducts(productsRes.data.data.filter(p => p.isActive));
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle Create Session
    const handleCreateSession = async (formData) => {
        try {
            setIsSubmitting(true);
            await api.post('/api/sessions', formData);
            alert('Session created successfully!');
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Error creating session:', error);
            alert(error.response?.data?.error || 'Failed to create session');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Edit Session
    const handleEditSession = async (formData) => {
        try {
            setIsSubmitting(true);
            await api.put(`/api/sessions/${selectedSession._id}`, formData);
            alert('Session updated successfully!');
            setIsModalOpen(false);
            setSelectedSession(null);
            fetchData();
        } catch (error) {
            console.error('Error updating session:', error);
            alert(error.response?.data?.error || 'Failed to update session');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Start Session
    const handleStartSession = async (sessionId) => {
        try {
            await api.put(`/api/sessions/${sessionId}/start`);
            alert('Session started successfully! 🎥');
            fetchData();
        } catch (error) {
            console.error('Error starting session:', error);
            alert(error.response?.data?.error || 'Failed to start session');
        }
    };

    // Handle End Session
    const handleEndSession = async (sessionId) => {
        try {
            await api.put(`/api/sessions/${sessionId}/end`);
            alert('Session ended successfully!');
            fetchData();
        } catch (error) {
            console.error('Error ending session:', error);
            alert(error.response?.data?.error || 'Failed to end session');
        }
    };

    // Handle Delete Session
    const handleDeleteSession = async (sessionId) => {
        try {
            await api.delete(`/api/sessions/${sessionId}`);
            alert('Session deleted successfully!');
            fetchData();
        } catch (error) {
            console.error('Error deleting session:', error);
            alert(error.response?.data?.error || 'Failed to delete session');
        }
    };

    // Open Edit Modal
    const openEditModal = (session) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    // Close Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
    };

    // Filter sessions
    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true;
        return session.status === filter;
    });

    // Get stats
    const stats = {
        total: sessions.length,
        live: sessions.filter(s => s.status === 'live').length,
        scheduled: sessions.filter(s => s.status === 'scheduled').length,
        ended: sessions.filter(s => s.status === 'ended').length
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Live Sessions</h1>
                            <p className="text-gray-600 mt-1">Manage your live commerce sessions</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="/admin"
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Total Sessions</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                            </div>
                            <div className="text-4xl">📊</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Live Now</p>
                                <p className="text-3xl font-bold text-red-600">{stats.live}</p>
                            </div>
                            <div className="text-4xl">🔴</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Scheduled</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.scheduled}</p>
                            </div>
                            <div className="text-4xl">📅</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">Ended</p>
                                <p className="text-3xl font-bold text-gray-600">{stats.ended}</p>
                            </div>
                            <div className="text-4xl">✓</div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('live')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'live'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                🔴 Live ({stats.live})
                            </button>
                            <button
                                onClick={() => setFilter('scheduled')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'scheduled'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Scheduled ({stats.scheduled})
                            </button>
                            <button
                                onClick={() => setFilter('ended')}
                                className={`px-4 py-2 rounded-lg transition-colors ${filter === 'ended'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Ended ({stats.ended})
                            </button>
                        </div>

                        {/* Create Session Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                        >
                            + Create Session
                        </button>
                    </div>
                </div>

                {/* Sessions Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading sessions...</p>
                        </div>
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="text-6xl mb-4">🎥</div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                            {filter === 'all' ? 'No Sessions Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Sessions`}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? 'Get started by creating your first live session'
                                : 'Try selecting a different filter'}
                        </p>
                        {filter === 'all' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Create Your First Session
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSessions.map(session => (
                            <SessionCard
                                key={session._id}
                                session={session}
                                onStart={handleStartSession}
                                onEnd={handleEndSession}
                                onEdit={openEditModal}
                                onDelete={handleDeleteSession}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Session Form Modal */}
            <SessionFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={selectedSession ? handleEditSession : handleCreateSession}
                session={selectedSession}
                products={products}
                isLoading={isSubmitting}
            />
        </div>
    );
};

export default SessionsPage;