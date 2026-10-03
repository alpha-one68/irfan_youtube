import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateVideo.css";
import { apiFetch } from "./api";

function CreateVideo() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        video: null,
    });

    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: files ? files[0] : value,
        }));

        setError("");
        setMessage("");
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setMessage("");

        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !formData.video
        ) {
            setError(
                "Please enter a title, description, and select a video."
            );

            return;
        }

        try {
            setUploading(true);

            const data = new FormData();

            data.append(
                "title",
                formData.title.trim()
            );

            data.append(
                "description",
                formData.description.trim()
            );

            data.append(
                "video",
                formData.video
            );


            const response = await apiFetch(
                "/create_video/",
                {
                    method: "POST",
                    body: data,
                }
            );


            const responseData =
                await response.json();


            if (!response.ok) {

                console.error(
                    "Upload error:",
                    responseData
                );

                if (typeof responseData === "object") {

                    const errorMessages =
                        Object.values(responseData)
                            .flat()
                            .join(" ");

                    setError(
                        errorMessages ||
                        "Video upload failed."
                    );

                } else {

                    setError(
                        "Video upload failed."
                    );
                }

                return;
            }


            setMessage(
                "Video uploaded successfully!"
            );


            setFormData({
                title: "",
                description: "",
                video: null,
            });


            const videoInput =
                document.getElementById(
                    "video-input"
                );

            if (videoInput) {
                videoInput.value = "";
            }

        } catch (error) {

            console.error(
                "Upload error:",
                error
            );

            setError(
                "Cannot connect to the server."
            );

        } finally {
            setUploading(false);
        }
    };


    return (
        <div className="create-video-page">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="create-video-navbar">

                <div
                    className="create-video-logo"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >

                    <div className="logo-icon">
                        ▶
                    </div>

                    <span>
                        Family<span>Tube</span>
                    </span>

                </div>


                <button
                    className="dashboard-button"
                    onClick={() =>
                        navigate("/dashboard")
                    }
                >
                    Dashboard
                </button>

            </nav>


            {/* =========================
                MAIN
            ========================= */}

            <main className="create-video-container">

                <div className="create-video-card">

                    {/* Header */}

                    <div className="create-header">

                        <div className="upload-icon">
                            ↑
                        </div>

                        <div>

                            <h1>
                                Create Video
                            </h1>

                            <p>
                                Upload a new video to
                                FamilyTube.
                            </p>

                        </div>

                    </div>


                    {/* Form */}

                    <form onSubmit={handleSubmit}>


                        {/* Title */}

                        <div className="form-group">

                            <label htmlFor="title">
                                Video Title
                            </label>

                            <input
                                id="title"
                                type="text"
                                name="title"
                                value={
                                    formData.title
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter video title"
                                disabled={uploading}
                            />

                        </div>


                        {/* Description */}

                        <div className="form-group">

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={
                                    formData.description
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Tell viewers about your video..."
                                rows="5"
                                disabled={uploading}
                            />

                        </div>


                        {/* Video */}

                        <div className="form-group">

                            <label htmlFor="video-input">
                                Video File
                            </label>

                            <label
                                htmlFor="video-input"
                                className="video-upload-area"
                            >

                                <div className="upload-cloud">
                                    ↑
                                </div>

                                <strong>
                                    Choose a video
                                </strong>

                                <span>
                                    MP4, WebM, MOV and
                                    other video formats
                                </span>

                                <span className="browse-text">
                                    Browse files
                                </span>

                            </label>


                            <input
                                id="video-input"
                                type="file"
                                name="video"
                                accept="video/*"
                                onChange={
                                    handleChange
                                }
                                disabled={uploading}
                                hidden
                            />

                        </div>


                        {/* Selected video */}

                        {formData.video && (

                            <div className="selected-video">

                                <div className="selected-video-icon">
                                    ▶
                                </div>

                                <div className="selected-video-info">

                                    <strong>
                                        {formData.video.name}
                                    </strong>

                                    <span>
                                        {(
                                            formData.video
                                                .size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </span>

                                </div>

                            </div>

                        )}


                        {/* Error */}

                        {error && (

                            <div className="error-message">
                                {error}
                            </div>

                        )}


                        {/* Success */}

                        {message && (

                            <div className="success-message">
                                {message}
                            </div>

                        )}


                        {/* Upload */}

                        <button
                            type="submit"
                            className="upload-button"
                            disabled={uploading}
                        >

                            {uploading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    ↑ Upload Video
                                </>
                            )}

                        </button>

                    </form>

                </div>

            </main>

        </div>
    );
}

export default CreateVideo;