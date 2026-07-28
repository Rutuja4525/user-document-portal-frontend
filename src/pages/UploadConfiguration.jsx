import { useState, useRef } from "react";
import { uploadConfiguration } from "../services/configurationService";
import { useToast } from "../context/ToastContext";
import { 
  FaCloudUploadAlt, 
  FaFileExcel, 
  FaFileCsv, 
  FaDatabase, 
  FaTable, 
  FaCheckCircle
} from "react-icons/fa";

function UploadConfiguration() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx") && !name.endsWith(".csv")) {
      showToast("Invalid file format. Please upload an Excel (.xlsx) or CSV (.csv) file.", "error");
      return;
    }

    setSelectedFile(file);
    setLastResult(null);
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
      setLastResult(result);
      showToast(result.message || "Configuration uploaded successfully!", "success");

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

        {/* Upload Summary / Results Banner */}
        <div className="col-lg-6">
          {lastResult ? (
            <div className="card shadow-sm border-0 border-start border-4 border-success h-100">
              <div className="card-header bg-success-subtle py-3 border-0">
                <h5 className="card-title h6 mb-0 text-success font-weight-bold d-flex align-items-center gap-2">
                  <FaCheckCircle size={18} /> Import Result
                </h5>
              </div>
              <div className="card-body p-4">
                <p className="text-dark fw-semibold mb-3">{lastResult.message}</p>
                <div className="row g-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="d-block text-muted small">Uploaded DB Name</span>
                      <span className="badge bg-primary fs-6 mt-1 px-3 py-1">{lastResult.dbName}</span>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <span className="d-block text-muted small">Imported Rows</span>
                      <span className="badge bg-success fs-6 mt-1 px-3 py-1">{lastResult.rowCount} rows</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 bg-slate-50 border-dashed h-100 d-flex justify-content-center align-items-center p-4 text-center">
              <div className="py-4">
                <FaTable size={48} className="text-slate-300 mb-3" />
                <h6 className="fw-semibold text-slate-700">Configuration Format Guidelines</h6>
                <p className="text-muted small max-w-md mx-auto mb-0" style={{ maxWidth: "340px" }}>
                  Upload Excel or CSV files. Existing records for the user will be automatically replaced with the new imported dataset.
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
