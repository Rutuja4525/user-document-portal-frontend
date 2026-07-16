import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateCompany, getCompanies } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { FaBuilding } from "react-icons/fa";

function SetupCompany() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [companyName, setCompanyName] = useState("");
    const [companies, setCompanies] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If the user already has a company name set, redirect to documents
        if (user && user.companyName) {
            navigate("/documents");
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await getCompanies();
                setCompanies(response.data);
            } catch (err) {
                console.error("Error fetching companies:", err);
            }
        };
        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!companyName.trim()) {
            setError("Company name cannot be blank!");
            showToast("Company name cannot be blank!", "error");
            return;
        }

        setLoading(true);

        try {
            const response = await updateCompany({
                companyName: companyName.trim()
            });

            login(response.data); // Update authentication state
            showToast("Company profile registered successfully!", "success");
            setTimeout(() => {
                navigate("/documents");
            }, 1000);
        } catch (err) {
            console.error("Update Company Error:", err);
            const errMsg = err.response?.data?.message || "Failed to set company name. Please try again.";
            setError(errMsg);
            showToast(errMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex align-items-center justify-content-center animate-fade-in" style={{ minHeight: "calc(100vh - 65px - 60px)", background: "#f8fafc" }}>
            <div className="card shadow-lg border-0 p-4 p-md-5" style={{ maxWidth: "500px", width: "100%", borderRadius: "var(--radius-lg)" }}>
                <div className="text-center mb-4">
                    <div className="mx-auto mb-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", borderRadius: "50%" }}>
                        <FaBuilding className="text-primary" size={28} />
                    </div>
                    <h3 className="fw-bold text-dark mb-2">Set Up Organization</h3>
                    <p className="text-muted small">Welcome, {user?.fullName}!</p>
                </div>

                {error && (
                    <div className="alert alert-danger border-0 py-2.5 small animate-fade-in mb-4" role="alert">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 text-start">
                        <label className="form-label small fw-semibold text-dark">
                            Company / Organization Name
                        </label>
                        <input
                            type="text"
                            list="companies-list"
                            className="form-control auth-input"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="Enter new or select existing company name"
                            required
                            disabled={loading}
                            style={{ height: "48px" }}
                        />
                        <datalist id="companies-list">
                            {companies.map((company, index) => (
                                <option key={index} value={company} />
                            ))}
                        </datalist>

                    </div>

                    <button
                        type="submit"
                        className="btn btn-premium w-100 d-flex align-items-center justify-content-center py-2.5"
                        disabled={loading || !companyName.trim()}
                        style={{ height: "48px" }}
                    >
                        {loading && (
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        )}
                        Complete Onboarding
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SetupCompany;
