import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, googleLoginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaUserCheck, FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "TENANT"
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Empty", color: "bg-light" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    // Calculate password strength
    useEffect(() => {
        const password = formData.password;
        if (!password) {
            setPasswordStrength({ score: 0, label: "Empty", color: "bg-light" });
            return;
        }

        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 10) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        let label = "Weak";
        let color = "bg-danger";
        if (score >= 4) {
            label = "Strong";
            color = "bg-success";
        } else if (score >= 2) {
            label = "Medium";
            color = "bg-warning";
        }

        setPasswordStrength({ score, label, color });
    }, [formData.password]);

    // Handle Google sign-in/registration callback
    const handleGoogleCallback = async (response) => {
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            const apiResponse = await googleLoginUser({
                credential: response.credential,
                role: formData.role
            });
            login(apiResponse.data);
            setSuccess("Google Sign-in Successful!");
            setTimeout(() => navigate("/dashboard"), 1000);
        } catch (err) {
            console.error("Google Registration failed", err);
            setError(err.response?.data?.message || "Google registration failed. Please verify credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Load Google script and render the button dynamically
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
                    document.getElementById("google-signup-btn"),
                    { 
                        theme: "outline", 
                        size: "large", 
                        width: "100%",
                        text: "signup_with",
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
            // Clean up
        };
    }, [isAuthenticated, formData.role]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);

        try {
            await registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: formData.role
            });
            setSuccess("Account registered successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.response?.data?.message || "Something went wrong during registration. Please try again.");
        } finally {
            setLoading(false);
        }
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
                        User Document Upload
                    </h1>
                    <h2 className="fs-5 text-blue-400 fw-semibold mb-3">
                        Secure User Document Upload Portal
                    </h2>
                    <p className="text-white-50 mx-auto" style={{ maxWidth: "450px", fontSize: "15px", lineHeight: "1.6" }}>
                        Upload, verify, and manage documents securely from one unified platform.
                    </p>
                </div>
            </div>

            {/* Right Column: Registration Card */}
            <div className="auth-form-side">
                <div className="auth-card" style={{ maxWidth: "540px" }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold mb-1 text-slate-800" style={{ fontSize: "24px" }}>Create Account</h2>
                        <p className="text-muted small">Fill out the form below to register your SaaS profile</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger border-0 py-2 small animate-fade-in" role="alert">
                            ⚠️ {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success border-0 py-2 small animate-fade-in" role="alert">
                            ✅ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3 text-start">
                                <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                    <FaUser className="me-2 text-muted" /> First Name
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    className="form-control auth-input"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                />
                            </div>

                            <div className="col-md-6 mb-3 text-start">
                                <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                    <FaUser className="me-2 text-muted" /> Last Name
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    className="form-control auth-input"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

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
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>

                        <div className="mb-3 text-start">
                            <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                <FaPhone className="me-2 text-muted" /> Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-control auth-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3 text-start">
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
                                        placeholder="••••••••"
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

                            <div className="col-md-6 mb-3 text-start">
                                <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                    <FaLock className="me-2 text-muted" /> Confirm Password
                                </label>
                                <div className="position-relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className="form-control auth-input pe-5"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-link position-absolute text-muted p-0"
                                        style={{ right: "15px", top: "50%", transform: "translateY(-50%)", textDecoration: "none", zIndex: 5 }}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <div className="text-danger small mt-1">Passwords do not match!</div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 text-start">
                            <label className="form-label small fw-semibold" style={{ color: "var(--text-h)" }}>
                                <FaUserCheck className="me-2 text-muted" /> Select Profile Role
                            </label>
                            <select
                                name="role"
                                className="form-select auth-input"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="TENANT">Tenant (Find & Rent Homes)</option>
                                <option value="OWNER">Property Owner (Manage & List Properties)</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-premium w-100 d-flex align-items-center justify-content-center"
                            disabled={loading || (formData.confirmPassword && formData.password !== formData.confirmPassword)}
                        >
                            {loading && (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            )}
                            Register Account
                        </button>
                    </form>

                    <div className="divider">or sign up with</div>

                    <div className="google-btn-container">
                        <div id="google-signup-btn" className="w-100"></div>
                    </div>
                    <p className="text-muted small text-center mt-2 mb-0" style={{ fontSize: "11px" }}>
                        * Selected role will be applied if registering a new profile via Google.
                    </p>

                    <div className="text-center mt-4 pt-2 border-top">
                        <p className="text-muted small mb-0">
                            Already registered?{" "}
                            <Link to="/login" className="fw-bold text-decoration-none" style={{ color: "var(--primary)" }}>
                                Sign In instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;