import axiosInstance from './axiosInstance';

const API_URL = process.env.REACT_APP_API_URL;
const FOLLOW_API_URL = `${API_URL}/api/follow`;

export const followService = {
  follow: async (userId, payload) => {
    const res = await axiosInstance.post(
      `${FOLLOW_API_URL}/${userId}/follow`,
      payload
    );
    return res.data;
  },

  unfollow: async (userId) => {
    const res = await axiosInstance.delete(
      `${FOLLOW_API_URL}/${userId}`
    );
    return res.data;
  },

  getFollowerCount: async (userId) => {
    const res = await axiosInstance.get(
      `${FOLLOW_API_URL}/${userId}/count`
    );
    return res.data;
  },
};

export const getFollowers = async (userId, page = 0) => {
  const res = await axiosInstance.get(
    `${FOLLOW_API_URL}/${userId}/followers?page=${page}`
  );

  return {
    followers: res.data.followers || [],
    total: res.data.total || 0,
    page: res.data.page || 0
  };
};

export const sendBroadcastEmail = async (userId, payload) => {
  const res = await axiosInstance.post(
    `${FOLLOW_API_URL}/${userId}/broadcast`,
    payload
  );
  return res.data;
};

export const getFollowerAnalytics = async (userId) => {
  const res = await axiosInstance.get(`${FOLLOW_API_URL}/${userId}/analytics`, {
  });
  return res.data;
};

export const getFollowerGrowth = async (userId) => {
  const res = await axiosInstance.get(`${FOLLOW_API_URL}/${userId}/growth`, {
  });
  return res.data;
};
