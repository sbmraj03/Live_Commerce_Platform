import { useState } from 'react';
import { Link } from 'react-router-dom';

const SessionCard = ({ session, onStart, onEnd, onEdit, onDelete }) => {
    const [isLoading, setIsLoading] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'live':
                return 'bg-red-500 animate-pulse';
            case 'scheduled':
                return 'bg-yellow-500';
            case 'ended':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const handleStart = async () => {
        setIsLoading(true);
        await onStart(session._id);
        setIsLoading(false);
    };

    const handleEnd = async () => {
        if (window.confirm('Are you sure you want to end this live session?')) {
            setIsLoading(true);
            await onEnd(session._id);
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${session.title}"?`)) {
            setIsLoading(true);
            await onDelete(session._id);
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Status Badge */}
            <div className="relative">
                <div className="h-2 bg-linear-to-r from-purple-500 to-blue-500"></div>
                <div className="absolute top-4 right-4">
                    <span className={`${getStatusColor(session.status)} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2`}>
                        {session.status === 'live' && (
                            <span className="w-2 h-2 bg-white rounded-full"></span>
                        )}
                        {getStatusText(session.status)}
                    </span>
                </div>
            </div>

            <div className="p-6">
                {/* Title and Description */}
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {session.title}
                </h3>
                {session.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {session.description}
                    </p>
                )}

                {/* Host and Time Info */}
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">👤 Host:</span>
                        <span>{session.hostName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="font-semibold">🕐 Start:</span>
                        <span>{formatDate(session.startTime)}</span>
                    </div>
                    {session.endTime && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <span className="font-semibold">🕐 End:</span>
                            <span>{formatDate(session.endTime)}</span>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                            {session.products?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {session.peakViewers || 0}
                        </div>
                        <div className="text-xs text-gray-600">Peak Viewers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {session.totalReactions || 0}
                        </div>
                        <div className="text-xs text-gray-600">Reactions</div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                    {session.status === 'scheduled' && (
                        <>
                            <button
                                onClick={handleStart}
                                disabled={isLoading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '🔄 Starting...' : '🎥 Start Session'}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onEdit(session)}
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}

                    {session.status === 'live' && (
                        <>
                            <Link
                                to={`/admin/session/${session._id}/control`}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors text-center block mb-2"
                            >
                                🎛️ Control Panel
                            </Link>
                            <button
                                onClick={handleEnd}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '🔄 Ending...' : '🛑 End Session'}
                            </button>
                        </>
                    )}

                    {session.status === 'ended' && (
                        <div className="space-y-2">
                            <button
                                disabled
                                className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                            >
                                ✓ Session Ended
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionCard;