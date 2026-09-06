import { useState, useRef, useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { uploadScriptFile, getUserUploadedScripts, deleteUserScript, downloadScriptTemplatesExcel } from "../services/scriptService";
import { 
  FaCloudUploadAlt, 
  FaFileExcel, 
  FaFileCode, 
  FaSpinner, 
  FaCheckCircle,
  FaTrash,
  FaDatabase
} from "react-icons/fa";

function UploadScript() {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplates, setDownloadingTemplates] = useState(false);
  const [uploadedScripts, setUploadedScripts] = useState([]);
  const [deletingFileName, setDeletingFileName] = useState(null);

  useEffect(() => {
    fetchUserScripts();
  }, []);

  const fetchUserScripts = async () => {
    try {
      const scripts = await getUserUploadedScripts();
      setUploadedScripts(scripts);
    } catch (err) {
      console.error("Failed to fetch uploaded script list:", err);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    const validExtensions = [".txt", ".sql", ".script", ".ds", ".yardi"];
    const isValid = validExtensions.some(ext => name.endsWith(ext));

    if (!isValid) {
      showToast("Invalid script format. Allowed files: .txt, .sql, .script, .ds, .yardi", "error");
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast("Please select a Yardi script file first.", "warning");
      return;
    }

    const uploadedFileName = selectedFile.name;
    try {
      setUploading(true);
      await uploadScriptFile(selectedFile);
      showToast(`Script '${uploadedFileName}' uploaded successfully!`, "success");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchUserScripts();
    } catch (err) {
      console.error("Failed to upload script file:", err);
      showToast(err.response?.data?.message || "Failed to upload script file.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteScript = async (fileName) => {
    try {
      setDeletingFileName(fileName);
      await deleteUserScript(fileName);
      showToast(`Script '${fileName}' deleted successfully.`, "success");
      await fetchUserScripts();
    } catch (err) {
      console.error("Failed to delete script file:", err);
      showToast("Failed to delete script file.", "error");
    } finally {
      setDeletingFileName(null);
    }
  };

  const handleDownloadScriptTemplatesExcel = async () => {
    try {
      setDownloadingTemplates(true);
      await downloadScriptTemplatesExcel();
      showToast("Yardi script template report downloaded successfully!", "success");
    } catch (err) {
      console.error("Failed to download script template report:", err);
      let errorMsg = "Failed to download script template report.";
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) errorMsg = parsed.message;
        } catch (ignored) {}
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      showToast(errorMsg, "error");
    } finally {
      setDownloadingTemplates(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4 animate-fade-in" style={{ background: "#f8fafc", minHeight: "calc(100vh - 65px)" }}>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 font-weight-bold text-slate-800 mb-1 d-flex align-items-center gap-2">
            <FaFileCode className="text-primary" /> Upload Script
          </h2>
          <p className="text-muted small mb-0">
            Upload Yardi lease scripts (.txt, .sql, .script, .ds, .yardi) and extract template references into an Excel report.
          </p>
        </div>
      </div>

      <div className="row g-4 text-start">
        {/* Left Column: Upload Form */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 bg-white p-4" style={{ borderRadius: "16px", position: "sticky", top: "20px" }}>
            <h5 className="fw-bold text-dark mb-3">Upload Script File</h5>

            <form onSubmit={handleUploadSubmit}>
              {/* Drag & Drop Zone */}
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
                  accept=".txt,.sql,.script,.ds,.yardi"
                  className="d-none"
                />

                {selectedFile ? (
                  <div className="d-flex flex-column align-items-center gap-2">
                    <FaFileCode size={42} className="text-indigo-600" style={{ color: "#6366f1" }} />
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
                    <p className="fw-medium text-slate-700 small mb-1">Drag and drop script file here</p>
                    <span className="small text-muted">Supports .txt, .sql, .script, .ds, .yardi</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 d-flex flex-column gap-2">
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 border-0"
                  style={{ background: "#6366f1", borderRadius: "8px" }}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Uploading Script...
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt size={16} /> Upload Script File
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Uploaded Script Repository Workspace */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 bg-white p-4" style={{ borderRadius: "16px" }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <FaDatabase className="text-indigo-500" style={{ color: "#6366f1" }} /> Uploaded Script Repository
                </h5>
                <p className="text-muted mb-0 small">Overview of uploaded Yardi lease scripts and extracted template references</p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleDownloadScriptTemplatesExcel}
                  className="btn btn-outline-success btn-sm px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{ borderRadius: "8px", fontSize: "12px" }}
                  disabled={downloadingTemplates}
                >
                  {downloadingTemplates ? (
                    <>
                      <FaSpinner className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <FaFileExcel size={14} /> Download Template List (Excel)
                    </>
                  )}
                </button>
              </div>
            </div>

            {uploadedScripts.length > 0 ? (
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0">
                  <thead>
                    <tr className="text-slate-400 small" style={{ fontSize: "12px", borderBottom: "1.5px solid #f1f5f9" }}>
                      <th className="fw-semibold pb-2">Script Name</th>
                      <th className="fw-semibold pb-2">File Size</th>
                      <th className="fw-semibold pb-2">Upload Time</th>
                      <th className="fw-semibold pb-2 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedScripts.map((script) => (
                      <tr key={script.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <FaFileCode className="text-indigo-500 flex-shrink-0" size={16} style={{ color: "#6366f1" }} />
                            <span className="fw-semibold text-slate-800 small">{script.name}</span>
                          </div>
                        </td>
                        <td className="small text-muted">{script.size}</td>
                        <td className="small text-muted">{script.uploadedAt}</td>
                        <td className="text-end">
                          <button
                            onClick={() => handleDeleteScript(script.name)}
                            disabled={deletingFileName === script.name}
                            className="btn btn-sm btn-outline-danger border-0 p-1.5"
                            title="Delete Script"
                          >
                            {deletingFileName === script.name ? (
                              <FaSpinner className="animate-spin" size={14} />
                            ) : (
                              <FaTrash size={14} />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-3 text-center border border-dashed border-slate-200 bg-slate-50/50">
                <FaFileCode size={36} className="text-slate-300 mb-2" />
                <p className="fw-medium text-slate-700 small mb-1">No scripts uploaded to repository yet</p>
                <p className="text-muted small mb-0">
                  Upload Yardi script files using the panel on the left or click Download Template List (Excel) to extract template references.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadScript;
