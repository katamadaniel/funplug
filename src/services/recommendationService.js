import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const HOME_API_URL = `${API_URL}/api/recommendations`;

export const fetchRecommendations = async (type, params = {}) => {
  const res = await axiosInstance.get(`${HOME_API_URL}/${type}`, {
    params,
  });
  return res.data;
};
