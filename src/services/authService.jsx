import axios from "axios";

const BASE_URL = "http://localhost:8080/api/auth";

export const registerUser = (userData) => {
    return axios.post(`${BASE_URL}/register`, userData);
};

export const loginUser = (credentials) => {
    return axios.post(`${BASE_URL}/signin`, credentials);
};

export const googleLoginUser = (googleData) => {
    return axios.post(`${BASE_URL}/google`, googleData);
};

export const changePassword = (passwordData) => {
    return axios.post(`${BASE_URL}/change-password`, passwordData);
};