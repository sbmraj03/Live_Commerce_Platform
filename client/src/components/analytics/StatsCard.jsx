const StatsCard = ({ icon, label, value, subtitle, color = 'purple' }) => {
    const colorClasses = {
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      pink: 'bg-pink-100 text-pink-600'
    };
  
    return (
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-2xl`}>
            {icon}
          </div>
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
        <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    );
  };
  
  export default StatsCard;