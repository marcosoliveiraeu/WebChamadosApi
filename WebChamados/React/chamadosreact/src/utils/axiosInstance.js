

import axios from 'axios';

const getAxiosInstance = (baseURL , storedToken) => {
  const instance = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${storedToken}` }
  });
  instance.interceptors.request.use(async (request) => {
    request.headers.Authorization = `Bearer ${storedToken}`;
    return request;
  });
  return instance;
};

export default getAxiosInstance;
