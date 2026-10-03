
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/login/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.detail ||
                    data.message ||
                    "Invalid username or password."
                );

                return;
            }

            /*
             * Save JWT tokens if your Django
             * backend returns them.
             */

            if (data.access) {
                localStorage.setItem(
                    "access_token",
                    data.access
                );
            }

            if (data.refresh) {
                localStorage.setItem(
                    "refresh_token",
                    data.refresh
                );
            }

            /*
             * Login successful
             */

            navigate("/dashboard");

        } catch (error) {

            console.error("Login error:", error);

            setError(
                "Unable to connect to the server."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">

            <div className="auth-card">

                {/* =========================
                    FAMILYTUBE LOGO
                ========================= */}

                <div className="brand">

                    <div className="brand-icon">
                        <span>▶</span>
                    </div>

                    <h1>
                        Family<span>Tube</span>
                    </h1>

                </div>


                {/* =========================
                    HEADER
                ========================= */}

                <div className="auth-header">

                    <h2>Sign in</h2>

                    <p>
                        Sign in to continue to FamilyTube
                    </p>

                </div>


                {/* =========================
                    ERROR MESSAGE
                ========================= */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* =========================
                    LOGIN FORM
                ========================= */}

                <form onSubmit={handleSubmit}>

                    {/* Username */}

                    <div className="input-group">

                        <label htmlFor="username">
                            Email or username
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Enter your email or username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />

                    </div>


                    {/* Password */}

                    <div className="input-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-box">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                    </div>


                    {/* Forgot password */}

                    <div className="forgot-password">

                        <Link to="/forgot-password">
                            Forgot password?
                        </Link>

                    </div>


                    {/* Sign in button */}

                    <button
                        className="signin-btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign in"}
                    </button>

                </form>


                {/* =========================
                    DIVIDER
                ========================= */}

                <div className="divider">

                    <span>OR</span>

                </div>


                {/* =========================
                    GOOGLE
                ========================= */}

                <button
                    type="button"
                    className="google-btn"
                >
                    <span className="google-icon">
                        G
                    </span>

                    Continue with Google
                </button>


                {/* =========================
                    REGISTER
                ========================= */}

                <div className="switch-auth">

                    <span>
                        Don't have an account?
                    </span>

                    <Link to="/register">
                        Create account
                    </Link>

                </div>


                {/* =========================
                    FOOTER
                ========================= */}

                <div className="auth-footer">

                    <span>
                        © 2026 FamilyTube
                    </span>

                    <Link to="/privacy">
                        Privacy
                    </Link>

                    <Link to="/terms">
                        Terms
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Login;