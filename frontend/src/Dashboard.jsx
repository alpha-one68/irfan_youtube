import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem("access_token");
        const savedUser = localStorage.getItem("user");

        if (!accessToken) {
            navigate("/login");
            return;
        }

        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Invalid user data:", error);
            }
        }

        setLoading(false);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner"></div>
                <p>Loading FamilyTube...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* Navbar */}

            <nav className="dashboard-navbar">

                <div className="dashboard-logo">

                    <div className="logo-icon">
                        ▶
                    </div>

                    <span>
                        Family<span>Tube</span>
                    </span>

                </div>


                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </nav>


            {/* Dashboard Content */}

            <main className="dashboard-content">

                <div className="welcome-section">

                    <p className="welcome-small">
                        WELCOME TO FAMILYTUBE
                    </p>

                    <h1>
                        Welcome
                        {user?.name && `, ${user.name}`} 👋
                    </h1>

                    <p>
                        What would you like to do today?
                    </p>

                </div>


                {/* Options */}

                <div className="dashboard-options">


                    {/* Create Video */}

                    <div
                        className="dashboard-option"
                        onClick={() =>
                            navigate("/create-video")
                        }
                    >

                        <div className="option-icon create-icon">
                            ＋
                        </div>

                        <h2>
                            Create Video
                        </h2>

                        <p>
                            Upload and share a new video
                            with FamilyTube.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/create-video");
                            }}
                        >
                            Create Video
                        </button>

                    </div>


                    {/* Watch Videos */}

                    <div
                        className="dashboard-option"
                        onClick={() =>
                            navigate("/watch-videos")
                        }
                    >

                        <div className="option-icon watch-icon">
                            ▶
                        </div>

                        <h2>
                            Watch Videos
                        </h2>

                        <p>
                            Browse and watch available
                            videos on FamilyTube.
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate("/watch-videos");
                            }}
                        >
                            Watch Videos
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;