import React, { useEffect, useState } from "react";
import "../App.css";
const PROXY = import.meta.env.VITE_PROXY_URL;

type LogType = "errors" | "info";

interface ErrorEntry {
  message: string;
  stack?: string;
  info?: string;
  time: string;
}

interface InfoEntry {
  message: string;
  info?: string;
  time: string;
}

export function LogDisplay() {
  const [logType, setLogType] = useState<LogType>("errors");
  const [logs, setLogs] = useState<(ErrorEntry | InfoEntry)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${PROXY}/api/${logType}`)
      .then((res) => res.json())
      .then((data) => setLogs(data.reverse()))
      .finally(() => setLoading(false));
  }, [logType]);

  const handleClear = async () => {
    await fetch(`${PROXY}/api/${logType}`, { method: "DELETE" });
    setLogs([]);
  };

  return (
    <div>
      <h2>Log Viewer</h2>
      <label>
        Show:{" "}
        <select
          value={logType}
          onChange={e => setLogType(e.target.value as LogType)}
          className="logselect"
        >
          <option value="errors">Errors</option>
          <option value="info">Info</option>
        </select>
      </label>
      <button className="log-modal-button" onClick={handleClear} style={{ marginLeft: 16 }}>
        Clear {logType === "errors" ? "Errors" : "Info"}
      </button>
      <div style={{ marginTop: 24 }}>
        {loading ? (
          <div>Loading logs…</div>
        ) : logs.length === 0 ? (
          <div>No {logType} logs.</div>
        ) : (
          <ul>
            {logs.map((log, idx) => (
              <li
                key={idx}
                className={
                  logType === "errors"
                    ? "log-entry log-error"
                    : "log-entry log-info"
                }
                style={{
                  marginBottom: 16,
                  padding: 12,
                  borderRadius: 6,
                  background: "#111",
                }}
              >
                <strong>{log.time}</strong>
                <div>{log.message}</div>
                {"info" in log && log.info && <div><em>{log.info}</em></div>}
                {"stack" in log && log.stack && (
                  <details>
                    <summary>Stack trace</summary>
                    <pre>{log.stack}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}