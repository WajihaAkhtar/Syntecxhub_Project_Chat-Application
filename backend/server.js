const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const messageRoutes = require("./routes/messageRoutes");
const Message = require("./models/Message");

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

app.use("/api/messages", messageRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("Chat Application Server is running!");
});

// Get users currently inside a room
const getRoomUsers = (room) => {
    const roomData = io.sockets.adapter.rooms.get(room);

    if (!roomData) {
        return [];
    }

    const users = [];

    roomData.forEach((socketId) => {
        const socket = io.sockets.sockets.get(socketId);

        if (socket && socket.username) {
            users.push({
                id: socket.id,
                username: socket.username,
            });
        }
    });

    return users;
};

// Send updated room users to everyone in the room
const updateRoomUsers = (room) => {
    const users = getRoomUsers(room);

    io.to(room).emit("roomUsers", users);
};

// Socket.io
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a chat room
    socket.on("joinRoom", ({ username, room }) => {
        socket.username = username;
        socket.room = room;

        socket.join(room);

        console.log(
            `${username} joined room: ${room}`
        );

        updateRoomUsers(room);
    });

    // Leave a chat room
    socket.on("leaveRoom", () => {
        const room = socket.room;

        if (room) {
            socket.leave(room);

            console.log(
                `${socket.username} left room: ${room}`
            );

            // Remove room information from socket
            socket.room = null;

            // Update online users
            updateRoomUsers(room);
        }
    });

    // Send a message
    socket.on("sendMessage", async (data) => {
        try {
            const {
                username,
                message,
                room,
            } = data;

            // Save message in MongoDB
            const newMessage = await Message.create({
                username,
                message,
                room,
            });

            // Send message to everyone in the room
            io.to(room).emit(
                "receiveMessage",
                newMessage
            );
        } catch (error) {
            console.error(
                "Error sending message:",
                error.message
            );
        }
    });

    // User disconnects
    socket.on("disconnect", () => {
        const room = socket.room;

        console.log(
            "User disconnected:",
            socket.id
        );

        if (room) {
            updateRoomUsers(room);
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});

