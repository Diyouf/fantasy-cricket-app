const validateTeam = (teamName, players, captain, viceCaptain) => {
  //checking for the team name
  if (!teamName || teamName === undefined)
    throw new Error("Team name must be specified");

  // Check if the team has exactly 11 players
  if (players.length !== 11) {
    throw new Error("A team must have exactly 11 players.");
  }

  const playerNamesSet = new Set();
  const duplicatePlayer = players.find((player) => {
    if (playerNamesSet.has(player.Player)) {
      return true;
    } else {
      playerNamesSet.add(player.Player);
      return false;
    }
  });
  if (duplicatePlayer) {
    throw new Error(
      `Duplicate player name ${duplicatePlayer.Player} found in the team.`
    );
  }

  const playerCountByType = {
    WK: 0,
    BAT: 0,
    AR: 0,
    BWL: 0,
  };

  const playerCountByTeam = {};

  players.forEach((player) => {
    switch (player.Role) {
      case "WICKETKEEPER":
        playerCountByType.WK++;
        break;
      case "BATTER":
        playerCountByType.BAT++;
        break;
      case "ALL-ROUNDER":
        playerCountByType.AR++;
        break;
      case "BOWLER":
        playerCountByType.BWL++;
        break;
      default:
        throw new Error(`Invalid player role for player ${player.Player}.`);
    }
    playerCountByTeam[player.Team] = (playerCountByTeam[player.Team] || 0) + 1;
  });

  // Validate minimum and maximum players for each type
  if (playerCountByType.WK < 1 || playerCountByType.WK > 8) {
    throw new Error(
      "A team must have at least 1 and at most 8 Wicket Keepers (WK)."
    );
  }
  if (playerCountByType.BAT < 1 || playerCountByType.BAT > 8) {
    throw new Error("A team must have at least 1 and at most 8 Batters (BAT).");
  }
  if (playerCountByType.AR < 1 || playerCountByType.AR > 8) {
    throw new Error(
      "A team must have at least 1 and at most 8 All Rounders (AR)."
    );
  }
  if (playerCountByType.BWL < 1 || playerCountByType.BWL > 8) {
    throw new Error("A team must have at least 1 and at most 8 Bowlers (BWL).");
  }

  // Validate maximum players from any one team
  if (Object.values(playerCountByTeam).some((count) => count > 10)) {
    throw new Error(
      "A maximum of 10 players can be selected from any one team."
    );
  }

  // Validate captain and vice-captain
  const playerNames = players.map((player) => player.Player);

  if (!playerNames.includes(captain)) {
    throw new Error("Captain must be part of the team.");
  }
  if (!playerNames.includes(viceCaptain)) {
    throw new Error("Vice-captain must be part of the team.");
  }
  return true;
};

module.exports = validateTeam;
