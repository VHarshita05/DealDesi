import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";

const API_URL = "https://dealdesi.onrender.com";

export default function DealDesiGroupShop() {

  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);
  const [rid, setRid] = useState(null);

  const [myName, setMyName] = useState("");
  const [chatTxt, setChatTxt] = useState("");

  const socket = useRef(null);

  /* 🔥 SOCKET CONNECT */
  useEffect(() => {
    socket.current = io(API_URL);
    return () => socket.current.disconnect();
  }, []);

  /* 🔥 CREATE ROOM */
  const doCreate = async () => {
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Room", hostName: myName })
    });

    const data = await res.json();

    setRid(data.id);
    setScreen("room");
  };

  /* 🔥 JOIN ROOM */
  const doJoin = async () => {
    const res = await fetch(`${API_URL}/rooms/${joinCode}`);
    const data = await res.json();

    setRid(data.id);
    setScreen("room");
  };

  /* 🔥 LOAD ROOM */
  useEffect(() => {
    if (!rid) return;

    fetch(`${API_URL}/rooms/${rid}`)
      .then(res => res.json())
      .then(data => setRoom(data));
  }, [rid]);

  /* 🔥 JOIN SOCKET ROOM */
  useEffect(() => {
    if (!socket.current || !rid) return;

    socket.current.emit("join-room", {
      roomId: rid,
      userName: myName
    });
  }, [rid]);

  /* 🔥 SEND MESSAGE */
  const sendText = () => {
    socket.current.emit("send-message", {
      roomId: rid,
      text: chatTxt,
      sender: myName
    });

    setChatTxt("");
  };

  /* 🔥 RECEIVE MESSAGE */
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("new-message", (msg) => {
      setRoom(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), msg]
      }));
    });
  }, []);

  /* ================= UI ================= */

  if (screen === "home") {
    return (
      <div style={{ padding: 40 }}>
        <h1>Group Shopping</h1>

        <input
          placeholder="Enter name"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
        />

        <br /><br />

        <button onClick={doCreate}>Create Room</button>
        <button onClick={doJoin}>Join Room</button>
      </div>
    );
  }

  if (screen === "room") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Room ID: {rid}</h2>

        <div style={{ height: 300, overflow: "auto", border: "1px solid gray" }}>
          {room?.messages?.map((m, i) => (
            <div key={i}>
              <b>{m.sender}:</b> {m.text}
            </div>
          ))}
        </div>

        <input
          value={chatTxt}
          onChange={(e) => setChatTxt(e.target.value)}
          placeholder="Type message"
        />

        <button onClick={sendText}>Send</button>
      </div>
    );
  }

  return null;
}