import { useState } from "react";

function Login({ onJoin }) {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("general");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username.trim()) {
            alert("Please enter your username");
            return;
        }

        onJoin(username.trim(), room);
    };

    return (
        <div className="login-page">
            <div className="login-overlay"></div>

            <div className="login-card">
                <div className="chat-icon">
                    💬
                </div>

                <h1>Welcome Back</h1>

                <p className="login-subtitle">
                    Join the conversation and connect with others.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>

                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Choose a Room</label>

                        <select
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        >
                            <option value="general">General</option>
                            <option value="javascript">JavaScript</option>
                            <option value="react">React</option>
                            <option value="random">Random</option>
                        </select>
                    </div>

                    <button type="submit">
                        Join Chat
                        <span> →</span>
                    </button>
                </form>

                <p className="login-footer">
                    Real-time conversations • Powered by Socket.io
                </p>
            </div>
        </div>
    );
}

export default Login;