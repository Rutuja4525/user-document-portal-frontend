import axios from "axios";

const BASE_URL = "http://localhost:8080/api/configuration";

export const uploadConfiguration = (file, dbName = "") => {
  const formData = new FormData();
  formData.append("file", file);
  if (dbName && dbName.trim() !== "") {
    formData.append("dbName", dbName.trim());
  }

  return axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getConfigurationSummaries = () => {
  return axios.get(BASE_URL);
};

export const getConfigurationByDbName = (dbName) => {
  return axios.get(`${BASE_URL}/${encodeURIComponent(dbName)}`);
};

export const deleteConfigurationByDbName = (dbName) => {
  return axios.delete(`${BASE_URL}/${encodeURIComponent(dbName)}`);
};

export const downloadPkgByDbName = async (dbName) => {
  const response = await axios.get(`${BASE_URL}/download/${encodeURIComponent(dbName)}`, {
    responseType: "blob",
  });
  const fileName = `ldp_config_${(dbName || "").toLowerCase()}.pkg`;
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
