import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCloudUploadAlt, FaShieldAlt, FaFileContract, FaArrowRight, FaSignInAlt, FaUserPlus, FaFileSignature } from "react-icons/fa";

function Home() {
  const { user } = useAuth();

  return (
    <div className="corporate-bg animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)", padding: "40px 20px" }}>
      <div className="corporate-glass-panel text-center p-5 mx-auto border border-slate-200/80 shadow-sm bg-white" style={{ maxWidth: "900px", borderRadius: "24px" }}>
        <div className="mb-4">
          <span className="badge px-3 py-2 text-uppercase mb-3" style={{ color: "#4f46e5", backgroundColor: "#e0e7ff", border: "1px solid #c7d2fe", letterSpacing: "1.5px", fontSize: "11px", fontWeight: "700" }}>
            Secure Document Portal
          </span>
          <h1 className="display-5 fw-extrabold text-slate-900 mb-3" style={{ letterSpacing: "-1.5px" }}>
            Word Document <br/>
            <span className="text-primary" style={{ color: "#6366f1" }}>Processing Workspace</span>
          </h1>
          <p className="lead text-slate-600 mx-auto mb-4" style={{ maxWidth: "680px", fontSize: "16px" }}>
            Upload Microsoft Word documents (.docx), automatically inject corporate tokens, and download ready-to-process files for direct import into Yardi.
          </p>

          {/* Login/Register Actions for Guests */}
          <div className="d-flex justify-content-center align-items-center gap-3 mt-2 mb-4">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 border-0 shadow-sm" style={{ borderRadius: "8px", background: "#6366f1" }}>
                  <FaSignInAlt size={16} />
                  <span>Login to Portal</span>
                </Link>
                <Link to="/register" className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm" style={{ borderRadius: "8px" }}>
                  <FaUserPlus size={16} />
                  <span>Create Account</span>
                </Link>
              </>
            ) : (
              <div className="p-3 bg-light rounded border border-slate-200 w-100 max-w-md mx-auto d-flex flex-column align-items-center gap-2">
                <span className="fw-semibold text-slate-700">Logged in as <span className="text-primary">{user.fullName}</span> ({user.companyName})</span>
                <div className="d-flex gap-2.5">
                  <Link to="/dashboard" className="btn btn-primary btn-sm px-3" style={{ borderRadius: "6px", background: "#6366f1", border: "none" }}>Go to Dashboard</Link>
                  <Link to="/documents" className="btn btn-outline-secondary btn-sm px-3" style={{ borderRadius: "6px" }}>Documents</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="row g-4 mt-2 text-start">
          {/* Document Vault Card */}
          <div className="col-12">
            <div className="corporate-accent-card d-flex flex-column justify-content-between p-4 border border-slate-200/60 rounded-4" style={{ background: "#f8fafc" }}>
              <div>
                <div className="corporate-icon-box p-2.5 rounded-3 bg-primary-subtle text-primary d-inline-block mb-3">
                  <FaCloudUploadAlt size={24} />
                </div>
                <h5 className="fw-bold text-slate-800 mb-2">Original Documents</h5>
                <p className="text-slate-600 small mb-4">
                  Securely drag-and-drop or select Word and PDF documents. Preserves all original uploads safely in dedicated folders.
                </p>
              </div>
              <Link to={user ? "/documents" : "/login"} className="btn btn-outline-primary w-100 text-center d-flex align-items-center justify-content-center gap-2 mt-auto border-0 bg-primary-subtle text-primary" style={{ borderRadius: "8px" }}>
                <span>Access Documents</span>
                <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Trust Badge & Information Banner */}
        <div className="mt-5 pt-4 border-top border-slate-200/80 d-flex flex-wrap align-items-center justify-content-between gap-3 text-start">
          <div className="d-flex align-items-center gap-3">
            <div className="text-success fs-3">
              <FaShieldAlt style={{ color: "#10b981" }} />
            </div>
            <div>
              <span className="fw-bold text-slate-800 d-block small">Compliance Checked</span>
              <span className="text-slate-500" style={{ fontSize: "12px" }}>Corporate document vaults restricted per company account.</span>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-warning fs-3">
              <FaFileContract style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <span className="fw-bold text-slate-800 d-block small">Accepted Formats</span>
              <span className="text-slate-500" style={{ fontSize: "12px" }}>Microsoft Word (.doc, .docx) and PDF (.pdf) format files.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;