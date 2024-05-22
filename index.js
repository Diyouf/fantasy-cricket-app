const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const port = 3000;
const validateTeam = require("./utils/teamValidation");
const calculatePlayerPoints = require("./utils/calculatePoints");
const updateTeamPoints = require("./utils/updateTeamPoint");

require("dotenv").config();
app.use(express.json());

// Database Details
const DB_USER = process.env["DB_USER"];
const DB_PWD = process.env["DB_PWD"];
const DB_URL = process.env["DB_URL"];
const DB_NAME = "task-jeff";
const DB_COLLECTION_NAME = "players";

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://" +
  DB_USER +
  ":" +
  DB_PWD +
  "@" +
  DB_URL +
  "/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Increased timeout options
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
});

let db;

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });

    db = client.db(DB_NAME);

    console.log("You successfully connected to MongoDB!");
  } finally {
  }
}

// Sample create document
async function sampleCreate() {
  const demo_doc = {
    demo: "doc demo",
    hello: "world",
  };
  const demo_create = await db
    .collection(DB_COLLECTION_NAME)
    .insertOne(demo_doc);

  console.log("Added!");
  console.log(demo_create.insertedId);
}

// Endpoints;

app.get("/", async (req, res) => {
  res.send("Hello World!");
});

app.get("/demo", async (req, res) => {
  await sampleCreate();
  res.send({ status: 1, message: "demo" });
});

app.post("/add-team", async (req, res) => {
  try {
    const { teamName, players, captain, viceCaptain } = req.body;

    // Validate the team data
    const isValidTeam = validateTeam(teamName, players, captain, viceCaptain);
    if (!isValidTeam)
      return res.status(400).json({ message: "Invalid team data" });

    // Check if the team name already exists
    const existingTeam = await db.collection("Teams").findOne({ teamName });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    // Create a new team document
    const newTeam = {
      teamName,
      players: players.map((player) => player.Player),
      captain,
      viceCaptain,
    };

    // Insert the new team into the database
    const result = await db.collection("Teams").insertOne(newTeam);

    res.status(201).json({
      message: "Team created successfully",
      teamId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



app.get("/process-result", async (req, res) => {
  try {
    // Read match data from match.json
    const matchDataPath = path.join(__dirname, "data", "match.json");
    const matchData = JSON.parse(fs.readFileSync(matchDataPath, "utf8"));
    // Calculate points for each player
    const playerPoints = await calculatePlayerPoints(matchData);
    // fetching the teams
    const teams = await db.collection("Teams").find({}).toArray();

    const updatedTeams = await updateTeamPoints(playerPoints, teams);

       // Update each team in the database with the new points
    for (const team of updatedTeams) {
      await db.collection("Teams").updateOne(
        { teamName: team.teamName },
        { $set: { points: team.teamPoints, playerPoints: team.teamPlayerPoints } }
      );
    }

    res.status(200).json({ message: "Match results processed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to process result" });
  }
});



app.get("/team-result", async (req, res) => {
  try {
    // Fetch all teams with their points
    const teams = await db.collection("Teams").find({}).toArray();

    // Find the maximum points
    const maxPoints = Math.max(...teams.map(team => team.points));

    // Find the top teams with the maximum points
    const topTeams = teams.filter(team => team.points === maxPoints);

    // Prepare the response
    const response = {
      topTeams: topTeams.map(team => ({
        teamName: team.teamName,
        points: team.points,
        playerPoints: team.playerPoints
      })),
      maxPoints
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching team results:", error);
    res.status(500).json({ message: "Failed to fetch team results" });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

run();
