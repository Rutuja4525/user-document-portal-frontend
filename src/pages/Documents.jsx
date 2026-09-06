import { useState, useEffect, useRef } from "react";
import { useToast } from "../context/ToastContext";
import { 
    getDocuments, uploadDocument, deleteDocument, downloadProcessedDocument, downloadTokensExcel 
} from "../services/documentService";
import { 
    FaSearch, FaTrash, FaCloudUploadAlt, FaFileWord, FaFilePdf, FaDownload, 
    FaSpinner, FaFileSignature, FaCheckCircle, FaCog, FaTimesCircle, FaFileExcel, FaFileAlt
} from "react-icons/fa";

function Documents() {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    
    // Core states
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [downloadingTokens, setDownloadingTokens] = useState(false);
    const [downloadingDocId, setDownloadingDocId] = useState(null);
    
    // Form & Search states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDownloadTokensExcel = async () => {
        setDownloadingTokens(true);
        try {
            await downloadTokensExcel();
            showToast("Token list report downloaded successfully!", "success");
        } catch (error) {
            console.error("Failed to download token list report", error);
            showToast(error.response?.data?.message || "Failed to download token report. Ensure Word (.docx) templates are uploaded.", "error");
        } finally {
            setDownloadingTokens(false);
        }
    };

    const handleDownloadProcessed = async (id, name) => {
        setDownloadingDocId(id);
        try {
            await downloadProcessedDocument(id, name);
            showToast("Processed document downloaded successfully!", "success");
        } catch (error) {
            console.error("Failed to download processed document", error);
            let errorMsg = "Failed to download processed document.";
            if (error.response?.data instanceof Blob) {
                try {
                    const text = await error.response.data.text();
                    const json = JSON.parse(text);
                    if (json.message) errorMsg = json.message;
                } catch (e) {}
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }
            showToast(errorMsg, "error");
        } finally {
            setDownloadingDocId(null);
        }
    };

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
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
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
            if (fileInputRef.current) fileInputRef.current.value = "";
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
        if (window.confirm("Are you sure you want to delete this processed document?")) {
            try {
                await deleteDocument(id, "processed");
                showToast("Document deleted successfully.", "success");
                fetchDocs();
            } catch (error) {
                console.error("Deletion failed", error);
                showToast("Failed to delete document", "error");
            }
        }
    };

    // Filter processed documents
    const filteredDocs = documents.filter((doc) => {
        return doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const activeProcessedDocs = filteredDocs.filter(d => !d.processedDeleted && (d.processingStatus === "COMPLETED" || d.processingStatus === "PROCESSING" || d.processingStatus === "PENDING" || d.processingStatus === "FAILED"));

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
        <div className="container-fluid px-4 py-4 animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)" }}>
            {/* Top Page Header - Matching Upload Script / Upload Configuration structure & fonts */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="h4 font-weight-bold text-dark mb-1 d-flex align-items-center gap-2">
                        <FaFileAlt className="text-indigo-500" style={{ color: "#6366f1" }} /> Documents
                    </h2>
                    <p className="text-muted small mb-0">
                        Upload Microsoft Word (.docx) or PDF files and manage processed document repository.
                    </p>
                </div>
            </div>

            <div className="row g-4 text-start">
                
                {/* Left Side: Upload Panel */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px", position: "sticky", top: "20px" }}>
                        <h5 className="fw-bold text-dark mb-3">Upload Document</h5>

                        <form onSubmit={handleUploadSubmit}>
                            {/* Drag and Drop Zone */}
                            <div 
                                className={`border-2 border-dashed rounded-3 p-4 text-center cursor-pointer transition-all ${
                                    dragActive
                                        ? "border-primary bg-indigo-50/50"
                                        : selectedFile
                                        ? "border-success bg-light"
                                        : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                style={{ minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="d-none" 
                                    onChange={handleFileChange}
                                    accept=".doc,.docx,.pdf"
                                />
                                {selectedFile ? (
                                    <div className="d-flex flex-column align-items-center gap-2">
                                        {selectedFile.name.toLowerCase().endsWith(".pdf") ? (
                                            <FaFilePdf size={42} className="text-danger" />
                                        ) : (
                                            <FaFileWord size={42} className="text-indigo-600" style={{ color: "#6366f1" }} />
                                        )}
                                        <div>
                                            <p className="fw-semibold mb-0 text-dark">{selectedFile.name}</p>
                                            <p className="text-muted small mb-0">
                                                {(selectedFile.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="d-flex flex-column align-items-center gap-2">
                                        <FaCloudUploadAlt size={42} className="text-indigo-500 mb-1" style={{ color: "#6366f1" }} />
                                        <p className="fw-medium text-slate-700 small mb-1">Drag and drop file here</p>
                                        <span className="small text-muted">Supports Microsoft Word (.docx) & PDF (.pdf)</span>
                                    </div>
                                )}
                            </div>

                            {/* Upload Progress Bar */}
                            {uploading && (
                                <div className="mt-3">
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

                            <div className="mt-4 d-flex gap-2">
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
                                            <FaCloudUploadAlt size={16} /> Upload and Process Document
                                        </>
                                    )}
                                </button>
                                {selectedFile && !uploading && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Side: Processed Document Repository Grid */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm p-4 bg-white" style={{ borderRadius: "16px" }}>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                            <div>
                                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                                    <FaCheckCircle className="text-success" /> Processed Document Repository
                                </h5>
                                <p className="text-muted mb-0 small">Processed documents ready for Yardi import</p>
                            </div>
                            <div>
                                <button 
                                    type="button" 
                                    onClick={handleDownloadTokensExcel}
                                    className="btn btn-outline-success btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2" 
                                    style={{ borderRadius: "8px", fontSize: "12px" }}
                                    disabled={downloadingTokens}
                                >
                                    {downloadingTokens ? (
                                        <>
                                            <FaSpinner className="animate-spin" /> Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FaFileExcel size={14} /> Download Token List (Excel)
                                        </>
                                    )}
                                </button>
                            </div>
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

                        {/* Processed Documents List */}
                        <div className="table-responsive">
                            {loading ? (
                                <div className="py-5 text-center text-muted">
                                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                    Loading processed documents...
                                </div>
                            ) : activeProcessedDocs.length === 0 ? (
                                <div className="p-4 rounded-3 text-center border border-dashed border-slate-200 bg-slate-50/50">
                                    <FaFileSignature size={36} className="text-slate-300 mb-2" />
                                    <p className="fw-medium text-slate-700 small mb-1">No processed documents matching the filter</p>
                                    <p className="text-muted small mb-0">
                                        Upload Microsoft Word (.docx) or PDF files using the panel on the left to start processing documents.
                                    </p>
                                </div>
                            ) : (
                                <table className="table align-middle table-hover mb-0">
                                    <thead>
                                        <tr className="text-slate-400 small" style={{ fontSize: "12px", borderBottom: "1.5px solid #f1f5f9" }}>
                                            <th className="fw-semibold pb-2">Document Name</th>
                                            <th className="fw-semibold pb-2">Size</th>
                                            <th className="fw-semibold pb-2 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeProcessedDocs.map((doc) => (
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
                                                            <span className="fw-semibold text-slate-800 d-block small" style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                                {doc.name}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: "10px" }}>{doc.date}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-2.5 small text-slate-600">{doc.size}</td>
                                                <td className="py-2.5 text-end">
                                                    <div className="d-inline-flex align-items-center gap-2">
                                                        {doc.processingStatus === "COMPLETED" ? (
                                                            <button 
                                                                onClick={() => handleDownloadProcessed(doc.id, doc.name)}
                                                                disabled={downloadingDocId === doc.id}
                                                                className="btn btn-sm d-inline-flex align-items-center gap-1.5 border-0 px-3 py-1.5"
                                                                style={{ background: "#dcfce7", color: "#16a34a", borderRadius: "6px", fontSize: "12px", fontWeight: 600 }}
                                                                title="Download Processed File"
                                                            >
                                                                {downloadingDocId === doc.id ? (
                                                                    <>
                                                                        <FaSpinner className="animate-spin" size={11} /> Downloading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <FaDownload size={11} /> Download
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : doc.processingStatus === "PROCESSING" || doc.processingStatus === "PENDING" ? (
                                                            <span className="text-muted small d-inline-flex align-items-center gap-1">
                                                                <FaCog size={10} className="animate-spin" /> Processing…
                                                            </span>
                                                        ) : null}

                                                        <button 
                                                            onClick={() => handleDelete(doc.id)}
                                                            className="btn btn-sm btn-light border-0 p-1.5 text-danger"
                                                            title="Delete Processed Record"
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
