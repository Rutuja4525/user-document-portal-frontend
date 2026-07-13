import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaSignOutAlt, FaBuilding, FaFileAlt, FaChartPie, FaBell, FaSearch, FaUser } from "react-icons/fa";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-b border-slate-200/80 shadow-sm py-2.5 px-3 sticky-top">
      <div className="container-fluid">

        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <span className="d-flex align-items-center gap-1.5">
            <span className="text-slate-800 fw-bold fs-4">
              {user ? user.companyName : "DocUpload Portal"}
            </span>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbar">

          <ul className="navbar-nav mx-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className={`nav-link px-3 ${location.pathname === "/" ? "text-primary fw-bold" : "text-slate-600"}`} to="/">
                Home
              </Link>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link px-3 d-flex align-items-center gap-1.5 ${location.pathname === "/dashboard" ? "text-primary fw-bold" : "text-slate-600"}`} to="/dashboard">
                    <FaChartPie size={14} /> Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 d-flex align-items-center gap-1.5 ${location.pathname === "/documents" ? "text-primary fw-bold" : "text-slate-600"}`} to="/documents">
                    <FaFileAlt size={14} /> Documents
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link px-3 d-flex align-items-center gap-1.5 ${location.pathname === "/profile" ? "text-primary fw-bold" : "text-slate-600"}`} to="/profile">
                    <FaUser size={14} /> Profile
                  </Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>


                {/* User Dropdown */}
                <div className="dropdown">
                  <button 
                    className="btn btn-link text-slate-800 dropdown-toggle d-flex align-items-center gap-2 p-0" 
                    type="button" 
                    id="userDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <FaUserCircle size={24} className="text-slate-600" />
                     <span className="small d-none d-sm-inline fw-semibold text-slate-700">{user.fullName}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border border-slate-100 mt-2 p-2" aria-labelledby="userDropdown" style={{ borderRadius: "10px" }}>
                    <li className="px-3 py-1 border-bottom mb-1">
                      <span className="fw-bold d-block small text-dark">{user.companyName}</span>
                      <span className="badge bg-primary text-white mt-1" style={{ fontSize: "9px" }}>Company User</span>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded small text-slate-700" to="/profile">My Profile</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item rounded small text-slate-700" to="/dashboard">Dashboard</Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        onClick={logout} 
                        className="dropdown-item text-danger d-flex align-items-center gap-1.5 rounded small"
                      >
                        <FaSignOutAlt size={13} /> Logout
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Logout Button */}
                <button 
                  onClick={logout} 
                  className="btn btn-outline-danger btn-sm px-3 d-flex align-items-center gap-1.5"
                  style={{ borderRadius: "20px" }}
                >
                  <FaSignOutAlt size={13} />
                  <span className="small fw-semibold">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  className="btn btn-outline-primary btn-sm px-3"
                  to="/login"
                  style={{ borderRadius: "20px" }}
                >
                  Login
                </Link>

                <Link
                  className="btn btn-warning btn-sm px-3 text-dark fw-semibold"
                  to="/register"
                  style={{ borderRadius: "20px" }}
                >
                  Register
                </Link>
              </>
            )}

          </div>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;