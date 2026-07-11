import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
    getProperties, createProperty, updateProperty, deleteProperty,
    getPropertyDocuments, uploadPropertyDocument, deleteDocument, downloadDocument
} from "../services/propertyService";
import { 
    FaBuilding, FaFileAlt, FaUser, FaChartPie, FaPlus, FaSearch, 
    FaEdit, FaTrash, FaBed, FaBath, FaMapMarkerAlt, FaTimes, FaAngleLeft, 
    FaAngleRight, FaCloudUploadAlt, FaDownload, FaFilePdf, FaFileWord, FaFileImage 
} from "react-icons/fa";

function Properties() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    // Core property list state from DB
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters and search state
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortBy, setSortBy] = useState("default");

    // Modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentProperty, setCurrentProperty] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    // Document Drawer state
    const [showDocModal, setShowDocModal] = useState(false);
    const [activeProp, setActiveProp] = useState(null);
    const [activePropDocs, setActivePropDocs] = useState([]);
    const [docCategory, setDocCategory] = useState("Lease");
    const [docFile, setDocFile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Form inputs state
    const [formData, setFormData] = useState({
        title: "",
        type: "Apartment",
        rent: "",
        address: "",
        beds: 1,
        baths: 1,
        status: "Available"
    });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await getProperties();
            setProperties(res.data);
        } catch (err) {
            console.error("Failed to load properties", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProperty({
                ...formData,
                rent: Number(formData.rent)
            });
            setShowAddModal(false);
            resetForm();
            fetchProperties();
        } catch (err) {
            console.error("Failed to create property", err);
            alert("Error creating property listing.");
        }
    };

    const handleEditClick = (prop) => {
        setCurrentProperty(prop);
        setFormData({
            title: prop.title,
            type: prop.type,
            rent: prop.rent,
            address: prop.address,
            beds: prop.beds,
            baths: prop.baths,
            status: prop.status
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProperty(currentProperty.id, {
                ...formData,
                rent: Number(formData.rent)
            });
            setShowEditModal(false);
            resetForm();
            fetchProperties();
        } catch (err) {
            console.error("Failed to update property", err);
            alert("Error updating property.");
        }
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteProperty(deleteId);
            setShowDeleteConfirm(false);
            fetchProperties();
        } catch (err) {
            console.error("Failed to delete property", err);
            alert("Error deleting property listing.");
        }
    };

    const resetForm = () => {
        setFormData({
            title: "",
            type: "Apartment",
            rent: "",
            address: "",
            beds: 1,
            baths: 1,
            status: "Available"
        });
    };

    // Property-specific Document Drawer controls
    const openDocDrawer = async (prop) => {
        setActiveProp(prop);
        setDocFile(null);
        setUploadProgress(0);
        setUploadingDoc(false);
        try {
            const res = await getPropertyDocuments(prop.id);
            setActivePropDocs(res.data);
            setShowDocModal(true);
        } catch (err) {
            console.error("Failed to load documents", err);
        }
    };

    const handleDocUpload = async (e) => {
        e.preventDefault();
        if (!docFile || !activeProp) return;

        setUploadingDoc(true);
        setUploadProgress(10);
        const progressInterval = setInterval(() => {
            setUploadProgress(p => p < 90 ? p + 10 : p);
        }, 150);

        try {
            await uploadPropertyDocument(activeProp.id, docFile, docCategory);
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(async () => {
                setUploadingDoc(false);
                setDocFile(null);
                setUploadProgress(0);
                // Refresh active property documents
                const res = await getPropertyDocuments(activeProp.id);
                setActivePropDocs(res.data);
            }, 400);
        } catch (err) {
            clearInterval(progressInterval);
            setUploadingDoc(false);
            console.error("Document upload failed", err);
            alert("Failed to upload document.");
        }
    };

    const handleDocDelete = async (docId) => {
        if (!confirm("Are you sure you want to delete this document?")) return;
        try {
            await deleteDocument(docId);
            // Refresh active property documents
            const res = await getPropertyDocuments(activeProp.id);
            setActivePropDocs(res.data);
        } catch (err) {
            console.error("Failed to delete document", err);
            alert("Failed to delete document.");
        }
    };

    const handleDownloadClick = async (docId, name) => {
        try {
            await downloadDocument(docId, name);
        } catch (err) {
            console.error("Failed to download file", err);
            alert("Failed to download document. Your session might have expired.");
        }
    };

    const getFileIcon = (name) => {
        const ext = name.split('.').pop().toLowerCase();
        if (ext === 'pdf') return <FaFilePdf className="text-danger" size={16} />;
        if (ext === 'doc' || ext === 'docx') return <FaFileWord className="text-primary" size={16} />;
        if (['jpg', 'jpeg', 'png', 'svg'].includes(ext)) return <FaFileImage className="text-success" size={16} />;
        return <FaBuilding className="text-secondary" size={16} />;
    };

    // Filter & Sort properties
    const filteredProperties = properties.filter(prop => {
        const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             prop.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "All" || prop.type === typeFilter;
        const matchesStatus = statusFilter === "All" || prop.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
        if (sortBy === "price-asc") return a.rent - b.rent;
        if (sortBy === "price-desc") return b.rent - a.rent;
        if (sortBy === "name") return a.title.localeCompare(b.title);
        return 0;
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
                        <Link className="sidebar-link active" to="/properties">
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
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: "-0.5px" }}>Properties</h2>
                        <p className="text-muted small mb-0">List, edit, and keep track of your residential assets</p>
                    </div>
                    <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
                        style={{ borderRadius: "8px", fontWeight: "600" }}
                    >
                        <FaPlus size={12} /> Add Property
                    </button>
                </div>

                {/* Filter and Search Section */}
                <div className="card border-0 shadow-sm p-3 mb-4 bg-white" style={{ borderRadius: "var(--radius)" }}>
                    <div className="row g-3">
                        {/* Search bar */}
                        <div className="col-12 col-md-4">
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control ps-5"
                                    placeholder="Search by title or city..."
                                    style={{ borderRadius: "8px" }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <FaSearch className="position-absolute text-muted" style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }} />
                            </div>
                        </div>

                        {/* Type filter */}
                        <div className="col-6 col-md-2">
                            <select 
                                className="form-select"
                                style={{ borderRadius: "8px" }}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Apartment">Apartments</option>
                                <option value="House">Houses</option>
                                <option value="Villa">Villas</option>
                            </select>
                        </div>

                        {/* Status filter */}
                        <div className="col-6 col-md-2">
                            <select 
                                className="form-select"
                                style={{ borderRadius: "8px" }}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Rented">Rented</option>
                            </select>
                        </div>

                        {/* Sorting */}
                        <div className="col-12 col-md-4">
                            <select 
                                className="form-select"
                                style={{ borderRadius: "8px" }}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="default">Sort by</option>
                                <option value="price-asc">Rent: Low to High</option>
                                <option value="price-desc">Rent: High to Low</option>
                                <option value="name">Name: A to Z</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="text-muted mt-2 small">Loading properties...</p>
                    </div>
                ) : filteredProperties.length > 0 ? (
                    <div className="row g-4">
                        {filteredProperties.map((prop) => (
                            <div key={prop.id} className="col-12 col-md-6 col-xl-4">
                                <div className="card border-0 shadow-sm overflow-hidden hover-lift bg-white h-100 position-relative" style={{ borderRadius: "var(--radius)" }}>
                                    
                                    {/* Status Badge */}
                                    <span 
                                        className={`property-badge ${prop.status === "Available" ? "bg-success text-white" : "bg-warning text-dark"}`}
                                    >
                                        {prop.status}
                                    </span>

                                    {/* Property Placeholder Image */}
                                    <div className="property-card-img text-white">
                                        🏢
                                    </div>

                                    {/* Property Body */}
                                    <div className="card-body p-4 text-start">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h5 className="fw-bold mb-0 text-dark text-truncate" style={{ maxWidth: "200px" }}>{prop.title}</h5>
                                            <span className="fw-extrabold text-primary fs-5">${prop.rent}<span className="text-muted small fw-normal">/mo</span></span>
                                        </div>

                                        <p className="text-muted small d-flex align-items-center gap-1 mb-3">
                                            <FaMapMarkerAlt /> {prop.address}
                                        </p>

                                        <div className="d-flex gap-3 border-top border-bottom py-2.5 mb-3 text-muted small">
                                            <span className="d-flex align-items-center gap-1"><FaBed /> {prop.beds} Beds</span>
                                            <span className="d-flex align-items-center gap-1"><FaBath /> {prop.baths} Baths</span>
                                            <span className="badge bg-light text-secondary border px-2 py-1">{prop.type}</span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="d-flex gap-2">
                                            <button 
                                                onClick={() => openDocDrawer(prop)}
                                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1.5 flex-grow-1 justify-content-center py-2"
                                                style={{ borderRadius: "6px", fontWeight: "600" }}
                                            >
                                                <FaFileAlt size={12} /> Documents
                                            </button>
                                            <button 
                                                onClick={() => handleEditClick(prop)}
                                                className="btn btn-sm btn-light p-2"
                                                style={{ borderRadius: "6px" }}
                                                title="Edit"
                                            >
                                                <FaEdit size={13} className="text-secondary" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(prop.id)}
                                                className="btn btn-sm btn-outline-danger p-2"
                                                style={{ borderRadius: "6px" }}
                                                title="Delete"
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="card border-0 shadow-sm p-5 text-center bg-white" style={{ borderRadius: "var(--radius)" }}>
                        <span className="fs-1 mb-2">🔍</span>
                        <h4 className="fw-bold text-dark">No Properties Found</h4>
                        <p className="text-muted mx-auto small" style={{ maxWidth: "320px" }}>
                            Try adjusting your filters or searches to find the properties you are looking for.
                        </p>
                    </div>
                )}
            </div>

            {/* ================= PROPERTY DOCUMENTS MODAL ================= */}
            {showDocModal && activeProp && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content premium-modal">
                            <div className="modal-header bg-primary text-white border-0 py-3">
                                <h5 className="modal-title fw-bold">Documents: {activeProp.title}</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDocModal(false)}></button>
                            </div>
                            <div className="modal-body p-4 text-start">
                                <div className="row g-4">
                                    {/* Upload Form */}
                                    <div className="col-12 col-md-5 border-end">
                                        <h6 className="fw-bold text-dark mb-2.5">Upload Property Document</h6>
                                        <form onSubmit={handleDocUpload}>
                                            <div className="mb-2.5">
                                                <label className="form-label small fw-semibold">Document Category</label>
                                                <select 
                                                    className="form-select form-select-sm"
                                                    value={docCategory}
                                                    onChange={(e) => setDocCategory(e.target.value)}
                                                    style={{ borderRadius: "6px" }}
                                                >
                                                    <option value="Lease">Lease Agreement</option>
                                                    <option value="Identity">Identity Check</option>
                                                    <option value="Receipt">Payment Receipt</option>
                                                    <option value="Maintenance">Maintenance Log</option>
                                                    <option value="Other">Other Docs</option>
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label small fw-semibold">Select File</label>
                                                <input 
                                                    type="file" 
                                                    className="form-control form-control-sm" 
                                                    required 
                                                    onChange={(e) => setDocFile(e.target.files[0])}
                                                    style={{ borderRadius: "6px" }}
                                                    disabled={uploadingDoc}
                                                />
                                            </div>
                                            <button 
                                                type="submit" 
                                                className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1 py-2"
                                                disabled={uploadingDoc || !docFile}
                                                style={{ borderRadius: "6px", fontWeight: "600" }}
                                            >
                                                <FaCloudUploadAlt /> Upload
                                            </button>
                                        </form>

                                        {uploadingDoc && (
                                            <div className="mt-3 p-2 bg-light rounded">
                                                <div className="d-flex justify-content-between text-muted small mb-1">
                                                    <span>Uploading...</span>
                                                    <span>{uploadProgress}%</span>
                                                </div>
                                                <div className="progress-bar-container">
                                                    <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Document List */}
                                    <div className="col-12 col-md-7">
                                        <h6 className="fw-bold text-dark mb-2.5">Uploaded Documents ({activePropDocs.length})</h6>
                                        {activePropDocs.length > 0 ? (
                                            <div className="border rounded overflow-hidden" style={{ maxHeight: "280px", overflowY: "auto" }}>
                                                <ul className="list-group list-group-flush mb-0">
                                                    {activePropDocs.map((doc) => (
                                                        <li key={doc.id} className="list-group-item d-flex align-items-center justify-content-between p-2.5">
                                                            <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: "250px" }}>
                                                                {getFileIcon(doc.name)}
                                                                <div className="text-truncate">
                                                                    <span className="small fw-semibold text-dark d-block text-truncate" title={doc.name}>{doc.name}</span>
                                                                    <span className="text-muted d-block" style={{ fontSize: "9px" }}>{doc.size} | {doc.category}</span>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex gap-1.5 flex-shrink-0">
                                                                <button 
                                                                    onClick={() => handleDownloadClick(doc.id, doc.name)}
                                                                    className="btn btn-sm btn-outline-secondary p-1"
                                                                    title="Download"
                                                                >
                                                                    <FaDownload size={11} />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDocDelete(doc.id)}
                                                                    className="btn btn-sm btn-outline-danger p-1"
                                                                    title="Delete"
                                                                >
                                                                    <FaTrash size={11} />
                                                                </button>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 border rounded bg-light">
                                                <span className="fs-3 d-block mb-1">📂</span>
                                                <p className="text-muted small mb-0">No documents uploaded for this property yet.</p>
                                                <span className="text-muted" style={{ fontSize: "9px" }}>Upload up to 10 agreements or receipts.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= ADD PROPERTY MODAL ================= */}
            {showAddModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content premium-modal">
                            <div className="modal-header bg-primary text-white border-0 py-3">
                                <h5 className="modal-title fw-bold">Add Property</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleAddSubmit}>
                                <div className="modal-body p-4 text-start">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Property Title <span className="text-danger">*</span></label>
                                        <input type="text" name="title" className="form-control" placeholder="Enter title" required value={formData.title} onChange={handleFormChange} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Property Type</label>
                                            <select name="type" className="form-select" value={formData.type} onChange={handleFormChange}>
                                                <option value="Apartment">Apartment</option>
                                                <option value="House">House</option>
                                                <option value="Villa">Villa</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Monthly Rent ($) <span className="text-danger">*</span></label>
                                            <input type="number" name="rent" className="form-control" placeholder="Rent price" required value={formData.rent} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Address <span className="text-danger">*</span></label>
                                        <input type="text" name="address" className="form-control" placeholder="Enter full address" required value={formData.address} onChange={handleFormChange} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Bedrooms</label>
                                            <input type="number" name="beds" className="form-control" min="1" value={formData.beds} onChange={handleFormChange} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Bathrooms</label>
                                            <input type="number" name="baths" className="form-control" min="1" value={formData.baths} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Status</label>
                                        <select name="status" className="form-select" value={formData.status} onChange={handleFormChange}>
                                            <option value="Available">Available</option>
                                            <option value="Rented">Rented</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3 bg-light d-flex gap-2">
                                    <button type="button" className="btn btn-secondary px-3" onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Create Listing</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= EDIT PROPERTY MODAL ================= */}
            {showEditModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content premium-modal">
                            <div className="modal-header bg-primary text-white border-0 py-3">
                                <h5 className="modal-title fw-bold">Edit Property</h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleEditSubmit}>
                                <div className="modal-body p-4 text-start">
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Property Title <span className="text-danger">*</span></label>
                                        <input type="text" name="title" className="form-control" placeholder="Enter title" required value={formData.title} onChange={handleFormChange} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Property Type</label>
                                            <select name="type" className="form-select" value={formData.type} onChange={handleFormChange}>
                                                <option value="Apartment">Apartment</option>
                                                <option value="House">House</option>
                                                <option value="Villa">Villa</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Monthly Rent ($) <span className="text-danger">*</span></label>
                                            <input type="number" name="rent" className="form-control" placeholder="Rent price" required value={formData.rent} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Address <span className="text-danger">*</span></label>
                                        <input type="text" name="address" className="form-control" placeholder="Enter full address" required value={formData.address} onChange={handleFormChange} />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Bedrooms</label>
                                            <input type="number" name="beds" className="form-control" min="1" value={formData.beds} onChange={handleFormChange} />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label small fw-semibold">Bathrooms</label>
                                            <input type="number" name="baths" className="form-control" min="1" value={formData.baths} onChange={handleFormChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-semibold">Status</label>
                                        <select name="status" className="form-select" value={formData.status} onChange={handleFormChange}>
                                            <option value="Available">Available</option>
                                            <option value="Rented">Rented</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-3 bg-light d-flex gap-2">
                                    <button type="button" className="btn btn-secondary px-3" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= DELETE CONFIRM MODAL ================= */}
            {showDeleteConfirm && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content premium-modal">
                            <div className="modal-body p-4 text-center">
                                <span className="fs-1 text-danger d-block mb-2">⚠️</span>
                                <h5 className="fw-bold text-dark">Confirm Delete</h5>
                                <p className="text-muted small">Are you sure you want to remove this property? This action is permanent.</p>
                                <div className="d-flex justify-content-center gap-2 mt-3">
                                    <button className="btn btn-secondary btn-sm px-3" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                                    <button className="btn btn-danger btn-sm px-3" onClick={confirmDelete}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Properties;
