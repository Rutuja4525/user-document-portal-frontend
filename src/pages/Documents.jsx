import { useState, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { 
    getDocuments, uploadDocument, deleteDocument, downloadDocument, downloadProcessedDocument 
} from "../services/documentService";
import { 
    FaFileAlt, FaSearch, FaTrash, FaCloudUploadAlt, FaFileWord, FaFilePdf, FaDownload, 
    FaSpinner, FaFileSignature, FaSyncAlt, FaFileCsv, FaCheckCircle, FaCog, FaTimesCircle
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
    const [selectedFile, setSelectedFile] = useState(null);



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

    // Auto-poll while any document is still processing
    useEffect(() => {
        const hasProcessing = documents.some(
            (doc) => doc.processingStatus === "PENDING" || doc.processingStatus === "PROCESSING"
        );
        if (hasProcessing) {
            const interval = setInterval(() => {
                fetchDocs();
            }, 5000);
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
        if (file.size > 100 * 1024 * 1024) {
            showToast("File size exceeds the 100MB limit. Please upload a smaller file.", "error");
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
            await uploadDocument(selectedFile, "Other Documents");
            clearInterval(progressInterval);
            setUploadProgress(100);
            showToast("Document uploaded successfully!", "success");
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

            } catch (error) {
                console.error("Deletion failed", error);
                showToast("Failed to delete document", "error");
            }
        }
    };

    // Filter documents
    const filteredDocs = documents.filter((doc) => {
        return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case "PENDING":
            case "PROCESSING":
                return (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 d-inline-flex align-items-center gap-1">
                        <FaCog size={10} className="animate-spin" /> Processing…
                    </span>
                );
            case "COMPLETED":
                return (
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 d-inline-flex align-items-center gap-1">
                        <FaCheckCircle size={10} /> Processed
                    </span>
                );
            case "FAILED":
                return (
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 d-inline-flex align-items-center gap-1">
                        <FaTimesCircle size={10} /> Failed
                    </span>
                );
            default:
                return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1">Uploaded</span>;
        }
    };

    return (
        <div className="container-fluid py-4 px-md-5 animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)" }}>
            <div className="row g-4 text-start">
                
                {/* Left Side: Upload Panel */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px", position: "sticky", top: "20px" }}>
                        <h5 className="fw-bold text-dark mb-1">Upload Document</h5>
                        <p className="text-muted small mb-4">Upload Microsoft Word (.docx) or PDF files. Maximum size 100MB.</p>

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
                                        <FaCloudUploadAlt /> Upload Document
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

                        {/* Search Control */}
                        <div className="row g-2 mb-4">
                            <div className="col-12">
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
                                                        {doc.name.toLowerCase().endsWith(".pdf") ? (
                                                            <div className="p-2 rounded-2 bg-danger-subtle text-danger">
                                                                <FaFilePdf size={16} />
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 rounded-2 bg-indigo-50 text-indigo-600">
                                                                <FaFileWord size={16} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="fw-semibold text-slate-800 d-block small" style={{ maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: "10px" }}>{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 small text-slate-600">{doc.size}</td>
                                                <td className="py-2.5">{getStatusBadge(doc.processingStatus)}</td>
                                                <td className="py-2.5 text-end">
                                                    <div className="d-inline-flex gap-1">

                                                        <button 
                                                            onClick={() => downloadDocument(doc.id, doc.name)}
                                                            className="btn btn-sm btn-light border-0 p-1.5"
                                                            title="Download Original"
                                                        >
                                                            <FaDownload size={12} className="text-slate-600" />
                                                        </button>

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

            {/* ── Processed Document Repository (Full-Width Section Below) ── */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px" }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                    <FaCheckCircle className="text-success" /> Processed Document Repository
                                </h5>
                                <p className="text-muted mb-0 small">Macro-processed documents ready for Yardi import</p>
                            </div>
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2" style={{ fontSize: "12px" }}>
                                {filteredDocs.filter(d => d.processingStatus === "COMPLETED").length} processed
                            </span>
                        </div>

                        <div className="table-responsive">
                            {loading ? (
                                <div className="py-5 text-center text-muted">
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Loading processed documents...
                                </div>
                            ) : filteredDocs.filter(d => d.processingStatus === "COMPLETED" || d.processingStatus === "PROCESSING" || d.processingStatus === "PENDING" || d.processingStatus === "FAILED").length === 0 ? (
                                <div className="py-5 text-center text-muted fs-7">
                                    <FaFileSignature size={32} className="mb-2.5 text-slate-300" />
                                    <p className="mb-0">No processed documents yet. Upload a .docx or .pdf file above to start processing.</p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0">
                                    <thead>
                                        <tr className="text-slate-400 small" style={{ fontSize: "12px", borderBottom: "1.5px solid #f1f5f9" }}>
                                            <th className="fw-semibold pb-2">Document Name</th>
                                            <th className="fw-semibold pb-2">Size</th>
                                            <th className="fw-semibold pb-2">Processing Status</th>
                                            <th className="fw-semibold pb-2 text-end">Download</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs
                                            .filter(d => d.processingStatus === "COMPLETED" || d.processingStatus === "PROCESSING" || d.processingStatus === "PENDING" || d.processingStatus === "FAILED")
                                            .map((doc) => (
                                            <tr key={"proc-" + doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td className="py-2.5">
                                                    <div className="d-flex align-items-center gap-2.5">
                                                        {doc.name.toLowerCase().endsWith(".pdf") ? (
                                                            <div className="p-2 rounded-2 bg-danger-subtle text-danger">
                                                                <FaFilePdf size={16} />
                                                            </div>
                                                        ) : (
                                                            <div className="p-2 rounded-2" style={{ background: "#dcfce7", color: "#16a34a" }}>
                                                                <FaFileWord size={16} />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <span className="fw-semibold text-slate-800 d-block small" style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: "10px" }}>{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 small text-slate-600">{doc.size}</td>
                                                <td className="py-2.5">{getStatusBadge(doc.processingStatus)}</td>
                                                <td className="py-2.5 text-end">
                                                    {doc.processingStatus === "COMPLETED" ? (
                                                        <button 
                                                            onClick={() => downloadProcessedDocument(doc.id, doc.name)}
                                                            className="btn btn-sm d-inline-flex align-items-center gap-1.5 border-0 px-3 py-1.5"
                                                            style={{ background: "#dcfce7", color: "#16a34a", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}
                                                            title="Download Processed File"
                                                        >
                                                            <FaDownload size={11} /> Download
                                                        </button>
                                                    ) : doc.processingStatus === "FAILED" ? (
                                                        <span className="text-muted small">—</span>
                                                    ) : (
                                                        <span className="text-muted small d-inline-flex align-items-center gap-1">
                                                            <FaCog size={10} className="animate-spin" /> Processing…
                                                        </span>
                                                    )}
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
