// write to log file
const PROXY = import.meta.env.VITE_PROXY_URL;

export async function logError(error: any, info?: string) {
  let errorObj: Error;
  if (error instanceof Error) {
    errorObj = error;
  } else {
    errorObj = new Error(typeof error === "string" ? error : JSON.stringify(error));
  }

  await fetch("${PROXY}/api/errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: error.message,
      stack: error.stack,
      info,
      time: new Date().toISOString(),
    }),
  });
}