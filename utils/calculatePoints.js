function calculatePlayerPoints(matchData) {
  const playerPoints = {};

  // Initialize player points
  matchData.forEach(delivery => {
    if (!playerPoints[delivery.batter]) playerPoints[delivery.batter] = 0;
    if (!playerPoints[delivery.bowler]) playerPoints[delivery.bowler] = 0;
    if (delivery.fielders_involved && delivery.fielders_involved !== "NA") {
      const fielders = delivery.fielders_involved.split(', ');
      fielders.forEach(fielder => {
        if (!playerPoints[fielder]) playerPoints[fielder] = 0;
      });
    }
  });

  // To track runs and calculate bonuses like half-century, century, etc.
  const battingStats = {};

  // Process each delivery
  matchData.forEach(delivery => {
    const { batter, bowler, batsman_run, isWicketDelivery, player_out, kind, fielders_involved } = delivery;

    // Batting points
    playerPoints[batter] += batsman_run;
    if (batsman_run === 4) playerPoints[batter] += 1; // Boundary bonus
    if (batsman_run === 6) playerPoints[batter] += 2; // Six bonus

    // Track total runs for bonuses
    if (!battingStats[batter]) battingStats[batter] = 0;
    battingStats[batter] += batsman_run;

    // Bowling points
    if (isWicketDelivery && kind !== "run out") {
      playerPoints[bowler] += 25;
      if (kind === "lbw" || kind === "bowled") playerPoints[bowler] += 8; // LBW/Bowled bonus
    }

    // Fielding points
    if (isWicketDelivery) {
      if (kind === "catch" && fielders_involved !== "NA") {
        const fielders = fielders_involved.split(', ');
        fielders.forEach(fielder => {
          playerPoints[fielder] += 8; // Catch points
        });
      }
      if (kind === "stumped" && fielders_involved !== "NA") {
        const fielders = fielders_involved.split(', ');
        fielders.forEach(fielder => {
          playerPoints[fielder] += 12; // Stumping points
        });
      }
      if (kind === "run out" && fielders_involved !== "NA") {
        const fielders = fielders_involved.split(', ');
        fielders.forEach(fielder => {
          playerPoints[fielder] += 6; // Run out points
        });
      }
    }
  });

  // Calculate batting bonuses after processing all deliveries
  for (const [batter, runs] of Object.entries(battingStats)) {
    if (runs >= 30) playerPoints[batter] += 4; // 30 Run Bonus
    if (runs >= 50) playerPoints[batter] += 8; // Half-century bonus
    if (runs >= 100) playerPoints[batter] += 16; // Century bonus
  }

  return playerPoints;
}

module.exports = calculatePlayerPoints;
