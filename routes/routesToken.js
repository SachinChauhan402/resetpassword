const express = require("express");
const router = express.Router();
const Token = require("../models/Token");

// Route to handle token creation and saving
router.post("/", async (req, res) => {
  try {
    const { userId, token } = req.body;

    // Create a new token document
    const newToken = new Token({
      userId,
      token,
    });

    // Save the token document to the database
    await newToken.save();

    res.status(200).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Other routes for token operations, such as retrieval, update, deletion, etc.

module.exports = router;
