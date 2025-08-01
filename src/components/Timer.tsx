import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";

function formatTime(seconds: number) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function Timer() {
  const { expiresIn } = useContext(AuthContext);
  return <span>{formatTime(expiresIn)}</span>;
}