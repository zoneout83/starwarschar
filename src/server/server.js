const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DATASTORE = path.join(__dirname, "./datastore");
const ERRORS_FILE = path.join(DATASTORE, "errors.json");
const INFO_FILE = path.join(DATASTORE, "info.json");

// Utility functions for errors
async function readErrors() {
  try {
    const txt = await fs.readFile(ERRORS_FILE, "utf8");
    return JSON.parse(txt);
  } catch {
    return [];
  }
}
async function writeErrors(arr) {
  await fs.writeFile(ERRORS_FILE, JSON.stringify(arr, null, 2), "utf8");
}

// Utility functions for info logs
async function readInfo() {
  try {
    const txt = await fs.readFile(INFO_FILE, "utf8");
    return JSON.parse(txt);
  } catch {
    return [];
  }
}
async function writeInfo(arr) {
  await fs.writeFile(INFO_FILE, JSON.stringify(arr, null, 2), "utf8");
}

// --- Error log endpoints ---

// Get all errors
app.get("/api/errors", async (req, res) => {
  const errors = await readErrors();
  res.json(errors);
});

// Log a new error
app.post("/api/errors", async (req, res) => {
  const { message, stack, info, time } = req.body;
  if (!message) return res.status(400).send("Missing error message");
  const errors = await readErrors();
  errors.push({
    message,
    stack: stack || "",
    info: info || "",
    time: time || new Date().toISOString(),
  });
  await writeErrors(errors);
  res.status(201).json({ success: true });
});

// Clear all errors
app.delete("/api/errors", async (req, res) => {
  await writeErrors([]);
  res.json({ success: true });
});

// --- Info log endpoints ---

// Get all info logs
app.get("/api/info", async (req, res) => {
  const info = await readInfo();
  res.json(info);
});

// Log a new info message
app.post("/api/info", async (req, res) => {
  const { message, info: extraInfo, time } = req.body;
  if (!message) return res.status(400).send("Missing info message");
  const logs = await readInfo();
  logs.push({
    message,
    info: extraInfo || "",
    time: time || new Date().toISOString(),
  });
  await writeInfo(logs);
  res.status(201).json({ success: true });
});

// Clear all info logs
app.delete("/api/info", async (req, res) => {
  await writeInfo([]);
  res.json({ success: true });
});

// --- Proxy endpoint for SWAPI etc. ---
app.get("/raw", async (req, res) => {
  const target = req.query.url;
  console.log("url: " + req.query.url);
  if (!target || typeof target !== "string") {
    return res.status(400).send("Missing or invalid `url` query parameter");
  }
  try {
    const result = await axios.get(target);
    res.json(result.data);
  } catch (err) {
    console.error("Error proxying", target, err.message);
    res.status(500).send("Proxy error");
  }
});

// --- Start server ---
app.listen(4000, () => {
  console.log("Proxy server running on http://localhost:4000");
});