import axios from "axios";

const BASE_URL = "http://localhost:8080/api/scripts";

export const uploadScriptFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getUserUploadedScripts = async () => {
  const response = await axios.get(`${BASE_URL}/user-scripts`);
  return response.data;
};

export const deleteUserScript = async (fileName) => {
  const response = await axios.delete(`${BASE_URL}/user-scripts/${encodeURIComponent(fileName)}`);
  return response.data;
};

export const downloadScriptTemplatesExcel = async () => {
  const response = await axios.get(`${BASE_URL}/download-templates-excel`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Yardi_Template_Extraction_Report.xlsx");
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
