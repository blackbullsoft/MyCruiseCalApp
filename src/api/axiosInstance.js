import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: 'http://cruisecal.blackbullsolution.com/api', // Base URL
  headers: {
    'Content-Type': ' application/json',
  },
});

// Response interceptor for handling API responses or errors
axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  },
);

// Method to call GET API
export const getApi = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, {params});
    return response.data;
  } catch (error) {
    console.error('GET API Error:', error);
    throw error;
  }
};

// Method to call POST API
export const postApi = async (url, data) => {
  try {
    const response = await axiosInstance.post(url, data);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('POST API Error:', error);
    throw error;
  }
};

// Method to call PUT API
export const putApi = async (url, data) => {
  try {
    const response = await axiosInstance.put(url, data);
    return response.data;
  } catch (error) {
    console.error('PUT API Error:', error);
    throw error;
  }
};

// Method to call DELETE API
export const deleteApi = async (url, params = {}) => {
  try {
    const response = await axiosInstance.delete(url, {params});
    return response.data;
  } catch (error) {
    console.error('DELETE API Error:', error);
    throw error;
  }
};

export default axiosInstance;
