import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProblemList from './pages/ProblemList';
import ProblemDetail from './pages/ProblemDetail';
import Submissions from './pages/Submissions';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

import Leaderboard from './pages/Leaderboard';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProblemForm from './pages/admin/AdminProblemForm';
import AdminTestCases from './pages/admin/AdminTestCases';

import Contests from './pages/contests/Contests';
import ContestDetail from './pages/contests/ContestDetail';
import ContestScoreboard from './pages/contests/ContestScoreboard';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/problems" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/problems" element={<ProblemList />} />
      <Route path="/problems/:slug" element={<ProblemDetail />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/contests/:slug" element={<ContestDetail />} />
      <Route path="/contests/:slug/scoreboard" element={<ContestScoreboard />} />
      
      {/* Admin Routes */}
      <Route path="/admin/problems" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/problems/new" element={<ProtectedRoute><AdminProblemForm /></ProtectedRoute>} />
      <Route path="/admin/problems/:slug/edit" element={<ProtectedRoute><AdminProblemForm /></ProtectedRoute>} />
      <Route path="/admin/problems/:slug/testcases" element={<ProtectedRoute><AdminTestCases /></ProtectedRoute>} />

      <Route
        path="/submissions"
        element={
          <ProtectedRoute>
            <Submissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/problems" replace />} />
    </Routes>
  );
}
