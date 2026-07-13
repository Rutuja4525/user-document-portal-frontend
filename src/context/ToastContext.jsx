import React, { createContext, useContext, useState, useCallback } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes, FaExclamationTriangle } from "react-icons/fa";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.map(t => t.id === id ? { ...t, removing: true } : t));
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300); // matches the slideOut animation duration (300ms)
    }, []);

    const showToast = useCallback((message, type = "info", duration = 4000) => {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration, removing: false }]);
        
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const getIcon = (type) => {
        switch (type) {
            case "success": return <FaCheckCircle className="toast-icon-svg" />;
            case "error": return <FaExclamationCircle className="toast-icon-svg" />;
            case "warning": return <FaExclamationTriangle className="toast-icon-svg" />;
            case "info":
            default:
                return <FaInfoCircle className="toast-icon-svg" />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div 
                        key={toast.id} 
                        className={`toast-item toast-${toast.type} ${toast.removing ? "removing" : ""}`}
                    >
                        <span className="toast-icon">{getIcon(toast.type)}</span>
                        <div className="toast-content">{toast.message}</div>
                        <button 
                            type="button"
                            className="toast-close" 
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        >
                            <FaTimes size={12} />
                        </button>
                        {!toast.removing && (
                            <div 
                                className="toast-progress" 
                                style={{ animationDuration: `${toast.duration}ms` }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
