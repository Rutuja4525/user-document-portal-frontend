import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/authService";
import { 
    FaUser, FaLock, FaBuilding, FaEnvelope, FaPhone, FaShieldAlt, FaSave, FaEye, FaEyeSlash 
} from "react-icons/fa";

function Profile() {
    const { user, login } = useAuth();

    // Profile form states
    const [profileData, setProfileData] = useState({
        companyName: "",
        fullName: "",
        email: "",
        phone: ""
    });

    // Password change states
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Empty", color: "bg-light" });
    
    const [infoMessage, setInfoMessage] = useState("");
    const [pwdMessage, setPwdMessage] = useState("");
    const [infoLoading, setInfoLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);

    // Load initial user details
    useEffect(() => {
        if (user) {
            setProfileData({
                companyName: user.companyName || "",
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || ""
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

        // Simulate API save call (local storage updates)
        setTimeout(() => {
            if (user) {
                const updatedUser = {
                    ...user,
                    fullName: profileData.fullName,
                    phone: profileData.phone
                };
                login(updatedUser); // Update context & local storage
                setInfoMessage("✅ Profile information updated successfully!");
            }
            setInfoLoading(false);
        }, 800);
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
            setPwdMessage("❌ " + (err.response?.data?.message || "Failed to update password. Please check your current password."));
        } finally {
            setPwdLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4 px-md-5 animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)" }}>
            <div className="mb-4 text-start">
                <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Profile Settings</h2>
                <p className="text-muted small mb-0">Manage password, login parameters, and organization profile settings</p>
            </div>

            <div className="row g-4 text-start">
                {/* Left Column: Avatar & Basic Information */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4 bg-white mb-4" style={{ borderRadius: "16px" }}>
                        
                        {/* Avatar Display */}
                        <div className="d-flex align-items-center gap-4 border-bottom pb-4 mb-4">
                            <div className="profile-avatar-circle d-flex align-items-center justify-content-center bg-indigo text-white fw-bold fs-3" 
                                 style={{ 
                                     width: "64px", 
                                     height: "64px", 
                                     borderRadius: "50%", 
                                     backgroundColor: "#6366f1"
                                 }}>
                                {profileData.fullName ? profileData.fullName[0].toUpperCase() : "C"}
                            </div>
                            <div>
                                <h4 className="fw-bold text-dark mb-1">{profileData.companyName}</h4>
                                <p className="text-muted small mb-0">{profileData.email}</p>
                                <span className="badge bg-indigo-50 text-indigo-700 border border-indigo-200 mt-2 px-2.5 py-1.5 small" style={{ fontWeight: "600" }}>
                                    Corporate Member
                                </span>
                            </div>
                        </div>

                        <h5 className="fw-bold mb-3 text-dark">Company Member Details</h5>

                        {infoMessage && (
                            <div className="alert alert-info border-0 py-2 small animate-fade-in" role="alert">
                                {infoMessage}
                            </div>
                        )}

                        <form onSubmit={handleProfileSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-slate-700">Company Name (Read-Only)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-slate-400">
                                        <FaBuilding size={14} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control bg-light border-start-0" 
                                        value={profileData.companyName} 
                                        disabled 
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-slate-700">Full Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-slate-400">
                                        <FaUser size={14} />
                                    </span>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        className="form-control border-start-0" 
                                        value={profileData.fullName} 
                                        onChange={handleProfileChange}
                                        required
                                        style={{ outline: "none", boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-slate-700">Email Address (Read-Only)</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-slate-400">
                                        <FaEnvelope size={14} />
                                    </span>
                                    <input 
                                        type="email" 
                                        className="form-control bg-light border-start-0" 
                                        value={profileData.email} 
                                        disabled 
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-slate-700">Contact Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-slate-400">
                                        <FaPhone size={14} />
                                    </span>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        className="form-control border-start-0" 
                                        value={profileData.phone} 
                                        onChange={handleProfileChange}
                                        placeholder="Enter your contact number"
                                        style={{ outline: "none", boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 border-0" 
                                style={{ borderRadius: "8px", fontWeight: "600", background: "#6366f1" }}
                                disabled={infoLoading}
                            >
                                {infoLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                                <FaSave size={14} /> Save Profile
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Change Password */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: "16px" }}>
                        <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                            <FaShieldAlt className="text-indigo" style={{ color: "#6366f1" }} /> Security Panel
                        </h5>
                        <p className="text-muted small mb-4">Ensure your account is protected with a secure password</p>

                        {pwdMessage && (
                            <div className="alert alert-info border-0 py-2 small animate-fade-in" role="alert">
                                {pwdMessage}
                            </div>
                        )}

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-slate-700">Current Password</label>
                                <div className="position-relative">
                                    <input 
                                        type={showCurrentPassword ? "text" : "password"} 
                                        name="currentPassword" 
                                        className="form-control pe-5" 
                                        value={passwordData.currentPassword} 
                                        onChange={handlePasswordChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-link position-absolute text-muted p-0"
                                        style={{ right: "15px", top: "50%", transform: "translateY(-50%)", textDecoration: "none", zIndex: 5 }}
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-semibold text-slate-700">New Password</label>
                                <div className="position-relative">
                                    <input 
                                        type={showNewPassword ? "text" : "password"} 
                                        name="newPassword" 
                                        className="form-control pe-5" 
                                        value={passwordData.newPassword} 
                                        onChange={handlePasswordChange}
                                        required
                                        style={{ borderRadius: "8px" }}
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-link position-absolute text-muted p-0"
                                        style={{ right: "15px", top: "50%", transform: "translateY(-50%)", textDecoration: "none", zIndex: 5 }}
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                                {passwordData.newPassword && (
                                    <div className="mt-2">
                                        <div className="progress" style={{ height: "4px" }}>
                                            <div 
                                                className={`progress-bar ${passwordStrength.color}`} 
                                                role="progressbar" 
                                                style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                                            ></div>
                                        </div>
                                        <span className="small text-muted mt-1 d-block" style={{ fontSize: "11px" }}>
                                            Strength: <strong>{passwordStrength.label}</strong>
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-slate-700">Confirm New Password</label>
                                <div className="position-relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        name="confirmPassword" 
                                        className="form-control pe-5" 
                                        value={passwordData.confirmPassword} 
                                        onChange={handlePasswordChange}
                                        required
                                        style={{ borderRadius: "8px" }}
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
                                {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                                    <div className="text-danger small mt-1">Passwords do not match!</div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 border-0" 
                                style={{ borderRadius: "8px", fontWeight: "600", background: "#6366f1" }}
                                disabled={pwdLoading || (passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword)}
                            >
                                {pwdLoading && <span className="spinner-border spinner-border-sm" role="status"></span>}
                                <FaLock size={14} /> Update Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
