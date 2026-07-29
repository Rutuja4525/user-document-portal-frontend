import { useState, useRef, useEffect } from "react";
import { uploadConfiguration, getConfigurationSummaries } from "../services/configurationService";
import { useToast } from "../context/ToastContext";
import { 
  FaCloudUploadAlt, 
  FaFileExcel, 
  FaFileCsv, 
  FaDatabase, 
  FaTable, 
  FaCheckCircle,
  FaClock
} from "react-icons/fa";

function UploadConfiguration() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Active Configuration State (persisted from backend)
  const [configSummary, setConfigSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      let date;
      if (Array.isArray(dateValue)) {
        // Handle Spring Boot LocalDateTime array: [year, month, day, hour, minute, second]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateValue;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateValue === "string") {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        return String(dateValue);
      }

      if (isNaN(date.getTime())) {
        return String(dateValue);
      }

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch (e) {
      return String(dateValue);
    }
  };

  const fetchConfigurationSummary = async () => {
    try {
      setLoadingSummary(true);
      const response = await getConfigurationSummaries();
      if (response.data && response.data.length > 0) {
        // Most recent configuration
        setConfigSummary(response.data[0]);
      } else {
        setConfigSummary(null);
      }
    } catch (err) {
      console.error("Failed to fetch configuration summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    fetchConfigurationSummary();
  }, []);

  const handleFileSelect = (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".csv")) {
      showToast("Invalid file format. Please upload an Excel (.xlsx) or CSV (.csv) file.", "error");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Please select a file to upload.", "warning");
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    // Simulate progress effect
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const response = await uploadConfiguration(selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = response.data;
      showToast(result.message || "Configuration uploaded successfully!", "success");

      // Refresh active configuration summary from backend
      await fetchConfigurationSummary();

      // Reset file selection
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      const errMsg = err.response?.data?.message || err.message || "Failed to upload configuration file.";
      showToast(errMsg, "error");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <div className="container py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 font-weight-bold text-dark mb-1 d-flex align-items-center gap-2">
            <FaDatabase className="text-primary" /> Upload Configuration
          </h2>
          <p className="text-muted small mb-0">
            Import Excel (.xlsx) or CSV (.csv) configuration files into database schema.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Upload Form Card */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-bottom">
              <h5 className="card-title h6 mb-0 font-weight-bold text-slate-800 d-flex align-items-center gap-2">
                <FaCloudUploadAlt className="text-primary" size={18} /> Upload New Configuration File
              </h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleUpload}>
                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3 p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary-subtle"
                      : selectedFile
                      ? "border-success bg-light"
                      : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                  }`}
                  style={{ minHeight: "180px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    accept=".xlsx,.csv"
                    className="d-none"
                  />

                  {selectedFile ? (
                    <div className="d-flex flex-column align-items-center gap-2">
                      {selectedFile.name.endsWith(".csv") ? (
                        <FaFileCsv size={42} className="text-info" />
                      ) : (
                        <FaFileExcel size={42} className="text-success" />
                      )}
                      <div>
                        <p className="fw-semibold mb-0 text-dark">{selectedFile.name}</p>
                        <p className="text-muted small mb-0">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <span className="badge bg-success mt-1">Ready for Import</span>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div className="p-3 bg-white rounded-circle shadow-sm">
                        <FaCloudUploadAlt size={32} className="text-primary" />
                      </div>
                      <div>
                        <p className="fw-semibold text-slate-700 mb-1">
                          Drag & Drop configuration file here
                        </p>
                        <p className="text-muted small mb-0">
                          Supports <span className="fw-bold text-dark">.xlsx</span> & <span className="fw-bold text-dark">.csv</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary mt-2 px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse File
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload Progress Bar */}
                {uploading && (
                  <div className="mt-3">
                    <div className="d-flex justify-content-between small text-muted mb-1">
                      <span>Importing & Refreshing Data...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="mt-4 d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2 fw-semibold"
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FaCloudUploadAlt size={16} /> Upload & Import
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
        </div>

        {/* Uploaded Configuration Details Card */}
        <div className="col-lg-6">
          {loadingSummary ? (
            <div className="card shadow-sm border-0 h-100 d-flex justify-content-center align-items-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading configuration details...</span>
              </div>
            </div>
          ) : configSummary ? (
            <div className="card shadow-sm border-0 border-start border-4 border-primary h-100">
              <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="card-title h6 mb-0 font-weight-bold text-slate-800 d-flex align-items-center gap-2">
                  <FaDatabase className="text-primary" size={18} /> Active Configuration DB
                </h5>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  <FaCheckCircle className="me-1" /> Active
                </span>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="p-3 bg-light rounded border border-slate-100">
                      <span className="d-block text-muted small fw-semibold text-uppercase mb-1">
                        Database Name
                      </span>
                      <span className="fs-5 fw-bold text-primary text-break">
                        {configSummary.dbName}
                      </span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="p-3 bg-light rounded border border-slate-100">
                      <span className="d-block text-muted small fw-semibold text-uppercase mb-1 d-flex align-items-center gap-1">
                        <FaClock size={12} className="text-secondary" /> Upload Date & Time
                      </span>
                      <span className="fw-semibold text-dark">
                        {formatDate(configSummary.lastUpdated)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 bg-slate-50 border-dashed h-100 d-flex justify-content-center align-items-center p-4 text-center">
              <div className="py-4">
                <FaDatabase size={48} className="text-slate-300 mb-3" />
                <h6 className="fw-semibold text-slate-600">No Database Configuration Uploaded</h6>
                <p className="text-muted small max-w-md mx-auto mb-0" style={{ maxWidth: "320px" }}>
                  Upload an Excel or CSV file to import and set up your active configuration database.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadConfiguration;

