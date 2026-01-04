import api from "../api/api";

export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return handleApiError(error);
  }
};
