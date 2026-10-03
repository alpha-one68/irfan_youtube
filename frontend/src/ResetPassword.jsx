import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/reset_password/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        uid: uid,
                        token: token,
                        password: password,
                        confirm_password: confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                if (typeof data === "object") {
                    const firstError = Object.values(data)
                        .flat()
                        .join(" ");

                    throw new Error(
                        firstError || "Password reset failed."
                    );
                }

                throw new Error("Password reset failed.");
            }

            setMessage(
                data.message || "Password reset successfully."
            );

            setPassword("");
            setConfirmPassword("");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-container">

            <div className="reset-password-card">

                <h2>Reset Password</h2>

                <p className="reset-description">
                    Create a new password for your account.
                </p>

                <form onSubmit={handleSubmit}>

                    <label htmlFor="password">
                        New Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        required
                    />

                    <label htmlFor="confirmPassword">
                        Confirm Password
                    </label>

                    <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Resetting..."
                            : "Reset Password"}
                    </button>

                </form>

                {message && (
                    <div className="reset-success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="reset-error">
                        {error}
                    </div>
                )}

                {message && (
                    <button
                        className="back-login-button"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </button>
                )}

            </div>

        </div>
    );
}

export default ResetPassword;