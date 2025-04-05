import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import Feedback from "./feedback.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
try {
  await mongoose.connect(
    "mongodb+srv://<your-username>:<your-password>@cluster0.hdmpeoz.mongodb.net/chiler?retryWrites=true&w=majority"
  );
  console.log("✅ Connected to MongoDB Atlas");
} catch (err) {
  console.error("❌ MongoDB connection error:", err.message);
}

// ✅ Save Review API
app.post("/submit-review", async (req, res) => {
  const { name, event, reviewText } = req.body;

  if (!name || !event || !reviewText) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const review = new Feedback({
    name,
    event,
    reviewText,
    date: new Date(),
  });

  try {
    await review.save();
    console.log("✅ Review saved to MongoDB");
    res.json({ message: "Review saved successfully" });
  } catch (err) {
    console.error("❌ Failed to save review:", err.message);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// ✅ Test MongoDB Connection Route
app.get("/test-mongo", async (req, res) => {
  try {
    const count = await Feedback.countDocuments();
    res.send(`✅ MongoDB connected. ${count} reviews in DB.`);
  } catch (err) {
    res.status(500).send("❌ MongoDB not connected properly");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});




