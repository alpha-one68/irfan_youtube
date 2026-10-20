
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");

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

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data.detail ||
          data.message ||
          data.non_field_errors?.[0] ||
          "Invalid username or password.";

        throw new Error(
          typeof message === "string"
            ? message
            : "Unable to sign in."
        );
      }

      if (!data.access) {
        throw new Error("Login token not received.");
      }

      // Save JWT tokens
      localStorage.setItem(
        "access_token",
        data.access
      );

      if (data.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      // Save user details for dashboard
      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      } else {
        localStorage.removeItem("user");
      }

      navigate("/dashboard", {
        replace: true,
      });

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof TypeError
          ? "Unable to connect to the server."
          : err.message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* BRAND */}
        <div className="brand">
          <div className="brand-icon">
            <span>▶</span>
          </div>

          <h1>
            Family<span>Tube</span>
          </h1>
        </div>

        {/* HEADER */}
        <div className="auth-header">
          <h2>Sign in</h2>
          <p>Sign in to continue to FamilyTube</p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {/* LOGIN FORM */}
        <form onSubmit={handleSubmit}>

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

          <div className="input-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-box">
              <input
                id="password"
                type={
                  showPassword ? "text" : "password"
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
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* SIGN IN */}
          <button
            className="signin-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        {/* FOOTER */}
        <div className="auth-footer">
          <span>© 2026 FamilyTube</span>

          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
