
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateVideo from "./CreateVideo";
import WatchVideos from "./WatchVideos";
import WatchVideo from "./WatchVideo";
import DeleteVideo from "./DeleteVideo";

// Protect pages that require login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-video"
          element={
            <ProtectedRoute>
              <CreateVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watch-videos"
          element={
            <ProtectedRoute>
              <WatchVideos />
            </ProtectedRoute>
          }
        />

        <Route
          path="/watch-videos/:id"
          element={
            <ProtectedRoute>
              <WatchVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="/delete-video/:id"
          element={
            <ProtectedRoute>
              <DeleteVideo />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
