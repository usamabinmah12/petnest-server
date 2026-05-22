const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
app.use(express.json());
require("dotenv").config();
const port = process.env.PORT;
app.use(cors());
const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
)
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
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
    
    app.post("/pets", async (req, res) => {
      try {
        const petData = req.body;
        const result = await petsCollection.insertOne(petData);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    app.get("/dashboard/my-pets", async (req, res) => {
      try {
        const email = req.query.email?.toLowerCase().trim();

        const result = await petsCollection
          .find({
            $or: [
              { ownerEmail: email },
              { adoptedBy: email },
              { previousOwner: email }
            ],
          })
          .toArray();

        res.send(result);
      } catch (error) {
        res.status(500).send({
          success: false,
          error: error.message,
        });
      }
    });
    const verifyToken = async(req , res , next) => {
      const header = req?.headers.authorization
      if(!header) {
        return res.status(401).json({
          message : "Unauthorized"
        });
      }
      const token = header.split(" ")[1];
      if(!token) {
         return res.status(401).json({
          message : "Unauthorized"
        });
      }
      try {
        const {payload} = await jwtVerify(token , JWKS)
        console.log("payload" , payload);
        next()
      } catch (error) {
        return res.status(401).json({
          message : "Forbidden"
        });
      }
      



        
    }
    app.get(
      "/pets/:id",
      verifyToken,
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
        const body = req.body;

        const pet = await petsCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!pet) {
          return res.status(404).json({ success: false, error: "Pet not found" });
        }
        if (body.adoptedBy) {
          const result = await petsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                previousOwner: pet.ownerEmail,
                ownerEmail: body.adoptedBy,
                adoptedBy: body.adoptedBy,
                isAdopted: true,
                adoptionStatus: "adopted",
                adoptedAt: new Date(),
              },
            }
          );

          return res.send({
            success: true,
            message: "Pet adopted successfully",
            result,
          });
        }
        const { petName, breed, age, image, location } = body;
        const updateFields = {};
        if (petName !== undefined) updateFields.petName = petName;
        if (breed !== undefined) updateFields.breed = breed;
        if (age !== undefined) updateFields.age = age;
        if (image !== undefined) updateFields.image = image;
        if (location !== undefined) updateFields.location = location;

        const result = await petsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );

        res.send({
          success: true,
          message: "Pet updated successfully",
          result,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error: error.message });
      }
    });

    app.delete("/pets/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await petsCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
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