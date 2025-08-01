import React, { useState, useMemo, useContext, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import { fetchAllPeople } from "../swapi/api/people";
import { PersonView } from "../swapi/views/PersonView";
import { Timer } from "../components/Timer";
import { LogDisplay } from "./LogDisplay"; // Adjust path if needed
import { logError } from "../services/logError";

import "../App.css";
import { infoLog } from "../services/info";

export function CharacterSearch() {
  const { user, expiresIn, logout } = useContext(AuthContext);
  const [characters, setCharacters] = useState<PersonView[]>([]);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");
  const [selectedHomeworld, setSelectedHomeworld] = useState("");
  const [selectedFilm, setSelectedFilm] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setError(null);

    if (characters.length === 0) {
      setLoading(true);
      try {
        infoLog("starting fetch");
        const people = await fetchAllPeople();
        infoLog("finished fetch");
        setCharacters(people);
      } catch (err) {
        logError(err, "Failed to fetch characters");
      } finally {
        setLoading(false);
      }
    }
    setSubmittedTerm(searchTerm.trim().toLowerCase());
  };

  const toggleExpanded = (idx: number) =>
    setExpandedSet((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const homeworldOptions = useMemo(
    () =>
      Array.from(new Set(characters.map((c) => c.homeworldName ?? "")))
        .filter((w) => w)
        .sort(),
    [characters]
  );

  const filmOptions = useMemo(
    () =>
      Array.from(new Set(characters.flatMap((c) => c.filmTitles ?? []))).sort(),
    [characters]
  );

  const displayed =
    submittedTerm || selectedHomeworld || selectedFilm
      ? characters.filter((c) => {
          const matchesName =
            !submittedTerm || c.name.toLowerCase().includes(submittedTerm);
          const matchesWorld =
            !selectedHomeworld || c.homeworldName === selectedHomeworld;
          const matchesFilm =
            !selectedFilm || (c.filmTitles ?? []).includes(selectedFilm);
          return matchesName && matchesWorld && matchesFilm;
        })
      : [];

  return (
    <div className="App">
<header className="header-bar">
  <span className="session-info">
    Logged in as {user} — session expires in <Timer />
  </span>
  <div className="header-actions">
    <button onClick={logout} className="logout-button">
      Log Out
    </button>
    <button onClick={() => setShowLogs(true)} className="logs-button">
      Show Logs
    </button>
  </div>
</header>

      <div className="controls">
        <input
          id="search-input"
          name="search"
          type="text"
          placeholder="Enter name to search…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          className="search-input"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          className="search-button"
        >
          {loading ? "Loading…" : "Search"}
        </button>

        <select
          value={selectedHomeworld}
          onChange={(e) => setSelectedHomeworld(e.target.value)}
          className="filter-select"
        >
          <option value="">All Worlds</option>
          {homeworldOptions.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        <select
          value={selectedFilm}
          onChange={(e) => setSelectedFilm(e.target.value)}
          className="filter-select"
        >
          <option value="">All Films</option>
          {filmOptions.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      {!loading && submittedTerm && displayed.length === 0 && (
        <p className="no-match">No characters match “{submittedTerm}.”</p>
      )}

      <div className="card-grid">
        {displayed.map((char, idx) => {
          const isOpen = expandedSet.has(idx);
          return (
            <div
              key={`${char.name}-${idx}`}
              onClick={() => toggleExpanded(idx)}
              className={`card${isOpen ? " open" : ""}`}
            >
              <img src={`https://picsum.photos/seed/${char.randImage}/250`} alt={char.name + ' id:' + char.randImage} />
              <h2 className="card-title">{char.name == 'Palpatine' && char.birth_year == "82BBY" ? 'Sheev ' + char.name : char.name }</h2>

              {isOpen && (
                <div className="details">
                  <p className="card-text">
                    <strong>Birth Year:</strong> {char.birth_year}
                  </p>
                  <p className="card-text">
                    <strong>Gender:</strong> {char.gender}
                  </p>
                  <p className="card-text">
                    <strong>Height:</strong> {char.height}
                  </p>
                  <p className="card-text">
                    <strong>Mass:</strong> {char.mass}
                  </p>
                  <p className="card-text">
                    <strong>Homeworld:</strong> {char.homeworldName}
                  </p>
                  <strong>Homeworld Details:</strong>
                  <ul className="homeworld-details">
                    <li>
                      <strong>Rotation Period:</strong>{" "}
                      {char.homeworldRotationPeriod}
                    </li>
                    <li>
                      <strong>Orbital Period:</strong>{" "}
                      {char.homeworldOrbitalPeriod}
                    </li>
                    <li>
                      <strong>Diameter:</strong> {char.homeworldDiameter}
                    </li>
                    <li>
                      <strong>Climate:</strong> {char.homeworldClimate}
                    </li>
                    <li>
                      <strong>Gravity:</strong> {char.homeworldGravity}
                    </li>
                    <li>
                      <strong>Terrain:</strong> {char.homeworldTerrain}
                    </li>
                    <li>
                      <strong>Surface Water:</strong>{" "}
                      {char.homeworldSurfaceWater}
                    </li>
                    <li>
                      <strong>Population:</strong> {char.homeworldPopulation}
                    </li>
                  </ul>

                  {!!char.filmTitles?.length && (
                    <>
                      <strong>Films:</strong>
                      <ul>
                        {char.filmTitles.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {!!char.speciesNames?.length && (
                    <>
                      <strong>Species:</strong>
                      <ul>
                        {char.speciesNames.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {!!char.vehicleNames?.length && (
                    <>
                      <strong>Vehicles:</strong>
                      <ul>
                        {char.vehicleNames.map((v) => (
                          <li key={v}>{v}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {!!char.starshipNames?.length && (
                    <>
                      <strong>Starships:</strong>
                      <ul>
                        {char.starshipNames.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

{showLogs && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)", // <--- overlay background
      zIndex: 1000,
    }}
  >
    <div
      style={{
        background: "#111", // <--- modal content background (currently white)
        margin: "40px auto",
        padding: 24,
        maxWidth: 600,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        position: "relative",
      }}
    >
      <button
        style={{ position: "absolute", top: 8, right: 8 }}
        onClick={() => setShowLogs(false)}
      >
        Close
      </button>
      <LogDisplay />
    </div>
  </div>
)}
    </div>
  );
}