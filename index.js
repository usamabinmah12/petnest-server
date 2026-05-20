const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = 5000;

app.use(cors());
app.use(express.json()); 

const uri = "mongodb+srv://petnest:CBKpifrvVXPT0E8d@cluster0.wfpggc0.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("petnest");
    const petsCollection = db.collection("pets"); 

    app.get("/pets", async (req, res) => {
      const data = await petsCollection.find().toArray();
      res.json(data);
    });

    app.post("/pets", async (req, res) => {
      const pet = req.body;

      const result = await petsCollection.insertOne(pet);

      res.json(result);
    });

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(error);
  }
}

run();

app.get("/", (req, res) => {
  res.send("Bismillahir Rahmanir Rahim");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});