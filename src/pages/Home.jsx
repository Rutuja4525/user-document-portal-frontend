import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaShieldAlt, FaFileContract, FaSignInAlt, FaUserPlus } from "react-icons/fa";

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
            Upload Microsoft Word documents (.docx), or Portable Document Format(.pdf) automatically inject corporate tokens, and download ready-to-process files for direct import into Yardi.
          </p>

          {/* Login/Register Actions for Guests */}
          {!user && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-2 mb-4">
              <Link to="/login" className="btn btn-primary btn-lg px-4 d-flex align-items-center gap-2 border-0 shadow-sm" style={{ borderRadius: "8px", background: "#6366f1" }}>
                <FaSignInAlt size={16} />
                <span>Login to Portal</span>
              </Link>
              <Link to="/register" className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center gap-2 shadow-sm" style={{ borderRadius: "8px" }}>
                <FaUserPlus size={16} />
                <span>Create Account</span>
              </Link>
            </div>
          )}
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