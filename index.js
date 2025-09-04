require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5000;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "client")));

// Gemini endpoint
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/ask-gemini", async (req, res) => {
    const userMessage = req.body.message;
    const lang = req.body.lang || 'en-US';

    if (!userMessage) {
        return res.status(400).json({ reply: "Message cannot be empty." });
    }

    try {
        const result = await model.generateContent(userMessage);
        const response = result.response;
        const text = await response.text();
        res.json({ reply: text });
    } catch (error) {
        console.error(" Error connecting to Gemini:", error.message);
        res.status(500).json({ reply: "Failed to connect to Gemini." });
    }
});


app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "client", "index.html"));
});

app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
    console.log("Gemini API KEY:", API_KEY ? "Loaded ✅" : "Missing ");
});
