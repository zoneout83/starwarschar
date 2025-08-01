import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharacterSearch } from "../pages/CharacterSearch";
import { vi, describe, it, expect } from "vitest";
import "@testing-library/jest-dom";

vi.mock("../swapi/api/people", () => {
  const mockPerson = {
    name: "Luke Skywalker",
    birth_year: "19BBY",
    gender: "male",
    height: "172",
    mass: "77",
    homeworldName: "Tatooine",
    filmTitles: ["A New Hope", "The Empire Strikes Back"],
    speciesNames: ["Human"],
    vehicleNames: ["Snowspeeder"],
    starshipNames: ["X-wing"],
    randImage: 1,
    homeworldRotationPeriod: "23",
    homeworldOrbitalPeriod: "304",
    homeworldDiameter: "10465",
    homeworldClimate: "arid",
    homeworldGravity: "1 standard",
    homeworldTerrain: "desert",
    homeworldSurfaceWater: "1",
    homeworldPopulation: "200000",
  };
  return {
    fetchAllPeople: vi.fn().mockResolvedValue([mockPerson]),
  };
});

describe("CharacterSearch modal integration", () => {
  it("opens the modal with the correct person's information", async () => {
    render(<CharacterSearch />);

    // Simulate searching for "Luke"
    const input = screen.getByPlaceholderText(/enter name to search/i);
    fireEvent.change(input, { target: { value: "Luke" } });

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for the card to appear and click it
    const card = await screen.findByText(/Luke Skywalker/i);
    fireEvent.click(card);

    // Wait for the first detail to appear
    await screen.findByText(/Birth Year:/i);

    // Now check the rest
    expect(screen.getByText(/19BBY/i)).toBeInTheDocument();
    expect(screen.getByText(/Gender:/i)).toBeInTheDocument();
    expect(screen.getByText(/male/i)).toBeInTheDocument();
    expect(screen.getByText(/Height:/i)).toBeInTheDocument();
    expect(screen.getByText(/172/i)).toBeInTheDocument();
    expect(screen.getByText(/Mass:/i)).toBeInTheDocument();
    expect(screen.getByText(/77/i)).toBeInTheDocument();
    expect(screen.getByText(/Homeworld:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tatooine/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/A New Hope/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/X-wing/i)).toBeInTheDocument();
  });
});