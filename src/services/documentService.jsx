import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export const getDocuments = () => axios.get(`${BASE_URL}/documents`);

export const uploadDocument = (file, category) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return axios.post(`${BASE_URL}/documents`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

export const deleteDocument = (id, type) => {
    const url = type ? `${BASE_URL}/documents/${id}?type=${type}` : `${BASE_URL}/documents/${id}`;
    return axios.delete(url);
};

export const downloadDocument = async (id, name) => {
    const response = await axios.get(`${BASE_URL}/documents/${id}/download`, {
        responseType: "blob"
    });
    const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (document.body.contains(link)) {
            document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
    }, 200);
};

export const downloadProcessedDocument = async (id, name) => {
    const response = await axios.get(`${BASE_URL}/documents/${id}/download-processed`, {
        responseType: "blob"
    });
    const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const downloadName = name ? (name.startsWith("processed_") ? name : "processed_" + name) : "processed_document";
    link.setAttribute("download", downloadName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (document.body.contains(link)) {
            document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
    }, 200);
};

export const downloadTokensExcel = async () => {
    const response = await axios.get(`${BASE_URL}/documents/download-tokens-excel`, {
        responseType: "blob"
    });
    const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Template_Tokens_Report.xlsx");
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (document.body.contains(link)) {
            document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
    }, 200);
};

export const uploadTokenMappingExcel = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${BASE_URL}/documents/upload-token-mapping`, formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};

