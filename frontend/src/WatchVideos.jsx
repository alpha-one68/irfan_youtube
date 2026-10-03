import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WatchVideos.css";
import { apiFetch } from "./api";

function WatchVideos() {
    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Django backend URL
    const BACKEND_URL = "http://127.0.0.1:8000";

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/watch-videos/");

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("access_token");
                    navigate("/login");
                    return;
                }

                throw new Error("Failed to load videos");
            }

            const data = await response.json();

            console.log("VIDEO DATA:", data);

            setVideos(data);

        } catch (error) {
            console.error("Video fetch error:", error);

            setError("Unable to load videos.");

        } finally {
            setLoading(false);
        }
    };

    // Convert Django media path to a proper local URL
    const getVideoUrl = (videoUrl) => {
        if (!videoUrl) {
            return "";
        }

        // If Django already returned a complete URL
        if (videoUrl.startsWith("http://")) {
            return videoUrl;
        }

        // If Django incorrectly returned HTTPS locally,
        // convert it to HTTP for the development server.
        if (videoUrl.startsWith("https://127.0.0.1:8000")) {
            return videoUrl.replace(
                "https://127.0.0.1:8000",
                BACKEND_URL
            );
        }

        if (videoUrl.startsWith("https://localhost:8000")) {
            return videoUrl.replace(
                "https://localhost:8000",
                BACKEND_URL
            );
        }

        // Relative URL such as:
        // /media/videos/example.mp4
        if (videoUrl.startsWith("/")) {
            return `${BACKEND_URL}${videoUrl}`;
        }

        // Fallback
        return `${BACKEND_URL}/${videoUrl}`;
    };

    return (
        <div className="watch-page">

            {/* Navbar */}

            <nav className="watch-navbar">

                <div
                    className="watch-logo"
                    onClick={() => navigate("/dashboard")}
                >
                    <div className="watch-logo-icon">
                        ▶
                    </div>

                    <span>
                        Family<span>Tube</span>
                    </span>
                </div>

                <div className="watch-navbar-right">

                    <button
                        onClick={() =>
                            navigate("/create-video")
                        }
                    >
                        + Create
                    </button>

                    <button
                        onClick={() =>
                            navigate("/dashboard")
                        }
                    >
                        Dashboard
                    </button>

                </div>

            </nav>


            {/* Main */}

            <main className="watch-container">

                <div className="watch-header">

                    <div>
                        <h1>
                            Watch Videos
                        </h1>

                        <p>
                            Discover videos on FamilyTube.
                        </p>
                    </div>

                </div>


                {/* Loading */}

                {loading && (
                    <div className="watch-loading">

                        <div className="watch-spinner"></div>

                        <p>
                            Loading videos...
                        </p>

                    </div>
                )}


                {/* Error */}

                {!loading && error && (
                    <div className="watch-error">

                        <p>
                            {error}
                        </p>

                        <button
                            onClick={fetchVideos}
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* Empty */}

                {!loading &&
                    !error &&
                    videos.length === 0 && (

                        <div className="empty-videos">

                            <div>
                                ▶
                            </div>

                            <h2>
                                No videos yet
                            </h2>

                            <p>
                                Upload your first video
                                to FamilyTube.
                            </p>

                            <button
                                onClick={() =>
                                    navigate("/create-video")
                                }
                            >
                                Create Video
                            </button>

                        </div>
                    )}


                {/* Video Grid */}

                {!loading &&
                    !error &&
                    videos.length > 0 && (

                        <div className="video-grid">

                            {videos.map((video) => {

                                const videoUrl =
                                    getVideoUrl(video.video);

                                console.log(
                                    "Video URL:",
                                    videoUrl
                                );

                                return (
                                    <article
                                        className="video-card"
                                        key={video.id}
                                        onClick={() =>
                                            navigate(
                                                `/watch-videos/${video.id}`
                                            )
                                        }
                                    >

                                        {/* Video Preview */}

                                        <div
                                            className="video-thumbnail"
                                            onMouseEnter={(e) => {

                                                const videoElement =
                                                    e.currentTarget.querySelector(
                                                        "video"
                                                    );

                                                if (videoElement) {

                                                    videoElement
                                                        .play()
                                                        .catch(
                                                            (error) => {
                                                                console.log(
                                                                    "Preview play blocked:",
                                                                    error
                                                                );
                                                            }
                                                        );
                                                }
                                            }}
                                            onMouseLeave={(e) => {

                                                const videoElement =
                                                    e.currentTarget.querySelector(
                                                        "video"
                                                    );

                                                if (videoElement) {

                                                    videoElement.pause();

                                                    videoElement.currentTime = 0;
                                                }
                                            }}
                                        >

                                            <video
                                                src={videoUrl}
                                                preload="metadata"
                                                muted
                                                playsInline
                                            />

                                            <div className="play-overlay">
                                                ▶
                                            </div>

                                        </div>


                                        {/* Details */}

                                        <div className="video-details">

                                            <div className="video-avatar">
                                                F
                                            </div>

                                            <div className="video-info">

                                                <h2>
                                                    {video.title}
                                                </h2>

                                                <p className="video-description">
                                                    {video.description}
                                                </p>

                                                <p className="video-filename">
                                                    {video.original_filename}
                                                </p>

                                            </div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>
                    )}

            </main>

        </div>
    );
}

export default WatchVideos;