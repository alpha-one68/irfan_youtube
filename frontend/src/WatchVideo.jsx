
import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./WatchVideo.css";
import { apiFetch } from "./api";
import { getVideoUrl } from "./videoUrl";

function WatchVideo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playbackError, setPlaybackError] =
    useState("");

  // Fetch video details
  useEffect(() => {
    let cancelled = false;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError("");
        setPlaybackError("");
        setVideo(null);

        const response = await apiFetch(
          `/watch-videos/${id}/`
        );

        if (cancelled) return;

        if (response.status === 401) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        if (response.status === 404) {
          throw new Error("Video not found.");
        }

        if (!response.ok) {
          throw new Error(
            "Unable to load this video."
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setVideo(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Fetch video error:",
            err
          );

          setError(
            err.message ||
            "Unable to load this video."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchVideo();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  // LOADING
  if (loading) {
    return (
      <div className="player-loading">
        <div className="loading-spinner"></div>
        <p>Loading video...</p>
      </div>
    );
  }

  // ERROR
  if (error || !video) {
    return (
      <div className="player-error">

        <div className="error-box">
          <div className="error-icon">!</div>

          <h2>
            {error || "Video not found"}
          </h2>

          <p>
            The video you're looking for may have
            been removed or doesn't exist.
          </p>

          <button
            onClick={() =>
              navigate("/watch-videos")
            }
          >
            ← Back to Videos
          </button>
        </div>

      </div>
    );
  }

  // Correct video URL
  const videoUrl = getVideoUrl(video.video);

  return (
    <div className="watch-video-page">

      {/* NAVBAR */}
      <nav className="player-navbar">

        <div
          className="watch-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <div className="watch-logo-icon">
            ▶
          </div>

          <span>
            Family<span>Tube</span>
          </span>
        </div>

        <div className="player-navbar-actions">
          <button
            onClick={() =>
              navigate("/watch-videos")
            }
          >
            ← Videos
          </button>
        </div>

      </nav>

      {/* MAIN */}
      <main className="player-container">

        {/* VIDEO PLAYER */}
        <div className="player-wrapper">

          {videoUrl ? (
            <video
              key={videoUrl}
              className="main-video"
              src={videoUrl}
              controls
              autoPlay
              preload="metadata"
              playsInline
              onError={() => {
                setPlaybackError(
                  "Unable to play this video. The file may be unavailable."
                );
              }}
            />
          ) : (
            <p>
              No video file available.
            </p>
          )}

          {playbackError && (
            <p role="alert">
              {playbackError}
            </p>
          )}

        </div>

        {/* VIDEO DETAILS */}
        <section className="video-page-info">

          <h1>{video.title}</h1>

          {/* ORIGINAL FILENAME */}
          {video.original_filename && (
            <p className="original-name">
              {video.original_filename}
            </p>
          )}

          {/* METADATA */}
          <div className="video-meta">

            <span>FamilyTube</span>
            <span>•</span>

            {video.created_at && (
              <span>
                {new Date(
                  video.created_at
                ).toLocaleDateString()}
              </span>
            )}

          </div>

          {/* DESCRIPTION */}
          <div className="video-description-box">
            <p>
              {video.description}
            </p>
          </div>

          {/* DELETE BUTTON */}
          <button
            className="delete-video-btn"
            onClick={() =>
              navigate(
                `/delete-video/${video.id}`
              )
            }
          >
            🗑 Delete Video
          </button>

        </section>

      </main>
    </div>
  );
}

export default WatchVideo;
