import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Top navigation bar with auth-aware links
const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-purple-600">LiveCommerce</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/viewer"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Watch Live
            </Link>
            <Link
              to="/analytics"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              Analytics
            </Link>
            
            {user ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4 border-l pl-6">
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 border-l pl-6">
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;