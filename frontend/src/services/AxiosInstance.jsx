import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: `http://localhost:5000/api`,
    withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
    // Backend uses HTTP-only cookies, but if we have an impersonation token we send it
    const impToken = localStorage.getItem('impersonationToken');
    if (impToken) {
        config.headers.Authorization = `Bearer ${impToken}`;
    }
    return config;
});

export default axiosInstance;
