import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8585", // Replace with your API base URL
  headers: {
    "Content-Type": "application/json", // Set the default content type
    // You can add more default headers here if needed
  },
});

export const postAPI = async ({ url, body }) => {
  const response = await axiosInstance.post(url, body);
  return response;
};
export const getAPI = async ({ url }) => {
  const response = await axiosInstance.get(url);
  return response;
};
export const putAPI = async ({ url, body }) => {
  const response = await axiosInstance.put(url, body);
  return response;
};
export const deleteAPI = async ({ url }) => {
  const response = await axiosInstance.delete(url);
  return response;
};
