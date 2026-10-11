import { test } from "node:test"
import assert from "node:assert/strict"
import { buildHomepageHeadline, getLobbyReaction } from "./homepage-story"
const data = { playersCount: 6, currentGamesCount: 0, totalHours: 2519, appHours: 300, mostPlayedThisWeek: "Deadlock", members: [] }

test("quiet newspaper uses a reached milestone and avoids claiming live activity", () => {
  const headline = buildHomepageHeadline(data)
  assert.match(headline.title, /2\.500/)
  assert.equal(headline.href, "#timeline")
  assert.match(headline.fact, /6 jogadores/)
})
test("live headline names only members marked as currently playing", () => {
  const headline = buildHomepageHeadline({ ...data, currentGamesCount: 2, members: [{ id: "1", name: "Kiiro", avatar_url: null, isPlayingNow: true }, { id: "2", name: "Natan", avatar_url: null, isPlayingNow: false }] })
  assert.match(headline.title, /2 partidas/)
  assert.match(headline.description, /Kiiro está em jogo/)
  assert.doesNotMatch(headline.description, /Natan/)
})
test("new group with less than 100 hours gets no invented milestone", () => {
  assert.equal(buildHomepageHeadline({ ...data, totalHours: 23 }).title, "Toda panela começa com uma partida.")
})
test("characters react to empty, solo and gathered group states", () => {
  assert.equal(getLobbyReaction(0, 0, false).mood, "sleep")
  assert.equal(getLobbyReaction(2, 2, false).mood, "dynamo")
  assert.equal(getLobbyReaction(1, 3, true).mood, "cheer")
  assert.equal(getLobbyReaction(3, 3, false).mood, "dynamo")
})
