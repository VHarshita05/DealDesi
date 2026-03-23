import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";

const API_URL = "https://dealdesi.onrender.com";

/* KEEP ALL YOUR EXISTING CONSTANTS (PRODUCTS, THEMES, UI, etc.) SAME */

/* ❌ REMOVED LOCAL STORAGE */

/* ───────────────────────────────────────────────────────────── */

export default function DealDesiGroupShop() {
  const [screen, setScreen] = useState("home");
  const [rooms, setRooms] = useState({});
  const [rid, setRid] = useState(null);

  const [myName, setMyName] = useState("");
  const [myAvatar] = useState("🙂");

  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");

  const [cForm, setCForm] = useState({ name: "", theme: {}, max: 10 });
  const [chatTxt, setChatTxt] = useState("");
  const [tab, setTab] = useState("chat");

  const chatEnd = useRef(null);
  const socket = useRef(null);

  const room = rid ? rooms[rid] : null;

  /* 🔥 SOCKET CONNECT */
  useEffect(() => {
    socket.current = io(API_URL);
    return () => socket.current.disconnect();
  }, []);

  /* 🔥 LOAD ROOM */
  useEffect(() => {
    if (!rid) return;

    fetch(`${API_URL}/rooms/${rid}`)
      .then(res => res.json())
      .then(data => setRooms({ [rid]: data }));
  }, [rid]);

  /* 🔥 JOIN SOCKET ROOM */
  useEffect(() => {
    if (!socket.current || !rid) return;

    socket.current.emit("join-room", {
      roomId: rid,
      userName: myName,
      userAvatar: myAvatar
    });
  }, [rid]);

  /* 🔥 REAL-TIME EVENTS */
  useEffect(() => {
    if (!socket.current) return;

    socket.current.on("new-message", (msg) => {
      setRooms(prev => ({
        ...prev,
        [rid]: {
          ...prev[rid],
          messages: [...(prev[rid]?.messages || []), msg]
        }
      }));
    });

    socket.current.on("cart-updated", ({ cart }) => {
      setRooms(prev => ({
        ...prev,
        [rid]: {
          ...prev[rid],
          cart
        }
      }));
    });

    socket.current.on("member-joined", ({ member }) => {
      setRooms(prev => ({
        ...prev,
        [rid]: {
          ...prev[rid],
          members: [...prev[rid].members, member]
        }
      }));
    });

  }, [rid]);

  /* 🔥 CREATE ROOM */
  const doCreate = async () => {
    const res = await fetch(`${API_URL}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cForm.name,
        theme: cForm.theme,
        maxMembers: cForm.max,
        hostName: myName
      })
    });

    const room = await res.json();

    setRid(room.id);
    setScreen("room");
  };

  /* 🔥 JOIN ROOM */
  const doJoin = async () => {
    const res = await fetch(`${API_URL}/rooms/by-code/${joinCode}`);

    if (!res.ok) return setJoinErr("Room not found");

    const room = await res.json();

    setRid(room.id);
    setScreen("room");
  };

  /* 🔥 SEND TEXT */
  const sendText = () => {
    socket.current.emit("send-message", {
      roomId: rid,
      text: chatTxt,
      sender: myName
    });

    setChatTxt("");
  };

  /* 🔥 SEND PRODUCT */
  const sendProduct = (p) => {
    socket.current.emit("share-product", {
      roomId: rid,
      product: p,
      sender: myName
    });
  };

  /* 🔥 TOGGLE CART */
  const toggleCart = (p) => {
    socket.current.emit("toggle-cart", {
      roomId: rid,
      product: p,
      userName: myName
    });
  };

 server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}