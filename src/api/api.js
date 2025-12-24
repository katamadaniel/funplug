import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 15000,
});

// Retry config
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Delay helper
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // No config → nothing to retry
    if (!config) {
      return Promise.reject(error);
    }

    // Retry on network / timeout
    const isRetryable =
      !error.response ||
      error.code === "ECONNABORTED" ||
      error.message?.includes("Network Error");

    config.__retryCount = config.__retryCount || 0;

    if (isRetryable && config.__retryCount < MAX_RETRIES) {
      config.__retryCount += 1;

      await wait(RETRY_DELAY * config.__retryCount);

      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
