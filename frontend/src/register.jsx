
import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        dob: "",
        password: "",
        confirm_password: "",
    });

    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));

        // Remove field error while typing
        if (errors[name]) {
            setErrors((previousErrors) => ({
                ...previousErrors,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        setMessage("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/register/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setMessage(
                    data.message || "Account created successfully!"
                );

                setFormData({
                    name: "",
                    username: "",
                    email: "",
                    dob: "",
                    password: "",
                    confirm_password: "",
                });
            } else {
                setErrors(data);
            }

        } catch (error) {
            console.error("Registration error:", error);

            setMessage(
                "Cannot connect to the Django server."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                {/* Logo */}

                <div className="brand">

                    <div className="brand-icon">
                        <span>▶</span>
                    </div>

                    <h1>
                        Family<span>Tube</span>
                    </h1>

                </div>


                {/* Header */}

                <div className="register-header">

                    <h2>Create your account</h2>

                    <p>
                        Join FamilyTube and start watching
                    </p>

                </div>


                {/* Success / server message */}

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}


                {/* Register form */}

                <form onSubmit={handleSubmit}>

                    {/* Name */}

                    <div className="form-group">

                        <label htmlFor="name">
                            Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                            required
                        />

                        {errors.name && (
                            <p className="field-error">
                                {Array.isArray(errors.name)
                                    ? errors.name[0]
                                    : errors.name}
                            </p>
                        )}

                    </div>


                    {/* Username */}

                    <div className="form-group">

                        <label htmlFor="username">
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />

                        {errors.username && (
                            <p className="field-error">
                                {Array.isArray(errors.username)
                                    ? errors.username[0]
                                    : errors.username}
                            </p>
                        )}

                    </div>


                    {/* Email */}

                    <div className="form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />

                        {errors.email && (
                            <p className="field-error">
                                {Array.isArray(errors.email)
                                    ? errors.email[0]
                                    : errors.email}
                            </p>
                        )}

                    </div>


                    {/* Date of birth */}

                    <div className="form-group">

                        <label htmlFor="dob">
                            Date of birth
                        </label>

                        <input
                            id="dob"
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                        />

                        {errors.dob && (
                            <p className="field-error">
                                {Array.isArray(errors.dob)
                                    ? errors.dob[0]
                                    : errors.dob}
                            </p>
                        )}

                    </div>


                    {/* Password */}

                    <div className="form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="show-password"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>

                        </div>

                        {errors.password && (
                            <p className="field-error">
                                {Array.isArray(errors.password)
                                    ? errors.password[0]
                                    : errors.password}
                            </p>
                        )}

                    </div>


                    {/* Confirm password */}

                    <div className="form-group">

                        <label htmlFor="confirm_password">
                            Confirm password
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="confirm_password"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirm_password"
                                placeholder="Confirm your password"
                                value={
                                    formData.confirm_password
                                }
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="show-password"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                            >
                                {showConfirmPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>

                        </div>

                        {errors.confirm_password && (
                            <p className="field-error">
                                {Array.isArray(
                                    errors.confirm_password
                                )
                                    ? errors.confirm_password[0]
                                    : errors.confirm_password}
                            </p>
                        )}

                    </div>


                    {/* Submit */}

                    <button
                        className="register-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating account..."
                            : "Create account"}
                    </button>

                </form>


                {/* Login */}

                <div className="login-section">

                    <span>
                        Already have an account?
                    </span>

                    <Link to="/login">
                        Sign in
                    </Link>

                </div>


                {/* Terms */}

                <p className="terms">

                    By creating an account, you agree to the
                    FamilyTube Terms of Service and Privacy Policy.

                </p>

            </div>

        </div>
    );
}

export default Register;
