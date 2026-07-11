import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/authService";
import { 
    FaBuilding, FaFileAlt, FaUser, FaChartPie, FaLock, FaGlobe, 
    FaShieldAlt, FaSave, FaEye, FaEyeSlash, FaAngleLeft, FaAngleRight, FaGoogle 
} from "react-icons/fa";

function Profile() {
    const { user, login } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Profile form states
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: ""
    });

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Empty", color: "bg-light" });
    const [infoMessage, setInfoMessage] = useState("");
    const [pwdMessage, setPwdMessage] = useState("");
    const [infoLoading, setInfoLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    // Load initial user details
    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "Not specified",
                role: user.role || "TENANT"
            });
        }
    }, [user]);

    // Track password strength
    useEffect(() => {
        const password = passwordData.newPassword;
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
    }, [passwordData.newPassword]);

    const handleProfileChange = (e) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        setInfoLoading(true);
        setInfoMessage("");

        // Simulate API save call
        setTimeout(() => {
            if (user) {
                const updatedUser = {
                    ...user,
                    firstName: profileData.firstName,
                    lastName: profileData.lastName,
                    phone: profileData.phone
                };
                login(updatedUser); // Update local details
                setInfoMessage("✅ Profile information updated successfully!");
            }
            setInfoLoading(false);
        }, 1000);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdLoading(true);
        setPwdMessage("");

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdMessage("❌ New passwords do not match!");
            setPwdLoading(false);
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setPwdMessage("✅ Password updated successfully!");
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            console.error("Change Password Error:", err);
            setPwdMessage("❌ " + (err.response?.data?.message || "Failed to update password. Please check your credentials."));
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <div className="dashboard-shell animate-fade-in">
            {/* Sidebar Navigation */}
            <div className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    {!sidebarCollapsed && <span className="small fw-bold text-uppercase text-muted" style={{ letterSpacing: "1px" }}>Menu</span>}
                    <button 
                        className="btn btn-sm btn-light border-0 ms-auto"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        {sidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                    </button>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <Link className="sidebar-link" to="/dashboard">
                            <span className="sidebar-icon"><FaChartPie /></span>
                            <span className="sidebar-text">Overview</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="sidebar-link" to="/properties">
                            <span className="sidebar-icon"><FaBuilding /></span>
                            <span className="sidebar-text">Properties</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="sidebar-link" to="/documents">
                            <span className="sidebar-icon"><FaFileAlt /></span>
                            <span className="sidebar-text">Documents</span>
                        </Link>
                    </li>
                    <li>
                        <Link className="sidebar-link active" to="/profile">
                            <span className="sidebar-icon"><FaUser /></span>
                            <span className="sidebar-text">Profile Settings</span>
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content text-start">
                <div className="mb-4">
                    <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Profile Settings</h2>
                    <p className="text-muted small mb-0">Manage your password, login accounts, and public information preferences</p>
                </div>

                <div className="row g-4">
                    {/* Left Column: Avatar & Basic Information */}
                    <div className="col-12 col-lg-7">
                        <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: "var(--radius)" }}>
                            
                            {/* Avatar Display */}
                            <div className="d-flex flex-column flex-sm-row align-items-center gap-4 border-bottom pb-4 mb-4">
                                <div className="profile-avatar-circle">
                                    {profileData.firstName ? profileData.firstName[0].toUpperCase() : "U"}
                                </div>
                                <div className="text-center text-sm-start">
                                    <h4 className="fw-bold text-dark mb-1">{profileData.firstName} {profileData.lastName}</h4>
                                    <p className="text-muted small mb-2">{profileData.email}</p>
                                    <span className="badge bg-primary text-white px-3 py-1.5 small" style={{ fontWeight: "600" }}>{profileData.role} Profile</span>
                                </div>
                            </div>

                            <h5 className="fw-bold mb-3 text-dark">Personal Details</h5>

                            {infoMessage && (
                                <div className="alert alert-info border-0 py-2 small animate-fade-in" role="alert">
                                    {infoMessage}
                                </div>
                            )}

                            <form onSubmit={handleProfileSubmit}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-semibold">First Name</label>
                                        <input 
                                            type="text" 
                                            name="firstName" 
                                            className="form-control" 
                                            value={profileData.firstName} 
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label small fw-semibold">Last Name</label>
                                        <input 
                                            type="text" 
                                            name="lastName" 
                                            className="form-control" 
                                            value={profileData.lastName} 
                                            onChange={handleProfileChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Email Address (Read-Only)</label>
                                    <input 
                                        type="email" 
                                        className="form-control bg-light" 
                                        value={profileData.email} 
                                        disabled 
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        className="form-control" 
                                        value={profileData.phone} 
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2" 
                                    style={{ borderRadius: "8px", fontWeight: "600" }}
                                    disabled={infoLoading}
                                >
                                    {infoLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                                    <FaSave size={14} /> Update Info
                                </button>
                            </form>
                        </div>

                        {/* Connected Accounts */}
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "var(--radius)" }}>
                            <h5 className="fw-bold mb-2 text-dark">Connected Accounts</h5>
                            <p className="text-muted small mb-3">Manage third-party login linkages</p>
                            
                            <div className="d-flex align-items-center justify-content-between p-3 border rounded">
                                <div className="d-flex align-items-center gap-2.5">
                                    <span className="fs-5 text-danger"><FaGoogle /></span>
                                    <div>
                                        <span className="fw-bold text-dark d-block small">Google Authentication</span>
                                        <span className="text-muted" style={{ fontSize: "11px" }}>Use Google One-Tap for instant sign-ins.</span>
                                    </div>
                                </div>
                                <span className="badge bg-success px-3 py-1">Linked</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Change Password */}
                    <div className="col-12 col-lg-5">
                        <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: "var(--radius)" }}>
                            <h5 className="fw-bold mb-1 text-dark">Change Password</h5>
                            <p className="text-muted small mb-4">Ensure your account is protected with a secure password</p>

                            {pwdMessage && (
                                <div className="alert alert-info border-0 py-2 small animate-fade-in" role="alert">
                                    {pwdMessage}
                                </div>
                            )}

                            <form onSubmit={handlePasswordSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">Current Password</label>
                                    <input 
                                        type="password" 
                                        name="currentPassword" 
                                        className="form-control" 
                                        placeholder="Enter current password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">New Password</label>
                                    <div className="position-relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            name="newPassword" 
                                            className="form-control pe-5" 
                                            placeholder="Enter new password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            minLength="6"
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

                                    {/* Password Strength progress bar */}
                                    {passwordData.newPassword && (
                                        <div className="mt-2">
                                            <div className="progress" style={{ height: "4px" }}>
                                                <div 
                                                    className={`progress-bar ${passwordStrength.color}`} 
                                                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="strength-text" style={{ fontSize: "11px", color: "#64748b" }}>
                                                Strength: <strong>{passwordStrength.label}</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Confirm New Password</label>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="confirmPassword" 
                                        className="form-control" 
                                        placeholder="Confirm new password"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                        <div className="text-danger small mt-1">Passwords do not match!</div>
                                    )}
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-premium w-100 d-flex align-items-center justify-content-center"
                                    disabled={pwdLoading || (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword)}
                                >
                                    {pwdLoading && <span className="spinner-border spinner-border-sm me-2" role="status"></span>}
                                    <FaLock size={12} className="me-2" /> Update Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
