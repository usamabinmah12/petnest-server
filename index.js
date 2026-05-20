const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = 5000;

app.use(cors());
app.use(express.json()); 
const { ObjectId } = require("mongodb");
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
    app.get("/dashboard/my-pets", async (req, res) => {
  const email = req.query.email;

  const query = email ? { ownerEmail: email } : {};

  const result = await petsCollection.find(query).toArray();

  res.json(result);
});
    app.get("/pets/:id", async (req, res) => {
        const id = req.params.id;

        const pet = await petsCollection.findOne({
            _id: new ObjectId(id),
         });

    res.json(pet);
  });
  app.put("/update/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;


  const result = await petsCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );

  res.json(result);
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