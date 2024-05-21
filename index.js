const express = require("express");
const app = express();
const port = 3000;
const validateTeam = require("./utils/teamValidation");

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
    console.error("Error saving team:", error);
    res.status(500).json({ message: "Failed to create team" });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

run();
