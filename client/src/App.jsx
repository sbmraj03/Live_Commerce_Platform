// App routes and auth-protected sections
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import SessionsPage from './pages/admin/SessionsPage';
import LiveSessionControl from './pages/admin/LiveSessionControl';
import ViewerPage from './pages/viewer/ViewerPage';
import Analytics from './pages/Analytics';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sessions"
          element={
            <ProtectedRoute adminOnly>
              <SessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/session/:sessionId/control"
          element={
            <ProtectedRoute adminOnly>
              <LiveSessionControl />
            </ProtectedRoute>
          }
        />
        
        {/* Public Routes */}
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
}

export default App;