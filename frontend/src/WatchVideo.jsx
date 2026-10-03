
import { useEffect, useState } from "react";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./WatchVideo.css";
import { apiFetch } from "./api";


function WatchVideo() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [video, setVideo] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    /* ==============================
       FETCH VIDEO
    ============================== */

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


            /* Unauthorized */

            if (response.status === 401) {

                localStorage.removeItem(
                    "access_token"
                );

                navigate("/login");

                return;
            }


            /* Video not found */

            if (response.status === 404) {

                throw new Error(
                    "Video not found"
                );
            }


            /* Other errors */

            if (!response.ok) {

                throw new Error(
                    "Unable to load video"
                );
            }


            const data = await response.json();

            console.log(
                "Video data:",
                data
            );


            setVideo(data);


        } catch (error) {

            console.error(
                "Fetch video error:",
                error
            );


            setError(
                error.message ||
                "Unable to load this video."
            );


        } finally {

            setLoading(false);

        }

    };


    /* ==============================
       LOADING
    ============================== */

    if (loading) {

        return (

            <div className="player-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading video...
                </p>

            </div>

        );

    }


    /* ==============================
       ERROR
    ============================== */

    if (error || !video) {

        return (

            <div className="player-error">

                <div className="error-box">

                    <div className="error-icon">
                        !
                    </div>


                    <h2>
                        {error || "Video not found"}
                    </h2>


                    <p>
                        The video you're looking for
                        may have been removed or
                        doesn't exist.
                    </p>


                    <button
                        onClick={() =>
                            navigate(
                                "/watch-videos"
                            )
                        }
                    >
                        ← Back to Videos
                    </button>

                </div>

            </div>

        );

    }


    /*
     * IMPORTANT
     *
     * Use the Django streaming endpoint
     * instead of video.video.
     */

    const videoStreamUrl =
        `http://127.0.0.1:8000/watch-videos/${video.id}/stream/`;


    return (

        <div className="watch-video-page">


            {/* ==============================
                NAVBAR
            ============================== */}

            <nav className="player-navbar">


                {/* Logo */}

                <div
                    className="watch-logo"
                    onClick={() =>
                        navigate(
                            "/dashboard"
                        )
                    }
                >

                    <div className="watch-logo-icon">
                        ▶
                    </div>


                    <span>
                        Family<span>Tube</span>
                    </span>

                </div>


                {/* Navbar buttons */}

                <div className="player-navbar-actions">

                    <button
                        onClick={() =>
                            navigate(
                                "/watch-videos"
                            )
                        }
                    >
                        ← Videos
                    </button>

                </div>

            </nav>



            {/* ==============================
                MAIN
            ============================== */}

            <main className="player-container">


                {/* ==============================
                    VIDEO PLAYER
                ============================== */}

                <div className="player-wrapper">

                    <video
                        className="main-video"

                        src={videoStreamUrl}

                        controls

                        autoPlay

                        preload="metadata"

                        playsInline
                    />

                </div>



                {/* ==============================
                    VIDEO INFORMATION
                ============================== */}

                <section className="video-page-info">


                    {/* Title */}

                    <h1>
                        {video.title}
                    </h1>



                    {/* Filename */}

                    {video.original_filename && (

                        <p className="original-name">

                            {video.original_filename}

                        </p>

                    )}



                    {/* Meta */}

                    <div className="video-meta">

                        <span>
                            FamilyTube
                        </span>


                        <span>
                            •
                        </span>


                        {video.created_at && (

                            <span>

                                {new Date(
                                    video.created_at
                                ).toLocaleDateString()}

                            </span>

                        )}

                    </div>



                    {/* Description */}

                    <div className="video-description-box">

                        <p>
                            {video.description}
                        </p>

                    </div>



                    {/* ==============================
                        DELETE BUTTON
                    ============================== */}

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