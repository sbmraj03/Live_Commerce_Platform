const SessionAnalyticsCard = ({ session, onClick }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'live':
          return 'bg-red-500';
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
  
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
  
    const calculateDuration = () => {
      if (!session.startTime) return 'N/A';
      
      const start = new Date(session.startTime);
      const end = session.endTime ? new Date(session.endTime) : new Date();
      const diffMs = end - start;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins} min`;
      }
      
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    };
  
    const engagementRate = session.peakViewers > 0
      ? ((session.totalReactions + session.totalQuestions) / session.peakViewers).toFixed(1)
      : 0;
  
    return (
      <div 
        onClick={onClick}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-purple-600 to-blue-600 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg line-clamp-1">
              {session.title}
            </h3>
            <span className={`${getStatusColor(session.status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
              {getStatusText(session.status)}
            </span>
          </div>
        </div>
  
        {/* Content */}
        <div className="p-4">
          {/* Session Info */}
          <div className="mb-4 space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold">👤 Host:</span>
              <span>{session.hostName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">🕐 Date:</span>
              <span>{formatDate(session.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">⏱️ Duration:</span>
              <span>{calculateDuration()}</span>
            </div>
          </div>
  
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {session.peakViewers || 0}
              </div>
              <div className="text-xs text-gray-600">Peak Viewers</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {session.products?.length || 0}
              </div>
              <div className="text-xs text-gray-600">Products</div>
            </div>
            <div className="text-center p-3 bg-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-pink-600">
                {session.totalReactions || 0}
              </div>
              <div className="text-xs text-gray-600">Reactions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {session.totalQuestions || 0}
              </div>
              <div className="text-xs text-gray-600">Questions</div>
            </div>
          </div>
  
          {/* Engagement Rate */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Engagement Rate</span>
              <span className="text-lg font-bold text-purple-600">
                {engagementRate}x
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-linear-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default SessionAnalyticsCard;