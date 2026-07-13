import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDocuments, downloadDocument, downloadProcessedDocument } from "../services/documentService";
import { 
    FaFileAlt, FaPlusCircle, FaArrowRight, FaClock, FaCheckCircle, 
    FaSearch, FaFilter, FaSyncAlt, FaFileWord, FaSpinner, FaTimesCircle, FaDownload 
} from "react-icons/fa";

function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchDocs = async () => {
        try {
            const response = await getDocuments();
            setDocuments(response.data);
        } catch (error) {
            console.error("Failed to load documents", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    // Active polling if any documents are in progress
    useEffect(() => {
        const hasActiveProcessing = documents.some(
            (doc) => doc.status === "Uploaded" || doc.status === "Processing"
        );
        if (hasActiveProcessing) {
            const interval = setInterval(() => {
                fetchDocs();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [documents]);

    const getStatusCounts = () => {
        const counts = { total: documents.length, uploaded: 0, processing: 0, processed: 0, failed: 0 };
        documents.forEach(doc => {
            const status = doc.status?.toLowerCase();
            if (status === "uploaded") counts.uploaded++;
            else if (status === "processing") counts.processing++;
            else if (status === "processed") counts.processed++;
            else if (status === "failed") counts.failed++;
        });
        return counts;
    };

    const counts = getStatusCounts();

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const recentDocs = [...documents]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case "uploaded":
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1">Uploaded</span>;
            case "processing":
                return (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 d-inline-flex align-items-center gap-1">
                        <FaSpinner className="spinner-border-spinner spinner-border-sm animate-spin" style={{ animation: "spin 1.5s linear infinite", fontSize: "10px" }} />
                        Processing
                    </span>
                );
            case "processed":
                return <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1">Processed</span>;
            case "failed":
                return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1">Failed</span>;
            default:
                return <span className="badge bg-light text-dark px-2.5 py-1">{status}</span>;
        }
    };

    return (
        <div className="container-fluid py-4 px-md-5 animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)" }}>
            {/* Header / Welcome Banner */}
            <div className="welcome-banner p-4 mb-4 text-start shadow-sm border border-slate-100" 
                 style={{ 
                     background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                     borderRadius: "16px",
                     color: "#ffffff"
                 }}>
                <div className="row align-items-center">
                    <div className="col-12 col-md-8">
                        <span className="badge bg-indigo-500 text-white mb-2 px-3 py-1.5 fs-7 fw-semibold" style={{ background: "#6366f1" }}>
                            {user?.companyName || "Property Management Portal"}
                        </span>
                        <h2 className="fw-extrabold mb-1" style={{ letterSpacing: "-0.5px" }}>
                            Welcome, {user?.fullName || "Company Admin"}!
                        </h2>
                        <p className="text-indigo-200 mb-0 small">
                            Upload Microsoft Word documents (.docx), monitor execution state, and download your processed files.
                        </p>
                    </div>
                    <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
                        <button 
                            onClick={() => navigate("/documents")} 
                            className="btn btn-light px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 text-indigo-900 border-0 hover-lift"
                            style={{ borderRadius: "8px", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
                        >
                            <FaPlusCircle /> Upload Word Doc
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Row */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="stat-card p-3 shadow-sm border border-slate-200/60 bg-white hover-lift h-100 d-flex align-items-center gap-3" style={{ borderRadius: "12px" }}>
                        <div className="stat-icon-wrapper blue p-2.5 rounded-3 bg-primary-subtle text-primary">
                            <FaFileAlt size={20} />
                        </div>
                        <div className="text-start">
                            <span className="text-muted small d-block">Total Documents</span>
                            <h4 className="fw-bold mb-0 text-dark">{counts.total}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="stat-card p-3 shadow-sm border border-slate-200/60 bg-white hover-lift h-100 d-flex align-items-center gap-3" style={{ borderRadius: "12px" }}>
                        <div className="stat-icon-wrapper orange p-2.5 rounded-3 bg-warning-subtle text-warning">
                            <FaClock size={20} />
                        </div>
                        <div className="text-start">
                            <span className="text-muted small d-block">Uploaded & Processing</span>
                            <h4 className="fw-bold mb-0 text-dark">{counts.uploaded + counts.processing}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="stat-card p-3 shadow-sm border border-slate-200/60 bg-white hover-lift h-100 d-flex align-items-center gap-3" style={{ borderRadius: "12px" }}>
                        <div className="stat-icon-wrapper green p-2.5 rounded-3 bg-success-subtle text-success">
                            <FaCheckCircle size={20} />
                        </div>
                        <div className="text-start">
                            <span className="text-muted small d-block">Processed Copy</span>
                            <h4 className="fw-bold mb-0 text-dark">{counts.processed}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="stat-card p-3 shadow-sm border border-slate-200/60 bg-white hover-lift h-100 d-flex align-items-center gap-3" style={{ borderRadius: "12px" }}>
                        <div className="stat-icon-wrapper red p-2.5 rounded-3 bg-danger-subtle text-danger">
                            <FaTimesCircle size={20} />
                        </div>
                        <div className="text-start">
                            <span className="text-muted small d-block">Failed Processing</span>
                            <h4 className="fw-bold mb-0 text-dark">{counts.failed}</h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content Row */}
            <div className="row g-4">
                {/* Document Repository List */}
                <div className="col-12 col-xl-8 text-start">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px" }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <h5 className="fw-bold mb-1 text-dark">Your Documents</h5>
                                <p className="text-muted mb-0 small">Filtered documents repository view</p>
                            </div>
                            <button onClick={fetchDocs} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5" style={{ borderRadius: "6px" }}>
                                <FaSyncAlt className={loading ? "animate-spin" : ""} style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }} /> Refresh
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="row g-2 mb-3">
                            <div className="col-12 col-md-8">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-slate-400">
                                        <FaSearch size={14} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0 text-slate-800" 
                                        placeholder="Search documents by name..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{ outline: "none", boxShadow: "none" }}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-slate-400">
                                        <FaFilter size={14} />
                                    </span>
                                    <select 
                                        className="form-select border-start-0 ps-0 text-slate-800"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ outline: "none", boxShadow: "none" }}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="uploaded">Uploaded</option>
                                        <option value="processing">Processing</option>
                                        <option value="processed">Processed</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Document Table */}
                        <div className="table-responsive">
                            {loading ? (
                                <div className="py-5 text-center text-muted">
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Loading documents...
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="py-5 text-center text-muted fs-7">
                                    <FaFileAlt size={28} className="mb-2 text-slate-300" />
                                    <p className="mb-0">No documents found matching the filters.</p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0">
                                    <thead>
                                        <tr className="text-slate-400 small" style={{ fontSize: "12px", borderBottom: "1.5px solid #f1f5f9" }}>
                                            <th className="fw-semibold pb-2">Document Name</th>
                                            <th className="fw-semibold pb-2">Category</th>
                                            <th className="fw-semibold pb-2">Size</th>
                                            <th className="fw-semibold pb-2">Status</th>
                                            <th className="fw-semibold pb-2 text-end">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.map((doc) => (
                                            <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td className="py-2.5">
                                                    <div className="d-flex align-items-center gap-2.5">
                                                        <div className="p-2 rounded-2 bg-indigo-50 text-indigo-600">
                                                            <FaFileWord size={16} />
                                                        </div>
                                                        <div>
                                                            <span className="fw-semibold text-slate-800 d-block small" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: "10px" }}>{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 small text-slate-600">{doc.category}</td>
                                                <td className="py-2.5 small text-slate-600">{doc.size}</td>
                                                <td className="py-2.5">{getStatusBadge(doc.status)}</td>
                                                <td className="py-2.5 text-end">
                                                    <div className="d-inline-flex gap-1.5">
                                                        <button 
                                                            onClick={() => downloadDocument(doc.id, doc.name)}
                                                            className="btn btn-sm btn-light border-0 p-1.5"
                                                            title="Download Original"
                                                        >
                                                            <FaDownload size={12} className="text-slate-600" />
                                                        </button>
                                                        {doc.status === "Processed" && (
                                                            <button 
                                                                onClick={() => downloadProcessedDocument(doc.id, doc.name)}
                                                                className="btn btn-sm btn-primary border-0 p-1.5"
                                                                title="Download Processed Copy"
                                                                style={{ background: "#6366f1" }}
                                                            >
                                                                <FaDownload size={12} className="text-white" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Quick Info Panel */}
                <div className="col-12 col-xl-4 text-start">
                    <div className="card border-0 shadow-sm p-4 bg-white h-100" style={{ borderRadius: "16px" }}>
                        <h5 className="fw-bold mb-3 text-dark">Workspace Info</h5>
                        <div className="p-3 mb-4 rounded-3 text-indigo-950 bg-indigo-50 border border-indigo-100" style={{ fontSize: "13px" }}>
                            <p className="mb-2"><strong>Company:</strong> {user?.companyName || "N/A"}</p>
                            <p className="mb-2"><strong>User Name:</strong> {user?.fullName || "N/A"}</p>
                            <p className="mb-0"><strong>Email Address:</strong> {user?.email || "N/A"}</p>
                        </div>

                        <h5 className="fw-bold mb-3 text-dark d-flex align-items-center gap-2">
                            <FaClock className="text-muted" size={16} /> Recent Activity
                        </h5>
                        <div className="d-flex flex-column gap-3">
                            {recentDocs.length === 0 ? (
                                <p className="text-muted small">No recent activity found.</p>
                            ) : (
                                recentDocs.map((doc) => (
                                    <div key={doc.id} className="d-flex gap-2.5 align-items-start border-bottom pb-2.5 last-border-0">
                                        <span className="text-success mt-1"><FaCheckCircle size={13} /></span>
                                        <div>
                                            <p className="mb-0 text-dark small fw-medium" style={{ lineHeight: "1.3", fontSize: "12px" }}>
                                                Document <strong>{doc.name}</strong> uploaded successfully.
                                            </p>
                                            <span className="text-muted" style={{ fontSize: "10px" }}>{doc.date}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Embedded styles for spinning animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1.5s linear infinite;
                }
            `}</style>
        </div>
    );
}

export default Dashboard;
