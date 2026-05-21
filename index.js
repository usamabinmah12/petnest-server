const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    console.log("MongoDB connected successfully");
     const db = client.db("petnest");
    const petsCollection = db.collection("pets");
    const adoptionRequestsCollection = db.collection("adoption_requests");

    app.get("/pets", async (req, res) => {
      try {
        const data = await petsCollection.find().toArray();
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    app.get(
  "/pets/:id",
  (req, res, next) => {
    const header = req?.headers.authorization
    console.log(header, "header")
    if(!header) return;

    const token = header.split(" ")[1];

    next()
  },
  async (req, res) => {
    try {
      const id = req.params.id;

      const pet = await petsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!pet) {
        return res.status(404).json({ error: "Pet not found" });
      }

      res.json(pet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

    app.put("/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        
        console.log("Updating pet:", id);
        console.log("Update data:", updatedData);
        
        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ success: false, error: "Pet not found" });
        }
        
        console.log("Update result:", result);
        res.json({ success: true, data: result });
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.post("/api/adoption-requests", async (req, res) => {
      try {
        const adoptionRequest = req.body;
        adoptionRequest.createdAt = new Date();
        const result = await adoptionRequestsCollection.insertOne(adoptionRequest);
        res.json({ success: true, data: result });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    app.get("/", (req, res) => {
      res.send("Bismillahir Rahmanir Rahim");
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

run();