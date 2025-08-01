import React, { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";
import { Login } from "./pages/Login";
import { CharacterSearch } from "./pages/CharacterSearch";

export default function App() {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? <CharacterSearch /> : <Login />;
}
