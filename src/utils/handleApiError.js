export const handleApiError = (error) => {
  // 📴 Offline
  if (!navigator.onLine) {
    return {
      success: false,
      type: "OFFLINE",
      message: "You are offline. Please reconnect to the internet.",
    };
  }

  // 🌐 Network / CORS / server down
  if (!error.response) {
    return {
      success: false,
      type: "NETWORK",
      message: "Unable to reach server. Please try again later.",
    };
  }

  // 🔐 Auth errors
  if (error.response.status === 401) {
    return {
      success: false,
      type: "UNAUTHORIZED",
      message: "Session expired. Please log in again.",
    };
  }

  // 🚫 Forbidden
  if (error.response.status === 403) {
    return {
      success: false,
      type: "FORBIDDEN",
      message: "You do not have permission to perform this action.",
    };
  }

  // ❌ Validation / bad request
  if (error.response.status === 400) {
    return {
      success: false,
      type: "VALIDATION",
      message: error.response.data?.message || "Invalid request",
    };
  }

  // 💥 Server error
  if (error.response.status >= 500) {
    return {
      success: false,
      type: "SERVER",
      message: "Server error. Please try again later.",
    };
  }

  return {
    success: false,
    type: "UNKNOWN",
    message: "Something went wrong.",
  };
};
