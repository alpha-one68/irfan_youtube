
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DeleteVideo.css";
import { apiFetch } from "./api";

function DeleteVideo() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    // Get video details
    useEffect(() => {
        fetchVideo();
    }, [id]);

    const fetchVideo = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch(
                `/watch-videos/${id}/`
            );

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Unable to load video.");
            }

            const data = await response.json();

            setVideo(data);

        } catch (error) {
            console.error("Fetch video error:", error);
            setError("Unable to load video.");
        } finally {
            setLoading(false);
        }
    };

    // Delete video
    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this video?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            const response = await apiFetch(
                `/delete/${id}`,
                {
                    method: "DELETE",
                }
            );

            if (response.status === 401) {
                localStorage.removeItem("access_token");
                navigate("/login");
                return;
            }

            if (!response.ok) {
                let message = "Failed to delete video.";

                try {
                    const data = await response.json();

                    if (data.error) {
                        message = data.error;
                    }
                } catch {
                    // Response has no JSON body
                }

                throw new Error(message);
            }

            // Successfully deleted
            navigate("/watch-videos");

        } catch (error) {
            console.error("Delete video error:", error);

            setError(
                error.message || "Unable to delete video."
            );

        } finally {
            setDeleting(false);
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="delete-page">
                <div className="delete-loading">
                    <p>Loading video...</p>
                </div>
            </div>
        );
    }

    // Error
    if (error && !video) {
        return (
            <div className="delete-page">
                <div className="delete-error">
                    <h2>Something went wrong</h2>

                    <p>{error}</p>

                    <button
                        onClick={() =>
                            navigate("/watch-videos")
                        }
                    >
                        Back to Videos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="delete-page">

            {/* Navbar */}
            <nav className="delete-navbar">

                <div
                    className="delete-logo"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    <div className="delete-logo-icon">
                        ▶
                    </div>

                    <span>
                        Family<span>Tube</span>
                    </span>
                </div>

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/watch-videos")
                    }
                >
                    ← Back
                </button>

            </nav>

            {/* Main */}
            <main className="delete-container">

                <div className="delete-card">

                    <div className="warning-icon">
                        !
                    </div>

                    <h1>
                        Delete Video
                    </h1>

                    <p className="delete-warning">
                        Are you sure you want to delete
                        this video?
                    </p>

                    {/* Video */}
                    {video && (
                        <div className="delete-video-preview">

                            <video
                                src={video.video}
                                controls
                                preload="metadata"
                            />

                            <div className="delete-video-info">

                                <h2>
                                    {video.title}
                                </h2>

                                <p>
                                    {video.description}
                                </p>

                                {video.original_filename && (
                                    <span>
                                        {
                                            video.original_filename
                                        }
                                    </span>
                                )}

                            </div>

                        </div>
                    )}

                    {/* Warning */}
                    <div className="delete-danger">

                        <strong>
                            Warning
                        </strong>

                        <p>
                            This action cannot be undone.
                            The uploaded video will be
                            permanently deleted.
                        </p>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="delete-error-message">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="delete-actions">

                        <button
                            className="cancel-button"
                            onClick={() =>
                                navigate(
                                    "/watch-videos"
                                )
                            }
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            className="delete-button"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting
                                ? "Deleting..."
                                : "Delete Video"}
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default DeleteVideo;
