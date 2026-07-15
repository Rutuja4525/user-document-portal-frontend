import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Force users without a company name to complete organization setup
    if (!user.companyName && location.pathname !== "/setup-company") {
        return <Navigate to="/setup-company" replace />;
    }

    // Prevent users with a company name from visiting organization setup
    if (user.companyName && location.pathname === "/setup-company") {
        return <Navigate to="/documents" replace />;
    }

    return children;
}

export default ProtectedRoute;
