import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const API_URL = "https://dealdesi.onrender.com";

export default function GroupPage() {
  const [screen, setScreen] = useState("home");
  const [room, setRoom] = useState(null);
  const [rid, setRid] = useState(null);

  const [myName, setMyName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [chatTxt, setChatTxt] = useState("");

  const socket = useRef(null);

  /* 🔥 CONNECT SOCKET */
  useEffect(() => {
    socket.current = io(API_URL);
    return () => socket.current.disconnect();
  }, []);

  /* 🔥 CREATE ROOM */
  const doCreate = async () => {
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Group Shopping",
        hostName: myName
      })
    });

    const data = await res.json();
    setRid(data.id);
    setRoom(data);
    setScreen("room");
  };

  /* 🔥 JOIN ROOM */
  const doJoin = async () => {
    const res = await fetch(`${API_URL}/rooms/by-code/${joinCode}`);
    if (!res.ok) return alert("Room not found");

    const data = await res.json();
    setRid(data.id);
    setRoom(data);
    setScreen("room");
  };

  /* 🔥 JOIN SOCKET ROOM */
  useEffect(() => {
    if (!rid || !socket.current) return;

    socket.current.emit("join-room", {
      roomId: rid,
      userName: myName,
      userAvatar: "🙂"
    }, (res) => {
      if (res?.error) alert(res.error);
      else setRoom(res.room);
    });

  }, [rid]);

  /* 🔥 RECEIVE EVENTS */
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("new-message", (msg) => {
      setRoom(prev => ({
        ...prev,
        messages: [...(prev?.messages || []), msg]
      }));
    });

    socket.current.on("cart-updated", ({ cart }) => {
      setRoom(prev => ({ ...prev, cart }));
    });

    socket.current.on("member-joined", ({ member }) => {
      setRoom(prev => ({
        ...prev,
        members: [...prev.members, member]
      }));
    });

    socket.current.on("member-left", ({ userName }) => {
      setRoom(prev => ({
        ...prev,
        members: prev.members.filter(m => m.name !== userName)
      }));
    });

  }, []);

  /* 🔥 SEND MESSAGE */
  const sendText = () => {
    if (!chatTxt.trim()) return;

    socket.current.emit("send-message", {
      roomId: rid,
      text: chatTxt,
      sender: myName,
      avatar: "🙂"
    });

    setChatTxt("");
  };

  /* 🔥 SHARE PRODUCT */
  const shareProduct = () => {
    socket.current.emit("share-product", {
      roomId: rid,
      product: { name: "Demo Product", price: 999 },
      sender: myName,
      avatar: "🙂"
    });
  };

  /* 🔥 ADD TO CART */
  const addToCart = () => {
    socket.current.emit("toggle-cart", {
      roomId: rid,
      product: { id: 1, name: "Item", price: 500 },
      userName: myName
    });
  };

  /* ================= UI ================= */

  if (screen === "home") {
    return (
      <div style={{ padding: 40 }}>
        <h2>Group Shopping</h2>

        <input
          placeholder="Enter name"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
        />

        <br /><br />

        <button onClick={doCreate}>Create Room</button>

        <br /><br />

        <input
          placeholder="Enter Code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />

        <button onClick={doJoin}>Join Room</button>
      </div>
    );
  }

  if (screen === "room") {
    return (
      <div style={{ padding: 20 }}>
        <h2>Room Code: {room?.code}</h2>

        <div style={{ border: "1px solid gray", height: 200, overflow: "auto" }}>
          {room?.messages?.map((m, i) => (
            <div key={i}>
              <b>{m.sender || "SYSTEM"}:</b> {m.text || JSON.stringify(m.product)}
            </div>
          ))}
        </div>

        <input
          value={chatTxt}
          onChange={(e) => setChatTxt(e.target.value)}
        />

        <button onClick={sendText}>Send</button>

        <br /><br />

        <button onClick={shareProduct}>Share Product</button>
        <button onClick={addToCart}>Toggle Cart</button>

        <h3>Members:</h3>
        {room?.members?.map((m, i) => (
          <div key={i}>{m.name}</div>
        ))}

        <h3>Cart:</h3>
        {room?.cart?.map((c, i) => (
          <div key={i}>{c.name}</div>
        ))}
      </div>
    );
  }

  return null;
}