import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Feedback from "./feedback.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const CSV_FILE = path.join(__dirname, "reviews.csv");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB URI (directly in code)
const MONGODB_URI = "mongodb+srv://sadityakumar194:12345@cluster0.hdmpeoz.mongodb.net/chiler?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

// CSV Writer (optional)
function writeToCSV(review) {
  const { name, event, reviewText, date } = review;
  const csvRow = `"${date}","${name}","${event}","${reviewText}"\n`;

  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, `"Date","Name","Event","Review"\n`);
  }

  fs.appendFileSync(CSV_FILE, csvRow, "utf8");
}

// Submit Review
app.post("/submit-review", async (req, res) => {
  const { name, event, reviewText } = req.body;

  if (!name || !event || !reviewText) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const review = new Feedback({
      name,
      event,
      reviewText,
      date: new Date(),
    });

    await review.save();
    writeToCSV(review);
    res.json({ message: "Review saved successfully" });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ error: "Failed to save review" });
  }
});

// Get All Reviews
app.get("/get-reviews", async (req, res) => {
  try {
    const reviews = await Feedback.find().sort({ date: -1 });
    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Download Reviews as CSV
app.get("/download-reviews", (req, res) => {
  if (!fs.existsSync(CSV_FILE)) {
    return res.status(404).send("No reviews available");
  }

  res.download(CSV_FILE, "event-reviews.csv");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});





