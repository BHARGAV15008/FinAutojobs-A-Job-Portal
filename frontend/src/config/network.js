import API_BASE_URL, { SOCKET_URL } from '../services/apiConfig';

export const networkConfig = {
  development: {
    baseURL: API_BASE_URL,
    socketURL: SOCKET_URL,
    timeout: 60000
  },
  production: {
    baseURL: API_BASE_URL,
    socketURL: SOCKET_URL,
    timeout: 60000
  }
};

export const getCurrentConfig = () => {
  const env = import.meta.env.MODE || 'development';
  return networkConfig[env];
};

export const buildAPIEndpoint = (path) => {
  const config = getCurrentConfig();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${config.baseURL}/${cleanPath}`;
};

export const buildSocketURL = () => {
  const config = getCurrentConfig();
  return config.socketURL;
};

export default {
  getCurrentConfig,
  buildAPIEndpoint,
  buildSocketURL,
};