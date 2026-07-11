import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

export const getProperties = () => axios.get(`${BASE_URL}/properties`);
export const createProperty = (data) => axios.post(`${BASE_URL}/properties`, data);
export const updateProperty = (id, data) => axios.put(`${BASE_URL}/properties/${id}`, data);
export const deleteProperty = (id) => axios.delete(`${BASE_URL}/properties/${id}`);

export const getPropertyDocuments = (propertyId) => axios.get(`${BASE_URL}/properties/${propertyId}/documents`);
export const getAllDocuments = () => axios.get(`${BASE_URL}/documents`);
export const uploadPropertyDocument = (propertyId, file, category) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    return axios.post(`${BASE_URL}/properties/${propertyId}/documents`, formData, {
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
