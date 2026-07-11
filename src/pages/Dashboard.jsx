import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
    FaBuilding, FaFileAlt, FaUser, FaChartPie, FaPlusCircle, 
    FaArrowRight, FaClock, FaCheckCircle, FaAngleLeft, FaAngleRight, FaFileInvoiceDollar 
} from "react-icons/fa";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Static Mock Data for Recent Activity
    const recentActivities = [
        { id: 1, text: "Rent payment of $1,200 received from Apartment 302", time: "2 hours ago", type: "success" },
        { id: 2, text: "New tenant lease uploaded for Signature - Unit 105", time: "5 hours ago", type: "info" },
        { id: 3, text: "Property maintenance request registered for Unit 201", time: "1 day ago", type: "warning" },
        { id: 4, text: "New property 'Oceanfront Villa' added to listings", time: "2 days ago", type: "success" }
    ];

    return (
        <div className="dashboard-shell animate-fade-in">
            {/* Sidebar Navigation */}
            <div className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                    {!sidebarCollapsed && <span className="small fw-bold text-uppercase text-muted" style={{ letterSpacing: "1px" }}>Menu</span>}
                    <button 
                        className="btn btn-sm btn-light border-0 ms-auto"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {sidebarCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
                    </button>
                </div>

                <ul className="sidebar-menu">
                    <li>
                        <Link className="sidebar-link active" to="/dashboard">
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
                        <Link className="sidebar-link" to="/profile">
                            <span className="sidebar-icon"><FaUser /></span>
                            <span className="sidebar-text">Profile Settings</span>
                        </Link>
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-content">
                {/* Welcome Banner */}
                <div className="welcome-banner mb-4">
                    <div style={{ maxWidth: "580px" }}>
                        <h2 className="fw-extrabold text-white mb-2" style={{ letterSpacing: "-0.5px" }}>
                            Hello, {user ? `${user.firstName} ${user.lastName}` : "User"}!
                        </h2>
                        <p className="text-white-50 mb-0 small">
                            Welcome back to your User Document Upload Portal. Here is your dashboard summary for today. You have 3 pending document reviews and 1 open maintenance ticket.
                        </p>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="row g-4 mb-4">
                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="stat-card hover-lift">
                            <div className="stat-icon-wrapper blue">
                                <FaBuilding />
                            </div>
                            <div>
                                <span className="text-muted small d-block">Properties Listed</span>
                                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-1px" }}>12</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="stat-card hover-lift">
                            <div className="stat-icon-wrapper green">
                                <FaUser />
                            </div>
                            <div>
                                <span className="text-muted small d-block">Active Tenants</span>
                                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-1px" }}>8</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="stat-card hover-lift">
                            <div className="stat-icon-wrapper orange">
                                <FaFileAlt />
                            </div>
                            <div>
                                <span className="text-muted small d-block">Pending Review</span>
                                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-1px" }}>3</h3>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-sm-6 col-lg-3">
                        <div className="stat-card hover-lift">
                            <div className="stat-icon-wrapper red">
                                <FaFileInvoiceDollar />
                            </div>
                            <div>
                                <span className="text-muted small d-block">Collected Revenue</span>
                                <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: "-1px" }}>$14,500</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Details Row */}
                <div className="row g-4">
                    {/* SVG Chart Section */}
                    <div className="col-12 col-xl-8">
                        <div className="chart-card">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0 text-dark">Rental Income Trends (2026)</h5>
                                <span className="badge bg-light text-primary px-3 py-1">Monthly</span>
                            </div>
                            
                            {/* Custom SVG Line Chart */}
                            <div className="chart-svg-container position-relative">
                                <svg className="w-100 h-100" viewBox="0 0 500 240" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                                        </linearGradient>
                                    </defs>
                                    
                                    {/* Grids */}
                                    <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1.5" />
                                    <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1.5" />
                                    <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1.5" />
                                    <line x1="0" y1="190" x2="500" y2="190" stroke="#f1f5f9" strokeWidth="1.5" />
                                    
                                    {/* Gradient Area */}
                                    <path d="M 0 180 Q 100 130, 200 110 T 400 60 T 500 45 L 500 210 L 0 210 Z" fill="url(#chartGrad)" />
                                    
                                    {/* Line path */}
                                    <path d="M 0 180 Q 100 130, 200 110 T 400 60 T 500 45" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
                                    
                                    {/* Node Points */}
                                    <circle cx="200" cy="110" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                                    <circle cx="400" cy="60" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                                    <circle cx="500" cy="45" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="3" />
                                </svg>
                                
                                <div className="d-flex justify-content-between mt-2 text-muted px-2" style={{ fontSize: "11px", fontWeight: "500" }}>
                                    <span>Jan</span>
                                    <span>Mar</span>
                                    <span>May</span>
                                    <span>Jul</span>
                                    <span>Sep</span>
                                    <span>Nov</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions and Activity Panel */}
                    <div className="col-12 col-xl-4">
                        <div className="card border-0 shadow-sm p-4 h-100 bg-white" style={{ borderRadius: "var(--radius)" }}>
                            <h5 className="fw-bold mb-3 text-dark">Quick Actions</h5>
                            <div className="d-flex flex-column gap-2 mb-4">
                                <button 
                                    onClick={() => navigate("/properties")} 
                                    className="btn btn-outline-primary d-flex align-items-center justify-content-between p-2.5 text-start"
                                    style={{ borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}
                                >
                                    <span className="d-flex align-items-center gap-2"><FaPlusCircle /> Add New Property</span>
                                    <FaArrowRight size={12} />
                                </button>
                                <button 
                                    onClick={() => navigate("/documents")} 
                                    className="btn btn-outline-primary d-flex align-items-center justify-content-between p-2.5 text-start"
                                    style={{ borderRadius: "8px", fontWeight: "600", fontSize: "14px" }}
                                >
                                    <span className="d-flex align-items-center gap-2"><FaFileAlt /> Upload Document</span>
                                    <FaArrowRight size={12} />
                                </button>
                            </div>

                            <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                                <FaClock className="text-muted" size={16} /> Recent Activity
                            </h5>
                            <div className="d-flex flex-column gap-3">
                                {recentActivities.map((act) => (
                                    <div key={act.id} className="d-flex gap-2.5 align-items-start border-bottom pb-2.5 last-border-0">
                                        <span className="text-success mt-1"><FaCheckCircle size={14} /></span>
                                        <div>
                                            <p className="mb-0 text-dark small fw-medium" style={{ lineHeight: "1.3" }}>
                                                {act.text}
                                            </p>
                                            <span className="text-muted" style={{ fontSize: "10px" }}>{act.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
