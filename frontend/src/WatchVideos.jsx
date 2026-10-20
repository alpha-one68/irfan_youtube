
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./WatchVideos.css";
import { apiFetch } from "./api";
import { getVideoUrl } from "./videoUrl";

function WatchVideos() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        "/watch-videos/"
      );

      if (response.status === 401) {
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load videos.");
      }

      const data = await response.json();

      // Supports a list or paginated DRF response
      const videoList = Array.isArray(data)
        ? data
        : Array.isArray(data.results)
        ? data.results
        : [];

      setVideos(videoList);
    } catch (err) {
      console.error("Video fetch error:", err);
      setError("Unable to load videos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Preview on hover
  const handlePreviewStart = (event) => {
    const player =
      event.currentTarget.querySelector("video");

    if (player) {
      player.play().catch(() => {});
    }
  };

  const handlePreviewStop = (event) => {
    const player =
      event.currentTarget.querySelector("video");

    if (player) {
      player.pause();
      player.currentTime = 0;
    }
  };

  return (
    <div className="watch-page">

      {/* NAVBAR */}
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
            onClick={() => navigate("/create-video")}
          >
            + Create
          </button>

          <button
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="watch-container">

        <div className="watch-header">
          <div>
            <h1>Watch Videos</h1>

            <p>
              Discover videos on FamilyTube.
            </p>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="watch-loading">
            <div className="watch-spinner"></div>
            <p>Loading videos...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="watch-error">
            <p>{error}</p>

            <button onClick={fetchVideos}>
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          !error &&
          videos.length === 0 && (
            <div className="empty-videos">
              <div>▶</div>

              <h2>No videos yet</h2>

              <p>
                Upload your first video to FamilyTube.
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

        {/* VIDEO GRID */}
        {!loading &&
          !error &&
          videos.length > 0 && (
            <div className="video-grid">

              {videos.map((video) => {
                const videoUrl = getVideoUrl(
                  video.video
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

                    {/* VIDEO THUMBNAIL */}
                    <div
                      className="video-thumbnail"
                      onMouseEnter={handlePreviewStart}
                      onMouseLeave={handlePreviewStop}
                    >
                      {videoUrl ? (
                        <video
                          src={videoUrl}
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <div className="video-placeholder">
                          ▶
                        </div>
                      )}

                      <div className="play-overlay">
                        ▶
                      </div>
                    </div>

                    {/* DETAILS */}
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

                        {video.original_filename && (
                          <p className="video-filename">
                            {video.original_filename}
                          </p>
                        )}

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
