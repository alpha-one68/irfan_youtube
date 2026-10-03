import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateVideo from "./CreateVideo";
import WatchVideos from "./WatchVideos";
import WatchVideo from "./WatchVideo";
import DeleteVideo from "./DeleteVideo";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/create-video"
                    element={<CreateVideo />}
                />

                <Route
                    path="/watch-videos"
                    element={<WatchVideos />}
                />

                <Route
                    path="/watch-videos/:id"
                    element={<WatchVideo />}
                />

                <Route
                    path="/delete-video/:id"
                    element={<DeleteVideo />}
                />

                <Route
                    path="*"
                    element={<Navigate to="/login" replace />}
                />
                <Route
    path="/reset-password/:uid/:token/"
    element={<ResetPassword />}
/>

            </Routes>
        </BrowserRouter>
    );
}

export default App;