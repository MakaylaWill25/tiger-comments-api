 
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri);
let db;

client.connect().then(() => {
  db = client.db("school");
  console.log("Connected to MongoDB");
});

// Get comments for a teacher
app.get('/api/comments/:teacherId', async (req, res) => {
  try {
    const comments = await db.collection('comments')
      .find({ teacherId: req.params.teacherId })
      .sort({ timestamp: -1 })
      .toArray();
    res.json(comments);
  } catch (e) {
    res.status(500).send("Error fetching comments");
  }
});

// Submit a new comment
app.post('/api/comments', async (req, res) => {
  const { teacherId, name, comment } = req.body;
  if (!teacherId || !name || !comment) {
    return res.status(400).send("Missing fields");
  }
  try {
    await db.collection('comments').insertOne({
      teacherId,
      name,
      comment,
      timestamp: new Date()
    });
    res.sendStatus(200);
  } catch (e) {
    res.status(500).send("Error saving comment");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
