import api from "../api/api";

const API_URL = process.env.REACT_APP_API_URL;
const USER_API_URL = `${API_URL}/api/users`;

export const login = async (data) => {
  try {
    const res = await api.post(`${USER_API_URL}/users/login`, data);

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
