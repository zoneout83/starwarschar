import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef
} from "react";
import jwtDecode from "jwt-decode";
import api, { setOnTokenRefresh } from "../services/api";
import {
  getAuthTokens,
  setAuthTokens,
  clearAuthTokens,
} from "../services/tokenStorage";
import { logError } from "../services/logError";
import { infoLog } from "../services/info";
type JwtPayload = { sub: string; exp: number };

export interface AuthContextType {
  user: string | null;
  expiresIn: number;
  isAuthenticated: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  expiresIn: 0,
  isAuthenticated: false,
  login: async () => { },
  logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number>(0);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === "true";
  const mockUser = import.meta.env.VITE_AUTH_MOCK_USER;
  const mockPass = import.meta.env.VITE_AUTH_MOCK_PASS;
  const refreshMargin = Number(import.meta.env.VITE_JWT_AUTO_REFRESH_SECONDS);
  const jwtExpiresMinutes = Number(import.meta.env.VITE_JWT_EXPIRES_MINUTES);
  const autoRefresh = import.meta.env.VITE_JWT_AUTO_REFRESH === "true";

  // Logout function must be above scheduleRefresh
  const logout = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    clearAuthTokens();
    setUser(null);
    setExpiresIn(0);
    delete api.defaults.headers.Authorization;
  }, []);

  // Schedule a silent refresh or logout
  const scheduleRefresh = useCallback(
    (expires: number) => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);

      if (expires > refreshMargin) {
        let ms = (expires - refreshMargin) * 1000;
        if (autoRefresh) {
          infoLog("Scheduling silent refresh in " + ms / 1000 + " seconds");
          refreshTimer.current = setTimeout(async () => {
            if (useMockAuth) {
              // Simulate silent refresh for mock auth
              const now = Math.floor(Date.now() / 1000);
              const ttl = jwtExpiresMinutes || 60;
              const exp = now + ttl * 60;
              const fakeToken =
                btoa(JSON.stringify({ alg: "none", typ: "JWT" })) + "." +
                btoa(JSON.stringify({ sub: mockUser, exp })) + ".";
              setAuthTokens(fakeToken, "mock-refresh");
              syncFromToken();
            } else {
              try {
                const { refreshToken } = getAuthTokens();
                const resp = await api.post("/auth/refresh", { refreshToken });
                const { accessToken, refreshToken: newRefresh } = resp.data;
                setAuthTokens(accessToken, newRefresh);
                syncFromToken();
              } catch (error) {
                logError(error, "Silent refresh failed");
                logout();
              }
            }
          }, ms);
        } else {
          // If auto refresh is off, schedule logout instead
          infoLog("Scheduling logout in " + ms / 1000 + " seconds (auto refresh OFF)");
          refreshTimer.current = setTimeout(() => {
            logout();
          }, ms);
        }
      } else {
        infoLog("Not scheduling silent refresh/logout: expiresIn <= " + refreshMargin);
      }
    },
    [
      refreshMargin,
      useMockAuth,
      mockUser,
      jwtExpiresMinutes,
      logout,
      autoRefresh,
    ]
  );

  // Pull tokens out of localStorage & set state
  const syncFromToken = useCallback(() => {
    infoLog("syncFromToken called");
    const { accessToken } = getAuthTokens();
    if (!accessToken) {
      setUser(null);
      setExpiresIn(0);
      return;
    }
    try {
      const { sub, exp } = jwtDecode<JwtPayload>(accessToken);
      setUser(sub);
      const now = Math.floor(Date.now() / 1000);
      const expires = Math.max(exp - now, 0);
      infoLog("expiresIn after refresh: " + expires);
      setExpiresIn(expires);
      api.defaults.headers.Authorization = `Bearer ${accessToken}`;
      scheduleRefresh(expires); // <-- schedule refresh only when token changes
    } catch (err) {
      logError(err, "Failed to decode access token");
      clearAuthTokens();
      setUser(null);
      setExpiresIn(0);
    }
  }, [scheduleRefresh]);

  // Register callback for token refresh
  useEffect(() => {
    setOnTokenRefresh(syncFromToken);
    return () => setOnTokenRefresh(null);
  }, [syncFromToken]);

  // On mount, sync and start the 1s countdown
  useEffect(() => {
    syncFromToken();
  }, [syncFromToken]);
 
  // tick UI counter
  useEffect(() => {
    const iv = setInterval(() => {
      setExpiresIn((e) => Math.max(e - 1, 0));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const login = async (username: string, password: string) => {
    if (useMockAuth) {
      if (username === mockUser && password === mockPass) {
        const now = Math.floor(Date.now() / 1000);
        const ttl = jwtExpiresMinutes || 60;
        const exp = now + ttl * 60;
        const fakeToken =
          btoa(JSON.stringify({ alg: "none", typ: "JWT" })) + "." +
          btoa(JSON.stringify({ sub: username, exp })) + ".";
        setAuthTokens(fakeToken, "mock-refresh");
        syncFromToken();
      } else {
        throw new Error("Invalid credentials");
      }
    } else {
      const resp = await api.post("/auth/login", { username, password });
      const { accessToken, refreshToken } = resp.data;
      setAuthTokens(accessToken, refreshToken);
      syncFromToken();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        expiresIn,
        isAuthenticated: user !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}