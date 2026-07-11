import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCloudUploadAlt, FaBuilding, FaShieldAlt, FaFileContract, FaArrowRight, FaSignInAlt, FaUserPlus } from "react-icons/fa";

function Home() {
  const { user } = useAuth();

  return (
    <div className="corporate-bg animate-fade-in">
      <div className="corporate-glass-panel text-center">
        <div className="mb-4">
          <span className="badge bg-primary px-3 py-2 text-uppercase mb-3" style={{ letterSpacing: "1.5px", fontSize: "11px", fontWeight: "700" }}>
            Enterprise Portal
          </span>
          <h1 className="display-4 fw-extrabold text-slate-900 mb-3 corporate-title-glow">
            User Document <br/>
            <span className="text-primary">Upload Portal</span>
          </h1>
          <p className="lead text-slate-600 mx-auto mb-4" style={{ maxWidth: "680px", fontSize: "17px" }}>
            Welcome to the corporate document repository of LogiPrime Solutions. Upload, manage, and verify user documents, compliance certificates, and digital assets securely.
          </p>

          {/* Explicit Login/Register Actions for Guests */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-2 mb-4">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm" style={{ borderRadius: "8px" }}>
                  <FaSignInAlt size={16} />
                  <span>Login to Portal</span>
                </Link>
                <Link to="/register" className="btn btn-outline-primary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm" style={{ borderRadius: "8px" }}>
                  <FaUserPlus size={16} />
                  <span>Create Account</span>
                </Link>
              </>
            ) : (
              <div className="p-3 bg-light rounded border border-slate-200 w-100 max-w-md mx-auto d-flex flex-column align-items-center gap-2">
                <span className="fw-semibold text-slate-700">Logged in as <span className="text-primary">{user.firstName} {user.lastName}</span> ({user.role})</span>
                <div className="d-flex gap-2.5">
                  <Link to="/dashboard" className="btn btn-primary btn-sm px-3" style={{ borderRadius: "6px" }}>Go to Dashboard</Link>
                  <Link to="/documents" className="btn btn-outline-primary btn-sm px-3" style={{ borderRadius: "6px" }}>Upload Documents</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4 mt-2 text-start">
          {/* Document Vault Card */}
          <div className="col-12 col-md-6">
            <div className="corporate-accent-card d-flex flex-column justify-content-between">
              <div>
                <div className="corporate-icon-box">
                  <FaCloudUploadAlt />
                </div>
                <h4 className="fw-bold text-slate-800 mb-2">Secure Document Vault</h4>
                <p className="text-slate-600 small mb-4">
                  Drag-and-drop or select PDF and Word documents (.doc, .docx) to upload to specific property assets.
                </p>
              </div>
              <Link to={user ? "/documents" : "/login"} className="btn-corporate-primary w-100 text-center d-flex align-items-center justify-content-center gap-2 mt-auto">
                <span>Access Vault</span>
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Properties Card */}
          <div className="col-12 col-md-6">
            <div className="corporate-accent-card d-flex flex-column justify-content-between">
              <div>
                <div className="corporate-icon-box">
                  <FaBuilding />
                </div>
                <h4 className="fw-bold text-slate-800 mb-2">Asset Portfolio</h4>
                <p className="text-slate-600 small mb-4">
                  Browse, monitor, and assign documents to your active corporate real estate properties and locations.
                </p>
              </div>
              <Link to={user ? "/properties" : "/login"} className="btn-corporate-secondary w-100 text-center d-flex align-items-center justify-content-center gap-2 mt-auto">
                <span>View Portfolio</span>
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Trust Badge & Information Banner */}
        <div className="mt-5 pt-4 border-top border-slate-200/80 d-flex flex-wrap align-items-center justify-content-between gap-3 text-start">
          <div className="d-flex align-items-center gap-3">
            <div className="text-success fs-3">
              <FaShieldAlt />
            </div>
            <div>
              <span className="fw-bold text-slate-800 d-block small">Compliance Assured</span>
              <span className="text-slate-500" style={{ fontSize: "12px" }}>Documents encrypted and restricted by tenant validation rules.</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-warning fs-3">
              <FaFileContract />
            </div>
            <div>
              <span className="fw-bold text-slate-800 d-block small">Accepted Formats Only</span>
              <span className="text-slate-500" style={{ fontSize: "12px" }}>Strictly PDF (.pdf) and Word (.doc, .docx) uploads.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;