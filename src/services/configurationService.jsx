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
