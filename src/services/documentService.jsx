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

export const deleteDocument = (id) => axios.delete(`${BASE_URL}/documents/${id}`);

export const downloadDocument = async (id, name) => {
    const response = await axios.get(`${BASE_URL}/documents/${id}/download`, {
        responseType: "blob"
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export const downloadProcessedDocument = async (id, name) => {
    const response = await axios.get(`${BASE_URL}/documents/${id}/download-processed`, {
        responseType: "blob"
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "processed_" + name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
