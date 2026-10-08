const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Get messages for a specific room
router.get("/:room", async (req, res) => {
    try {
        const messages = await Message.find({
            room: req.params.room,
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get messages",
        });
    }
});

module.exports = router;