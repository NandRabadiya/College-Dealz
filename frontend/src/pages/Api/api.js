
// api.js
import axios from 'axios';
import { getApiBaseUrl } from './autoServer';
//let API_BASE_URL = 'http://localhost:8080'; // Default base URL for local development
let API_BASE_URL = 'https://college-dealz.duckdns.org/app1'; // Default base URL
//let API_BASE_URL = 'http://ec2-44-220-63-76.compute-1.amazonaws.com:8443';
let api = null;

// Call this ONCE at app startup
export const initApi = async () => {
 //API_BASE_URL = await getApiBaseUrl();

  api = axios.create({
    baseURL: API_BASE_URL,
  });

  const token = localStorage.getItem('jwt');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.defaults.headers.post['Content-Type'] = 'application/json';
};

// Access the API instance safely after initialization
// export const getApi = () => {
//   if (!api) {
//     throw new Error('API not initialized. Call initApi() before using getApi().');
//   }
//   return api;
// };

export { API_BASE_URL };

export default api
