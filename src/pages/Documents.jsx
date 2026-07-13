import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { 
    getProperties, getAllDocuments, uploadPropertyDocument, deleteDocument, downloadDocument 
} from "../services/propertyService";
import { 
    FaBuilding, FaFileAlt, FaUser, FaChartPie, FaSearch, 
    FaTrash, FaCloudUploadAlt, FaFilePdf, FaFileWord, FaFileImage, FaAngleLeft, FaAngleRight, FaDownload 
} from "react-icons/fa";

function Documents() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { showToast } = useToast();
    
    // Core states linked to API
    const [documents, setDocuments] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI filters state
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");

    // Drag-n-drop & Upload states
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState("Lease");
    const [selectedPropertyId, setSelectedPropertyId] = useState("");
    const [uploadFile, setUploadFile] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // Load documents and properties parallelly
            const [docsRes, propsRes] = await Promise.all([
                getAllDocuments(),
                getProperties()
            ]);
            setDocuments(docsRes.data);
            setProperties(propsRes.data);
            if (propsRes.data.length > 0) {
                setSelectedPropertyId(propsRes.data[0].id.toString());
            }
        } catch (err) {
            console.error("Failed to load initial documents/properties", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshDocuments = async () => {
        try {
            const docsRes = await getAllDocuments();
            setDocuments(docsRes.data);
        } catch (err) {
            console.error("Failed to refresh documents list", err);
        }
    };

    // Handle Drag Over
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const triggerUpload = async (file) => {
        if (!selectedPropertyId) {
            showToast("Please add a property first and select it to upload documents.", "warning");
            return;
        }

        setUploading(true);
        setUploadProgress(10);
        const progressInterval = setInterval(() => {
            setUploadProgress(p => p < 90 ? p + 10 : p);
        }, 150);

        try {
            await uploadPropertyDocument(Number(selectedPropertyId), file, selectedCategory);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                setUploadFile(null);
                refreshDocuments();
                showToast("Document uploaded successfully!", "success");
            }, 400);
        } catch (err) {
            clearInterval(progressInterval);
            setUploading(false);
            console.error("Upload failed", err);
            showToast("Failed to upload document.", "error");
        }
    };

    // Handle Drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const name = file.name.toLowerCase();
            if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
                showToast("Only PDF (.pdf) and Word (.doc, .docx) documents are allowed.", "error");
                return;
            }
            triggerUpload(file);
        }
    };

    // Handle File Input Change
    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const name = file.name.toLowerCase();
            if (!name.endsWith(".pdf") && !name.endsWith(".doc") && !name.endsWith(".docx")) {
                showToast("Only PDF (.pdf) and Word (.doc, .docx) documents are allowed.", "error");
                return;
            }
            triggerUpload(file);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await deleteDocument(id);
            refreshDocuments();
            showToast("Document deleted successfully!", "success");
        } catch (err) {
            console.error("Failed to delete document", err);
            showToast("Failed to delete document.", "error");
        }
    };

    const handleDownloadClick = async (docId, name) => {
        try {
            await downloadDocument(docId, name);
        } catch (err) {
            console.error("Failed to download file", err);
            showToast("Failed to download document. Your session might have expired.", "error");
        }
    };

    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-danger" size={18} />;
        if (ext === 'doc' || ext === 'docx') return <FaFileWord className="text-primary" size={18} />;
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext)) return <FaFileImage className="text-success" size={18} />;
        return <FaFileAlt className="text-secondary" size={18} />;
    };

    const getPropertyName = (propId) => {
        const prop = properties.find(p => p.id === propId);
        return prop ? prop.title : "Unassigned Property";
    };

    // Filter documents
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = categoryFilter === "All" || doc.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

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
                        <Link className="sidebar-link active" to="/documents">
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
                <div className="mb-4 text-start">
                    <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Documents</h2>
                    <p className="text-muted small mb-0">Upload and manage lease agreements, receipts, and identity documents</p>
                </div>

                <div className="row g-4">
                    {/* Left Column: Upload Panel */}
                    <div className="col-12 col-lg-5">
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "var(--radius)" }}>
                            <h5 className="fw-bold mb-3 text-dark text-start">Upload Document</h5>

                            {/* Property Selector */}
                            <div className="mb-3 text-start">
                                <label className="form-label small fw-semibold text-muted">Associate with Property <span className="text-danger">*</span></label>
                                <select 
                                    className="form-select"
                                    value={selectedPropertyId}
                                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                                    style={{ borderRadius: "8px" }}
                                    disabled={uploading || properties.length === 0}
                                >
                                    {properties.length > 0 ? (
                                        properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))
                                    ) : (
                                        <option value="">No properties available</option>
                                    )}
                                </select>
                                {properties.length === 0 && (
                                    <div className="text-danger small mt-1">Please add a property first to associate documents.</div>
                                )}
                            </div>

                            {/* Category Selector */}
                            <div className="mb-3 text-start">
                                <label className="form-label small fw-semibold text-muted">Select Document Type</label>
                                <select 
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{ borderRadius: "8px" }}
                                    disabled={uploading}
                                >
                                    <option value="Lease">Lease Agreement</option>
                                    <option value="Identity">Identity Verification</option>
                                    <option value="Payment Receipt">Payment Receipt</option>
                                    <option value="Insurance">Insurance Document</option>
                                </select>
                            </div>

                            {/* Dropzone Container */}
                            <div 
                                className={`upload-dropzone ${dragActive ? "active" : ""}`}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input 
                                    type="file" 
                                    id="file-upload" 
                                    className="d-none" 
                                    onChange={handleFileInput}
                                    accept=".pdf,.doc,.docx"
                                    disabled={uploading || properties.length === 0}
                                />
                                <label htmlFor="file-upload" style={{ cursor: (uploading || properties.length === 0) ? "not-allowed" : "pointer" }}>
                                    <FaCloudUploadAlt size={48} className="text-primary mb-2" />
                                    <p className="fw-bold text-dark mb-1 small">Drag and drop file here</p>
                                    <span className="text-muted small d-block mb-2">or browse files from device</span>
                                    <span className="badge bg-light text-muted border px-2.5 py-1" style={{ fontSize: "10px" }}>PDF or Word Document Only (Max 5MB)</span>
                                </label>
                            </div>

                            {/* Uploading Status */}
                            {uploading && (
                                <div className="mt-4 p-3 bg-light rounded text-start animate-fade-in" style={{ borderLeft: "4px solid var(--primary)" }}>
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold text-dark small">Uploading Document...</span>
                                        <span className="small text-muted fw-semibold">{uploadProgress}%</span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Search and History Table */}
                    <div className="col-12 col-lg-7">
                        <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "var(--radius)" }}>
                            <h5 className="fw-bold mb-3 text-dark text-start">Document Repository</h5>

                            {/* Search and Category Filters */}
                            <div className="row g-2 mb-3">
                                <div className="col-12 col-sm-8">
                                    <div className="position-relative">
                                        <input 
                                            type="text" 
                                            className="form-control form-control-sm ps-5"
                                            placeholder="Search by file name..."
                                            style={{ borderRadius: "8px" }}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        <FaSearch className="position-absolute text-muted" style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }} />
                                    </div>
                                </div>
                                <div className="col-12 col-sm-4">
                                    <select 
                                        className="form-select form-select-sm"
                                        style={{ borderRadius: "8px" }}
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                    >
                                        <option value="All">All Categories</option>
                                        <option value="Lease">Leases</option>
                                        <option value="Identity">Identities</option>
                                        <option value="Payment Receipt">Receipts</option>
                                        <option value="Insurance">Insurance</option>
                                    </select>
                                </div>
                            </div>

                            {/* Loading State */}
                            {loading ? (
                                <div className="text-center p-5">
                                    <div className="spinner-border text-primary" role="status"></div>
                                    <p className="text-muted mt-2 small">Loading document history...</p>
                                </div>
                            ) : filteredDocs.length > 0 ? (
                                <div className="table-responsive-container">
                                    <div className="table-responsive">
                                        <table className="table custom-table text-start mb-0">
                                            <thead className="sticky-table-header">
                                                <tr>
                                                    <th>Document Name</th>
                                                    <th>Related Property</th>
                                                    <th>Category</th>
                                                    <th>Status</th>
                                                    <th className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredDocs.map((doc) => (
                                                    <tr key={doc.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center gap-2">
                                                                {getFileIcon(doc.name)}
                                                                <div className="text-truncate" style={{ maxWidth: "160px" }} title={doc.name}>
                                                                    <span className="fw-semibold text-dark small d-block">{doc.name}</span>
                                                                    <span className="text-muted" style={{ fontSize: "9px" }}>{doc.size}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="small fw-semibold text-secondary">
                                                            {getPropertyName(doc.propertyId)}
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-light text-secondary border px-2 py-0.5" style={{ fontSize: "11px" }}>
                                                                {doc.category}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${doc.status === "Approved" ? "bg-success" : "bg-warning text-dark"} px-2.5 py-0.5`} style={{ fontSize: "10px" }}>
                                                                {doc.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <button 
                                                                    onClick={() => handleDownloadClick(doc.id, doc.name)}
                                                                    className="btn btn-sm btn-outline-secondary p-1.5"
                                                                    style={{ borderRadius: "6px" }}
                                                                    title="Download"
                                                                >
                                                                    <FaDownload size={11} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(doc.id)}
                                                                    className="btn btn-sm btn-outline-danger p-1.5"
                                                                    style={{ borderRadius: "6px" }}
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash size={11} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                /* Empty state */
                                <div className="p-4 text-center border rounded">
                                    <span className="fs-2 d-block mb-1">📂</span>
                                    <h6 className="fw-bold text-dark">No Documents Available</h6>
                                    <p className="text-muted small mb-0">Use the upload panel to upload files.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Documents;
