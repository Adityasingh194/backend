const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// CSV File Path
const CSV_FILE = path.join(__dirname, "reviews.csv");

// Function to write data to CSV
function writeToCSV(review) {
    const { name, event, reviewText, date } = review;
    const csvRow = `"${date}","${name}","${event}","${reviewText}"\n`;

    // Check if file exists, if not add headers
    if (!fs.existsSync(CSV_FILE)) {
        fs.writeFileSync(CSV_FILE, `"Date","Name","Event","Review"\n`);
    }
    fs.appendFileSync(CSV_FILE, csvRow, "utf8");
}

// Root Endpoint
app.get("/", (req, res) => {
    res.send("Welcome to the Event Review API!");
});

// Submit Review Endpoint
app.post("/submit-review", (req, res) => {
    const review = req.body;
    if (!review.name || !review.event || !review.reviewText) {
        return res.status(400).json({ error: "All fields are required" });
    }

    review.date = new Date().toLocaleString();
    writeToCSV(review);
    res.json({ message: "Review saved successfully" });
});

// Get Reviews Endpoint (Read CSV & send JSON)
app.get("/get-reviews", (req, res) => {
    if (!fs.existsSync(CSV_FILE)) {
        return res.json([]);
    }

    const data = fs.readFileSync(CSV_FILE, "utf8")
        .trim()
        .split("\n")
        .slice(1) // skip headers
        .map(row => {
            const [date, name, event, reviewText] = row.split(",").map(col => col.replace(/(^"|"$)/g, ""));
            return { date, name, event, reviewText };
        });

    res.json(data);
});

// Handle 404 for undefined routes
app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});



