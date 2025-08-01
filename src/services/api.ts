import axios from "axios";
import { getAuthTokens, setAuthTokens, clearAuthTokens } from "./tokenStorage";
import { logError } from "../services/logError";
import { infoLog } from "../services/info";

const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
});

let onTokenRefresh: (() => void) | null = null;

export function setOnTokenRefresh(cb: (() => void) | null) {
  onTokenRefresh = cb;
}

// Attach access token to every request
api.interceptors.request.use((config) => {
  const { accessToken } = getAuthTokens();
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Handle token refresh on bad responses
let isRefreshing = false;
let failedQueue: any[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}
// TODO: handle other bad requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = getAuthTokens();
        if (!refreshToken) throw new Error("No refresh token");

        // Adjust this endpoint and payload as needed for your backend
        const response = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refreshToken }
        );
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data;

        setAuthTokens(newAccess, newRefresh);
        api.defaults.headers.Authorization = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        // Notify AuthContext of token refresh
        if (onTokenRefresh) onTokenRefresh();

        processQueue(null, newAccess);
        return api(originalRequest);
      } catch (err) {
        clearAuthTokens();
        processQueue(err, null);
        logError(err, "Failed to refresh token");
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;