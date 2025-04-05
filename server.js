// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Feedback from "./feedback.js";

const app = express();
app.use(cors()); // Allow frontend access
app.use(express.json()); // Parse JSON

// Replace with your MongoDB Atlas connection string
const mongoURI = "mongodb+srv://sadityakumar194:12345@cluster0.hdmpeoz.mongodb.net/chiler?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// POST: Save a new review
app.post("/submit-review", async (req, res) => {
  try {
    const review = req.body;
    const newFeedback = new Feedback(review);
    await newFeedback.save();
    console.log("✅ Saved to MongoDB:", newFeedback);
    res.status(200).json({ message: "Review submitted successfully!" });
  } catch (err) {
    console.error("❌ Error saving review:", err.message);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

// GET: Get all reviews (admin page)
app.get("/reviews", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("❌ Error fetching reviews:", err.message);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




