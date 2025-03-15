// lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER,
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      Cookies.remove('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/account/login';
    }
    return Promise.reject(error);
  }
);

export default api;