import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { 
    getDocuments, uploadDocument, deleteDocument, downloadDocument, downloadProcessedDocument 
} from "../services/documentService";
import { 
    FaFileAlt, FaSearch, FaTrash, FaCloudUploadAlt, FaFileWord, FaDownload, 
    FaSpinner, FaFileSignature, FaEye, FaSyncAlt, FaCalendarAlt, FaHdd, FaFileCsv
} from "react-icons/fa";

function Documents() {
    const { showToast } = useToast();
    
    // Core states
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    
    // Form & Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [selectedCategory, setSelectedCategory] = useState("Lease Agreement");
    const [selectedFile, setSelectedFile] = useState(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState(null);

    const fetchDocs = async () => {
        try {
            const response = await getDocuments();
            setDocuments(response.data);
        } catch (error) {
            console.error("Failed to load documents", error);
            showToast("Failed to fetch documents", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    // Polling effect for documents that are "Uploaded" or "Processing"
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

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Handle drop event
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    };

    // Handle file input selection
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    // Common file validation
    const validateAndSelectFile = (file) => {
        const name = file.name.toLowerCase();
        if (!name.endsWith(".docx") && !name.endsWith(".doc") && !name.endsWith(".pdf")) {
            showToast("Only Microsoft Word documents (.doc, .docx) and PDF files (.pdf) are allowed.", "error");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showToast("File size exceeds the 5MB limit. Please upload a smaller file.", "error");
            return;
        }
        setSelectedFile(file);
    };

    // Submit file upload
    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            showToast("Please select a file first.", "warning");
            return;
        }

        setUploading(true);
        setUploadProgress(15);
        const progressInterval = setInterval(() => {
            setUploadProgress((p) => p < 90 ? p + 15 : p);
        }, 200);

        try {
            await uploadDocument(selectedFile, selectedCategory);
            clearInterval(progressInterval);
            setUploadProgress(100);
            showToast("Document uploaded successfully! Document processing initiated.", "success");
            setSelectedFile(null);
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
                fetchDocs();
            }, 500);
        } catch (error) {
            clearInterval(progressInterval);
            setUploading(false);
            setUploadProgress(0);
            console.error("Upload failed", error);
            showToast(error.response?.data?.message || "Failed to upload document", "error");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this document?")) {
            try {
                await deleteDocument(id);
                showToast("Document deleted successfully.", "success");
                fetchDocs();
                if (previewDoc && previewDoc.id === id) {
                    setPreviewDoc(null);
                }
            } catch (error) {
                console.error("Deletion failed", error);
                showToast("Failed to delete document", "error");
            }
        }
    };

    // Filter documents
    const filteredDocs = documents.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const getStatusBadge = (status) => {
        switch(status?.toLowerCase()) {
            case "uploaded":
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1">Uploaded</span>;
            case "processing":
                return (
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 d-inline-flex align-items-center gap-1">
                        <FaSpinner className="spinner-border-spinner animate-spin" style={{ animation: "spin 1.5s linear infinite", fontSize: "10px" }} />
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
            <div className="row g-4 text-start">
                
                {/* Left Side: Upload Panel */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px", position: "sticky", top: "20px" }}>
                        <h5 className="fw-bold text-dark mb-1">Upload Document</h5>
                        <p className="text-muted small mb-4">Upload Microsoft Word (.docx) or PDF files. Maximum size 5MB.</p>

                        <form onSubmit={handleUploadSubmit}>
                            {/* Drag and Drop Zone */}
                            <div 
                                className={`drag-drop-zone p-4 mb-3 border border-2 border-dashed rounded-3 text-center transition-all ${dragActive ? "border-primary bg-indigo-50/50" : "border-slate-200"}`}
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                style={{ cursor: "pointer", background: "#fafafa" }}
                                onClick={() => document.getElementById("fileInput").click()}
                            >
                                <input 
                                    type="file" 
                                    id="fileInput" 
                                    className="d-none" 
                                    onChange={handleFileChange}
                                    accept=".doc,.docx,.pdf"
                                />
                                <div className="text-muted">
                                    <FaCloudUploadAlt size={42} className="text-indigo-500 mb-2.5" style={{ color: "#6366f1" }} />
                                    {selectedFile ? (
                                        <div>
                                            <p className="fw-semibold text-slate-800 small mb-1">{selectedFile.name}</p>
                                            <span className="small text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="fw-medium text-slate-700 small mb-1">Drag and drop file here</p>
                                            <span className="small text-muted">or click to browse filesystem</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Select */}
                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-slate-700">Document Category</label>
                                <select 
                                    className="form-select border-slate-200" 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{ borderRadius: "8px" }}
                                >
                                    <option value="Lease Agreement">Lease Agreement</option>
                                    <option value="Rental Application">Rental Application</option>
                                    <option value="Addendum">Addendum</option>
                                    <option value="Management Agreement">Management Agreement</option>
                                    <option value="Vendor Contract">Vendor Contract</option>
                                    <option value="Other Documents">Other Documents</option>
                                </select>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploading && (
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between text-muted small mb-1">
                                        <span>Uploading file...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="progress" style={{ height: "6px" }}>
                                        <div 
                                            className="progress-bar progress-bar-striped progress-bar-animated bg-indigo" 
                                            role="progressbar" 
                                            style={{ width: `${uploadProgress}%`, backgroundColor: "#6366f1" }}
                                            aria-valuenow={uploadProgress} 
                                            aria-valuemin="0" 
                                            aria-valuemax="100"
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 border-0" 
                                style={{ background: "#6366f1", borderRadius: "8px" }}
                                disabled={uploading || !selectedFile}
                            >
                                {uploading ? (
                                    <>
                                        <FaSpinner className="animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt /> Process Document
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Side: Document List Grid */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px" }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <h5 className="fw-bold text-dark mb-1">Document Repository</h5>
                                <p className="text-muted mb-0 small">Secure storage and extraction workspace</p>
                            </div>
                            <button onClick={fetchDocs} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1.5" style={{ borderRadius: "6px" }}>
                                <FaSyncAlt className={loading ? "animate-spin" : ""} style={{ animation: loading ? "spin 1.5s linear infinite" : "none" }} /> Refresh
                            </button>
                        </div>

                        {/* Search & Filter Controls */}
                        <div className="row g-2 mb-4">
                            <div className="col-12 col-md-7">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0 text-slate-400">
                                        <FaSearch size={13} />
                                    </span>
                                    <input 
                                        type="text" 
                                        className="form-control border-start-0 ps-0 text-slate-700" 
                                        placeholder="Search by file name..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ outline: "none", boxShadow: "none" }}
                                    />
                                </div>
                            </div>
                            <div className="col-12 col-md-5">
                                <select 
                                    className="form-select text-slate-700"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Lease Agreement">Lease Agreement</option>
                                    <option value="Rental Application">Rental Application</option>
                                    <option value="Addendum">Addendum</option>
                                    <option value="Management Agreement">Management Agreement</option>
                                    <option value="Vendor Contract">Vendor Contract</option>
                                    <option value="Other Documents">Other Documents</option>
                                </select>
                            </div>
                        </div>

                        {/* Documents List */}
                        <div className="table-responsive">
                            {loading ? (
                                <div className="py-5 text-center text-muted">
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Loading workspace documents...
                                </div>
                            ) : filteredDocs.length === 0 ? (
                                <div className="py-5 text-center text-muted fs-7">
                                    <FaFileAlt size={32} className="mb-2.5 text-slate-300" />
                                    <p className="mb-0">No documents in repository matching the filter.</p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0">
                                    <thead>
                                        <tr className="text-slate-400 small" style={{ fontSize: "12px", borderBottom: "1.5px solid #f1f5f9" }}>
                                            <th className="fw-semibold pb-2">Document Name</th>
                                            <th className="fw-semibold pb-2">Category</th>
                                            <th className="fw-semibold pb-2">Size</th>
                                            <th className="fw-semibold pb-2">Status</th>
                                            <th className="fw-semibold pb-2 text-end">Actions</th>
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
                                                            <span className="fw-semibold text-slate-800 d-block small" style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
                                                    <div className="d-inline-flex gap-1">
                                                        <button 
                                                            onClick={() => setPreviewDoc(doc)}
                                                            className="btn btn-sm btn-light border-0 p-1.5"
                                                            title="Preview Details"
                                                        >
                                                            <FaEye size={12} className="text-slate-600" />
                                                        </button>
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
                                                                <FaFileAlt size={12} className="text-white" />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="btn btn-sm btn-light border-0 p-1.5 text-danger"
                                                            title="Delete Document"
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
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

            </div>

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 text-start shadow" style={{ borderRadius: "16px" }}>
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                                    <FaFileWord className="text-indigo-600" /> Document Preview
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setPreviewDoc(null)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body py-4">
                                <div className="row g-4">
                                    <div className="col-12 col-md-5">
                                        <div className="p-3 bg-light rounded-3" style={{ fontSize: "13px" }}>
                                            <p className="mb-2.5"><strong>File Name:</strong> <span className="text-slate-800 d-block text-truncate">{previewDoc.name}</span></p>
                                            <p className="mb-2.5"><strong>Category:</strong> <span className="text-slate-800 d-block">{previewDoc.category}</span></p>
                                            <p className="mb-2.5"><strong>File Size:</strong> <span className="text-slate-800 d-block">{previewDoc.size}</span></p>
                                            <p className="mb-2.5"><strong>Upload Date:</strong> <span className="text-slate-800 d-block"><FaCalendarAlt className="me-1.5 text-muted" />{previewDoc.date}</span></p>
                                            <p className="mb-2.5"><strong>S3 Location:</strong> <span className="text-slate-800 d-block text-truncate" title={previewDoc.s3Key}><FaHdd className="me-1.5 text-muted" />{previewDoc.s3Key}</span></p>
                                            {previewDoc.processedS3Key && (
                                                <p className="mb-0"><strong>Processed S3 Key:</strong> <span className="text-slate-800 d-block text-truncate" title={previewDoc.processedS3Key}><FaHdd className="me-1.5 text-indigo-500" />{previewDoc.processedS3Key}</span></p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-7">
                                        <div className="border border-slate-200 rounded-3 p-3 h-100" style={{ background: "#f8fafc", minHeight: "220px" }}>
                                            <h6 className="fw-semibold text-slate-800 mb-2">Token Processing Status</h6>
                                            {previewDoc.status === "Processed" ? (
                                                <div className="small text-slate-600">
                                                    <p className="text-success mb-3 d-flex align-items-center gap-1.5 fw-medium">
                                                        <FaCheckCircle /> Python Macro Completed Successfully!
                                                    </p>
                                                    <p className="mb-2">The system has scanned the document and inserted standard corporate blocks:</p>
                                                    <div className="p-2.5 bg-white rounded border border-slate-100 font-monospace mb-2 text-indigo-950" style={{ fontSize: "11px" }}>
                                                        [Client_Token_Block]<br />
                                                        [Manager_Token_Block]<br />
                                                        [Witness_Token_Block]
                                                    </div>
                                                    <p className="mb-0 text-muted">Ready to be downloaded and uploaded directly into Yardi.</p>
                                                </div>
                                            ) : previewDoc.status === "Processing" ? (
                                                <div className="h-100 d-flex flex-column align-items-center justify-content-center py-4 text-center text-muted">
                                                    <FaSpinner className="animate-spin mb-2 text-indigo-600" size={24} style={{ animation: "spin 1.5s linear infinite" }} />
                                                    <p className="mb-1 fw-medium">Extracting content and placing tokens...</p>
                                                    <span className="small text-muted">Processing simulates Python token placement.</span>
                                                </div>
                                            ) : previewDoc.status === "Failed" ? (
                                                <div className="small text-danger">
                                                    <p className="fw-bold mb-1">❌ Token Injection Failed</p>
                                                    <p className="text-slate-600 mb-0">The Python document parser returned error status. Please check your docx schema and formatting.</p>
                                                </div>
                                            ) : (
                                                <div className="small text-muted">
                                                    <p className="mb-1">Document uploaded. Processing queue initiated...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button type="button" className="btn btn-secondary border-0 small px-3.5 py-2" onClick={() => setPreviewDoc(null)} style={{ borderRadius: "8px", background: "#64748b" }}>Close</button>
                                {previewDoc.status === "Processed" && (
                                    <button 
                                        type="button" 
                                        className="btn btn-primary border-0 small px-3.5 py-2 d-inline-flex align-items-center gap-1.5" 
                                        onClick={() => {
                                            downloadProcessedDocument(previewDoc.id, previewDoc.name);
                                            setPreviewDoc(null);
                                        }}
                                        style={{ borderRadius: "8px", background: "#6366f1" }}
                                    >
                                        <FaDownload /> Download Processed
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
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

export default Documents;
