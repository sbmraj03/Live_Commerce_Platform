// Landing page with quick links and auth shortcuts
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-400 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Live Commerce Platform
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Real-time product showcases and interactive engagement
        </p>

        {/* User Info */}
        {user ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                {isAdmin() && (
                  <span className="inline-block mt-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-center text-gray-700 mb-3">
              Sign in to access all features
            </p>
            <div className="flex gap-2">
              <Link
                to="/login"
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition duration-200"
              >
                Register
              </Link>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <div className="space-y-4">
          {isAdmin() && (
            <Link
              to="/admin"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200"
            >
              🎛️ Admin Dashboard
            </Link>
          )}
          
          <Link
            to="/viewer"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200"
          >
            📺 Join as Viewer
          </Link>
          
          <Link
            to="/analytics"
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition duration-200"
          >
            📊 Analytics Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;