async function updateTeamPoints(playerPoints, teamPlayers) {
  const teamResults = [];

  for (const team of teamPlayers) {
    let teamPoints = 0;
    const teamPlayerPoints = {};

    for (const player of team.players) {
      let playerScore = playerPoints[player] || 0;
      teamPlayerPoints[player] = playerScore;

      if (player === team.captain) {
        teamPoints += playerScore * 2; // Double points for captain
        teamPlayerPoints[player] = playerScore * 2; // Update with captain multiplier
      } else if (player === team.viceCaptain) {
        teamPoints += playerScore * 1.5; // 1.5x points for vice-captain
        teamPlayerPoints[player] = playerScore * 1.5; // Update with vice-captain multiplier
      } else {
        teamPoints += playerScore;
      }
    }

    teamResults.push({ teamName: team.teamName, teamPlayerPoints, teamPoints });
  }

  return teamResults;
}

module.exports = updateTeamPoints;
