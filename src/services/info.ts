const VERBOSE = import.meta.env.VITE_VERBOSE === "true";
const PROXY = import.meta.env.VITE_PROXY_URL;

export async function infoLog(message: string, info?: string) {
  if (VERBOSE) {
    // Log to server
    await fetch(`${PROXY}/api/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        info,
        time: new Date().toISOString(),
      }),
    });
    // Also log to browser console if desired
    // eslint-disable-next-line no-console
    console.info("[INFO]", message, info || "");
  }
}