import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


import Login from "./Login";
import Dashboard from "./Dashboard";
import CreateVideo from "./CreateVideo";
import WatchVideos from "./WatchVideos";
import WatchVideo from "./WatchVideo";
import DeleteVideo from "./DeleteVideo";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />


                <Route
                    path="/login"
                    element={<Login />}
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

            </Routes>
        </BrowserRouter>
    );
}

export default App;