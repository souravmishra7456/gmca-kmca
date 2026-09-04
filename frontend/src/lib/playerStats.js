const DUMMY_PLAYER_STATS = [
  { matches: 24, innings: 22, runs: 876, balls: 694, strikeRate: 126.22, average: 48.67, wickets: 14, economy: 6.18, highestScore: 118, bestFigures: "4/21" },
  { matches: 18, innings: 17, runs: 542, balls: 463, strikeRate: 117.06, average: 38.71, wickets: 21, economy: 5.76, highestScore: 94, bestFigures: "5/18" },
  { matches: 31, innings: 28, runs: 1124, balls: 903, strikeRate: 124.47, average: 44.96, wickets: 9, economy: 6.42, highestScore: 136, bestFigures: "3/24" },
  { matches: 16, innings: 14, runs: 389, balls: 337, strikeRate: 115.43, average: 32.42, wickets: 27, economy: 5.31, highestScore: 82, bestFigures: "4/16" },
];

const DUMMY_PERSONAL_DETAILS = [
  { dateOfBirth: "12 May 1998", birthPlace: "Kolhapur, Maharashtra", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium" },
  { dateOfBirth: "28 November 2000", birthPlace: "Pune, Maharashtra", battingStyle: "Left-hand bat", bowlingStyle: "Left-arm orthodox" },
  { dateOfBirth: "7 March 1997", birthPlace: "Sangli, Maharashtra", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm offbreak" },
  { dateOfBirth: "19 August 1999", birthPlace: "Satara, Maharashtra", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast" },
];

function getPlayerIndex(player) {
  const key = player.memberId || player.id || player.name || "player";
  return [...String(key)].reduce((total, char) => total + char.charCodeAt(0), 0);
}

// Temporary data until player statistics are supplied by the API.
export function getDummyPlayerStats(player) {
  return DUMMY_PLAYER_STATS[getPlayerIndex(player) % DUMMY_PLAYER_STATS.length];
}

export function getDummyPersonalDetails(player) {
  return DUMMY_PERSONAL_DETAILS[getPlayerIndex(player) % DUMMY_PERSONAL_DETAILS.length];
}
