import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterIgdbSearchMatches,
  getAvailableYears,
  getMatchRelevanceScore,
  hasMatchesWithoutYear,
  sortIgdbSearchMatches,
  sortIgdbSearchMatchesByYear,
} from "./filter-search-matches";
import type { IgdbSearchMatch } from "./types";

const matches: IgdbSearchMatch[] = [
  { igdbId: 1, name: "The Forest", year: 2018 },
  { igdbId: 2, name: "The Forest II", year: 2024 },
  { igdbId: 3, name: "Forest Demo" },
];

describe("filterIgdbSearchMatches", () => {
  it("filters by year", () => {
    const result = filterIgdbSearchMatches(matches, {
      year: 2018,
      nameQuery: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "The Forest");
  });

  it("filters games without year", () => {
    const result = filterIgdbSearchMatches(matches, {
      year: "unknown",
      nameQuery: "",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "Forest Demo");
  });

  it("filters by local name query", () => {
    const result = filterIgdbSearchMatches(matches, {
      year: "all",
      nameQuery: "ii",
    });

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "The Forest II");
  });
});

describe("getAvailableYears", () => {
  it("returns unique years sorted descending", () => {
    assert.deepEqual(getAvailableYears(matches), [2024, 2018]);
  });
});

describe("hasMatchesWithoutYear", () => {
  it("detects matches missing release year", () => {
    assert.equal(hasMatchesWithoutYear(matches), true);
    assert.equal(
      hasMatchesWithoutYear(matches.filter((match) => match.year !== undefined)),
      false,
    );
  });
});

describe("sortIgdbSearchMatchesByYear", () => {
  it("orders matches from newest year to oldest", () => {
    const sorted = sortIgdbSearchMatchesByYear(matches);

    assert.deepEqual(
      sorted.map((match) => match.name),
      ["The Forest II", "The Forest", "Forest Demo"],
    );
  });
});

describe("sortIgdbSearchMatches", () => {
  const forestMatches: IgdbSearchMatch[] = [
    { igdbId: 10, name: "Aetheria: Whispers of the Forest Moon", year: 2026 },
    { igdbId: 11, name: "Backrooms in the Forest", year: 2026 },
    { igdbId: 12, name: "The Forest", year: 2018 },
    { igdbId: 13, name: "The Forest II", year: 2024 },
  ];

  it("prioritizes exact title matches when filtering locally", () => {
    const filtered = filterIgdbSearchMatches(forestMatches, {
      year: "all",
      nameQuery: "the forest",
    });

    const sorted = sortIgdbSearchMatches(filtered, {
      nameQuery: "the forest",
      referenceTitle: "The Forest",
    });

    assert.equal(sorted[0].name, "The Forest");
    assert.ok(getMatchRelevanceScore("The Forest", "the forest") < getMatchRelevanceScore(
      "Aetheria: Whispers of the Forest Moon",
      "the forest",
    ));
  });

  it("uses reference title when no local name filter is active", () => {
    const sorted = sortIgdbSearchMatches(forestMatches, {
      referenceTitle: "The Forest",
    });

    assert.equal(sorted[0].name, "The Forest");
  });
});
