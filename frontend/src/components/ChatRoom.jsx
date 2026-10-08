import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function ChatRoom({ username, room, onLogout }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);

    useEffect(() => {
        // Join the room
        socket.emit("joinRoom", {
            username,
            room,
        });

        // Get previous messages from MongoDB
        const getMessages = async () => {
            try {
                const response = await fetch(
                    `http://localhost:5000/api/messages/${room}`
                );

                const data = await response.json();

                setMessages(data);
            } catch (error) {
                console.error(
                    "Failed to load messages:",
                    error
                );
            }
        };

        getMessages();

        // Listen for new messages
        const handleReceiveMessage = (newMessage) => {
            setMessages((previousMessages) => [
                ...previousMessages,
                newMessage,
            ]);
        };

        // Listen for online users
        const handleRoomUsers = (users) => {
            setRoomUsers(users);
        };

        socket.on(
            "receiveMessage",
            handleReceiveMessage
        );

        socket.on(
            "roomUsers",
            handleRoomUsers
        );

        // Cleanup
        return () => {
            socket.off(
                "receiveMessage",
                handleReceiveMessage
            );

            socket.off(
                "roomUsers",
                handleRoomUsers
            );
        };
    }, [username, room]);

    const sendMessage = (e) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        socket.emit("sendMessage", {
            username,
            message: message.trim(),
            room,
        });

        setMessage("");
    };

    return (
        <div className="chat-page">

            {/* Sidebar */}
            <aside className="chat-sidebar">

                {/* Sidebar Top */}
                <div>

                    <h2>Chat App</h2>

                    <div className="room-info">
                        <span>Room</span>

                        <strong>
                            #{room}
                        </strong>
                    </div>

                    {/* Online Users */}
                    <div className="online-users">

                        <div className="online-users-title">
                            <span>
                                Online Users
                            </span>

                            <strong>
                                {roomUsers.length}
                            </strong>
                        </div>

                        <div className="users-list">

                            {roomUsers.length === 0 ? (
                                <p>
                                    No users online
                                </p>
                            ) : (
                                roomUsers.map((user) => (
                                    <div
                                        className="room-user"
                                        key={user.id}
                                    >

                                        <div className="small-avatar">
                                            {user.username
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <span>
                                            {user.username}

                                            {user.username ===
                                                username && (
                                                <small>
                                                    {" "}
                                                    (You)
                                                </small>
                                            )}
                                        </span>

                                        <span className="user-online-dot"></span>

                                    </div>
                                ))
                            )}

                        </div>
                    </div>

                </div>

                {/* Sidebar Bottom */}
                <div className="sidebar-bottom">

                    {/* Current User */}
                    <div className="user-info">

                        <div className="user-avatar">
                            {username
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                {username}
                            </strong>

                            <p>
                                Online
                            </p>
                        </div>

                    </div>

                    {/* Logout Button */}
                    <button
                        className="logout-button"
                        onClick={onLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            {/* Chat Area */}
            <main className="chat-main">

                {/* Header */}
                <header className="chat-header">

                    <div>
                        <h2>
                            #{room}
                        </h2>

                        <p>
                            {roomUsers.length}{" "}
                            {roomUsers.length === 1
                                ? "person"
                                : "people"}{" "}
                            online
                        </p>
                    </div>

                    <div className="online-status">

                        <span></span>

                        {roomUsers.length} Online

                    </div>

                </header>

                {/* Messages */}
                <div className="messages-container">

                    {messages.length === 0 ? (
                        <div className="empty-chat">

                            <div>
                                💬
                            </div>

                            <h3>
                                No messages yet
                            </h3>

                            <p>
                                Start the conversation
                                by sending a message.
                            </p>

                        </div>
                    ) : (
                        messages.map((msg) => (

                            <div
                                key={msg._id}
                                className={
                                    msg.username ===
                                    username
                                        ? "message own-message"
                                        : "message"
                                }
                            >

                                <div className="message-avatar">
                                    {msg.username
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                                <div className="message-content">

                                    <div className="message-name">
                                        {msg.username}
                                    </div>

                                    <div className="message-text">
                                        {msg.message}
                                    </div>

                                    <div className="message-time">
                                        {new Date(
                                            msg.createdAt
                                        ).toLocaleTimeString(
                                            [],
                                            {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </div>

                                </div>

                            </div>

                        ))
                    )}

                </div>

                {/* Message Form */}
                <form
                    className="message-form"
                    onSubmit={sendMessage}
                >

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) =>
                            setMessage(
                                e.target.value
                            )
                        }
                    />

                    <button type="submit">
                        Send
                    </button>

                </form>

            </main>

        </div>
    );
}

export default ChatRoom;

