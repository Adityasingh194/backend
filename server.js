const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000; // Use Render's dynamic port

app.use(cors());
app.use(bodyParser.json());

// CSV File Path
const CSV_FILE = "reviews.csv";

// Function to write data to CSV
function writeToCSV(review) {
    const { name, event, reviewText, date } = review;
    const csvRow = `"${date}","${name}","${event}","${reviewText}"\n`;

    if (!fs.existsSync(CSV_FILE)) {
        fs.writeFileSync(CSV_FILE, `"Date","Name","Event","Review"\n`);
    }
    fs.appendFileSync(CSV_FILE, csvRow, "utf8");
}

// Submit review endpoint
app.post("/submit-review", (req, res) => {
    const review = req.body;
    if (!review.name || !review.event || !review.reviewText) {
        return res.status(400).json({ error: "All fields are required" });
    }

    writeToCSV(review);
    res.json({ message: "Review saved successfully" });
});

// Get reviews endpoint
app.get("/get-reviews", (req, res) => {
    if (!fs.existsSync(CSV_FILE)) {
        return res.json([]);
    }

    const csvData = fs.readFileSync(CSV_FILE, "utf8").split("\n").slice(1); // Skip headers
    const reviews = csvData
        .filter(line => line.trim() !== "")
        .map(line => {
            const [date, name, event, reviewText] = line.split(",").map(s => s.replace(/^"|"$/g, ""));
            return { date, name, event, reviewText };
        });

    res.json(reviews);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

