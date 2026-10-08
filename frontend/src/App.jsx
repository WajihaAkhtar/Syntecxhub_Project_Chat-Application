import { useState } from "react";
import Login from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import "./App.css";

function App() {
    const [user, setUser] = useState(null);

    const handleJoin = (username, room) => {
        setUser({
            username,
            room,
        });
    };

    const handleLogout = () => {
        setUser(null);
    };

    return (
        <>
            {!user ? (
                <Login onJoin={handleJoin} />
            ) : (
                <ChatRoom
                    username={user.username}
                    room={user.room}
                    onLogout={handleLogout}
                />
            )}
        </>
    );
}
export default App;