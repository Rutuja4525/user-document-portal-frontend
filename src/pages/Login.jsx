import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, googleLoginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    // Handle standard Google login callback
    const handleGoogleCallback = async (response) => {
        setError("");
        setLoading(true);
        try {
            const apiResponse = await googleLoginUser({
                credential: response.credential
            });
            login(apiResponse.data);
            navigate("/dashboard");
        } catch (err) {
            console.error("Google Auth failed", err);
            setError(err.response?.data?.message || "Google Sign-in failed. Please verify configurations.");
        } finally {
            setLoading(false);
        }
    };

    // Load Google script and render Google sign-in button
    useEffect(() => {
        if (isAuthenticated) return;

        const scriptId = "google-gsi-client";
        let script = document.getElementById(scriptId);

        const initGoogleButton = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "1023773177708-placeholder.apps.googleusercontent.com",
                    callback: handleGoogleCallback,
                    cancel_on_tap_outside: false,
                });
                window.google.accounts.id.renderButton(
                    document.getElementById("google-signin-btn"),
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: "100%",
                        text: "signin_with",
                        shape: "rectangular"
                    }
                );
            }
        };

        if (!script) {
            script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = initGoogleButton;
            document.body.appendChild(script);
        } else {
            initGoogleButton();
        }

        return () => {
            // Cleanup
        };
    }, [isAuthenticated]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await loginUser(formData);
            login(response.data);
            navigate("/dashboard");
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || "Invalid email or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        alert("Password reset instructions have been sent to your email (if registered).");
    };

    return (
        <div className="auth-split-container animate-fade-in">
            {/* Left Column: Branding / Illustration with real estate background */}
            <div className="auth-sidebar text-center">
                <div style={{ position: "relative", zIndex: 2 }}>
                    <img 
                        src="/images/logo.png" 
                        alt="LogiPrime Logo" 
                        className="mx-auto mb-4 bg-white p-2.5 rounded-xl shadow-md border border-slate-700/20" 
                        style={{ height: "65px", width: "auto" }} 
                    />
                    <h1 className="fw-extrabold text-white mb-2" style={{ fontSize: "2.6rem", letterSpacing: "-1px" }}>
                        Welcome to DocUpload
                    </h1>
                    <h2 className="fs-5 text-blue-400 fw-semibold mb-3">
                        Secure User Document Upload Portal
                    </h2>
                    <p className="text-white-50 mx-auto" style={{ maxWidth: "450px", fontSize: "15px", lineHeight: "1.6" }}>
                        Upload, verify, and manage documents securely from one unified platform.
                    </p>
                </div>
            </div>

            {/* Right Column: Form */}
            <div className="auth-form-side">
                <div className="auth-card">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold mb-1 text-slate-800" style={{ fontSize: "24px" }}>Sign In</h2>
                        <p className="text-muted small">Enter your account details to access your dashboard</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger border-0 py-2 small animate-fade-in" role="alert">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                <FaEnvelope className="me-2 text-muted" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="form-control auth-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="mb-3 text-start">
                            <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                <FaLock className="me-2 text-muted" /> Password
                            </label>
                            <div className="position-relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    className="form-control auth-input pe-5"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="btn btn-link position-absolute text-muted p-0"
                                    style={{ right: "15px", top: "50%", transform: "translateY(-50%)", textDecoration: "none", zIndex: 5 }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check text-start">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <label className="form-check-label text-muted small" htmlFor="rememberMe">
                                    Remember Me
                                </label>
                            </div>
                            <a 
                                href="#" 
                                className="small fw-semibold text-decoration-none" 
                                style={{ color: "var(--primary)" }}
                                onClick={handleForgotPassword}
                            >
                                Forgot Password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-premium w-100 d-flex align-items-center justify-content-center"
                            disabled={loading}
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            )}
                            Sign In
                        </button>
                    </form>

                    <div className="divider">or sign in with</div>

                    <div className="google-btn-container">
                        <div id="google-signin-btn" className="w-100"></div>
                    </div>

                    <div className="text-center mt-4 pt-2 border-top">
                        <p className="text-muted small mb-0">
                            New to DocUpload?{" "}
                            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: "var(--primary)" }}>
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;