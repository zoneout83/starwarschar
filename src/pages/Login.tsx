// src/components/Login.tsx
import React, { FormEvent, useState, useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import { logError } from "../services/logError";
import { infoLog } from "../services/info";

export function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    infoLog("handleSubmit fires");
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      infoLog("login success");
    } catch (err) {
      logError(err, "login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Please Log In</h2>
        {error && <div className="error">{error}</div>}

        <label htmlFor="username">Username:</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="login-button-container">
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "…" : "Log In"}
          </button>
        </div>
      </form>
    </div>
  );
}
