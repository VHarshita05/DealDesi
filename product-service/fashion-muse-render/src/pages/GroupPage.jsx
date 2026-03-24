import { useState, useRef, useCallback, useEffect } from "react";
import { io } from "socket.io-client";
/* ─────────────────────────────────────────────────────────────
   CRYPTO ID GENERATION  (silent — backend concern)
───────────────────────────────────────────────────────────── */
function mkRoomId() {
  const a = new Uint8Array(18); crypto.getRandomValues(a);
  return btoa(String.fromCharCode(...a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"").slice(0,24);
}
function mkCode() {
  const a = new Uint8Array(5); crypto.getRandomValues(a);
  return Array.from(a).map(b => b.toString(36).toUpperCase()).join("").slice(0,6);
}
function uid() { return crypto.randomUUID(); }

/* ─────────────────────────────────────────────────────────────
   MOCK PRODUCTS  (replace with your products API endpoint)
───────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id:1,  name:"Linen Kurta Set",       price:899,  orig:1499, emoji:"👘", tag:"Women", color:"#c0392b" },
  { id:2,  name:"Formal Blazer",         price:1299, orig:2199, emoji:"🧥", tag:"Men",   color:"#2c3e50" },
  { id:3,  name:"Crop Top",              price:499,  orig:799,  emoji:"👚", tag:"GenZ",  color:"#8e44ad" },
  { id:4,  name:"Palazzo Trousers",      price:699,  orig:1199, emoji:"👖", tag:"Women", color:"#c0392b" },
  { id:5,  name:"Banarasi Silk Saree",   price:2499, orig:3999, emoji:"🥻", tag:"Women", color:"#922b21" },
  { id:6,  name:"Denim Jacket",          price:1199, orig:1999, emoji:"👔", tag:"Men",   color:"#2980b9" },
  { id:7,  name:"Anarkali Dress",        price:1599, orig:2799, emoji:"👗", tag:"Women", color:"#8e44ad" },
  { id:8,  name:"Casual Linen Shirt",    price:599,  orig:999,  emoji:"🩱", tag:"Men",   color:"#27ae60" },
  { id:9,  name:"Indo-Western Jacket",   price:1899, orig:2999, emoji:"🪄", tag:"GenZ",  color:"#e67e22" },
  { id:10, name:"Lehenga Set",           price:3499, orig:5999, emoji:"💃", tag:"Women", color:"#c0392b" },
];

const THEMES = [
  { label:"Festive Shopping", emoji:"🪔", accent:"#c0392b" },
  { label:"Wedding Season",   emoji:"💍", accent:"#8e44ad" },
  { label:"Casual Haul",      emoji:"👟", accent:"#e67e22" },
  { label:"Office Wear",      emoji:"💼", accent:"#2980b9" },
  { label:"GenZ Picks",       emoji:"✨", accent:"#c0392b" },
];

const AVATARS = ["🦋","🌸","✨","🌿","🎀","🍓","🌙","🦚","🐝","🦊","🌺","🍀","🌊","🦁","🎸","🦄","🍭","🎭","🌈","🔮"];
const MIN = 2, MAX = 20;

/* ─────────────────────────────────────────────────────────────
   LOCAL STORAGE  (swap for your microservice API calls)
───────────────────────────────────────────────────────────── */
const SK = "dealdesi_group_v2";
const loadRooms = () => { try { return JSON.parse(localStorage.getItem(SK) || "{}"); } catch { return {}; } };
const saveRooms = r => { try { localStorage.setItem(SK, JSON.stringify(r)); } catch {} };

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const disc = p => Math.round((1 - p.price / p.orig) * 100);
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  return `${Math.floor(s/3600)}h ago`;
}

/* ─────────────────────────────────────────────────────────────
   BRAND TOKENS  — matches DealDesi exactly
───────────────────────────────────────────────────────────── */
const DD_RED   = "#c0392b";   // DealDesi logo red
const DD_DARK  = "#1a1a2e";   // near-black text
const DD_GRAY  = "#666666";
const DD_LIGHT = "#f5f5f5";
const DD_WHITE = "#ffffff";
const DD_BORDER= "#e8e8e8";

/* ─────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────── */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Poppins', sans-serif; background: #f5f5f5; color: #1a1a2e; }
      input, button, select { font-family: 'Poppins', sans-serif; }
      input:focus { outline: none; border-color: #c0392b !important; box-shadow: 0 0 0 3px rgba(192,57,43,.1); }
      button { cursor: pointer; transition: opacity .18s, transform .12s; }
      button:hover { opacity: .88; }
      button:active { transform: scale(.97); }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: #f0f0f0; }
      ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
      @keyframes msgIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @keyframes pickerIn { from { transform: translateY(10px) scaleY(.96); opacity: 0; } to { transform: translateY(0) scaleY(1); opacity: 1; } }
      .msg { animation: msgIn .2s ease; }
      .picker { animation: pickerIn .18s ease; transform-origin: bottom; }
    `}</style>
  );
}

/* ─────────────────────────────────────────────────────────────
   NAVBAR  — exact DealDesi style
───────────────────────────────────────────────────────────── */
function NavBar({ onLogoClick, roomName }) {
  return (
    <nav style={{
      background: DD_WHITE, borderBottom: `1px solid ${DD_BORDER}`,
      height: 64, display: "flex", alignItems: "center",
      padding: "0 24px", gap: 32, position: "sticky", top: 0, zIndex: 300,
      boxShadow: "0 1px 6px rgba(0,0,0,.07)",
    }}>
      {/* Logo — matches screenshot exactly */}
      <div onClick={onLogoClick} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", flexShrink:0 }}>
        <div style={{
          width: 36, height: 36,
          background: `linear-gradient(135deg, #e8734a, ${DD_RED})`,
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(192,57,43,.3)",
        }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, letterSpacing: "-0.5px" }}>dd</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: 22, color: DD_RED, letterSpacing: "-0.03em" }}>DealDesi</span>
      </div>

      {/* Nav links */}
      <div style={{ display: "flex", gap: 28, flexShrink: 0 }}>
        {["MEN","WOMEN","HOME","GENZ"].map(n => (
          <span key={n} style={{ fontWeight: 600, fontSize: 13, color: DD_DARK, cursor: "pointer", letterSpacing: "0.02em", whiteSpace:"nowrap" }}
            onMouseEnter={e => e.target.style.color = DD_RED}
            onMouseLeave={e => e.target.style.color = DD_DARK}
          >{n}</span>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ flex: 1, maxWidth: 460, position: "relative" }}>
        <svg style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:"#aaa" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input placeholder="Search for products, brands and more"
          style={{
            width:"100%", height:38, paddingLeft:40, paddingRight:16,
            border: `1.5px solid ${DD_BORDER}`, borderRadius: 8,
            fontSize: 13, color: DD_DARK, background: "#fafafa",
          }}
          readOnly
        />
      </div>

      {/* Right icons */}
      <div style={{ display:"flex", gap:20, alignItems:"center", flexShrink:0, marginLeft:"auto" }}>
        {[
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>, label:"Location" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Profile" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, label:"Wishlist" },
          { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>, label:"Bag" },
        ].map(({ icon, label }) => (
          <div key={label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2, cursor:"pointer", color: DD_GRAY }}
            onMouseEnter={e => e.currentTarget.style.color = DD_RED}
            onMouseLeave={e => e.currentTarget.style.color = DD_GRAY}
          >
            {icon}
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.03em" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Room indicator */}
      {roomName && (
        <div style={{
          background: `${DD_RED}12`, border: `1.5px solid ${DD_RED}30`,
          borderRadius: 20, padding: "5px 14px", flexShrink: 0,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ width:7, height:7, borderRadius:"50%", background:"#27ae60", display:"inline-block", flexShrink:0 }}/>
          <span style={{ fontSize:11, fontWeight:700, color:DD_RED, whiteSpace:"nowrap" }}>{roomName}</span>
        </div>
      )}
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   SMALL REUSABLES
───────────────────────────────────────────────────────────── */
function Tag({ children, color = DD_RED }) {
  return (
    <span style={{
      background: color + "14", color, border: `1px solid ${color}28`,
      borderRadius: 20, padding: "2px 9px", fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase", display:"inline-block",
    }}>{children}</span>
  );
}

function PrimaryBtn({ children, onClick, disabled, fullWidth, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: disabled ? "#e0e0e0" : `linear-gradient(135deg, #e8734a, ${DD_RED})`,
      color: disabled ? "#aaa" : "#fff",
      border: "none", borderRadius: 10,
      padding: "13px 24px", fontWeight: 700, fontSize: 14,
      boxShadow: disabled ? "none" : "0 4px 16px rgba(192,57,43,.3)",
      width: fullWidth ? "100%" : "auto",
      letterSpacing: "0.01em",
      ...style,
    }}>{children}</button>
  );
}

function OutlineBtn({ children, onClick, fullWidth, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: DD_WHITE, color: DD_RED,
      border: `2px solid ${DD_RED}`, borderRadius: 10,
      padding: "11px 24px", fontWeight: 700, fontSize: 14,
      width: fullWidth ? "100%" : "auto",
      ...style,
    }}>{children}</button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHOP PRODUCT CARD
───────────────────────────────────────────────────────────── */
function ShopCard({ p, onShare, onCart, inCart }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: DD_WHITE, borderRadius: 12, overflow: "hidden",
        border: `1.5px solid ${hov ? DD_RED + "40" : DD_BORDER}`,
        boxShadow: hov ? "0 8px 24px rgba(192,57,43,.1)" : "0 2px 8px rgba(0,0,0,.06)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all .22s",
      }}
    >
      <div style={{ background: `${p.color}0e`, padding: "18px 0 14px", textAlign: "center", fontSize: 50, position: "relative" }}>
        {p.emoji}
        <span style={{ position:"absolute", top:10, left:10, background:DD_RED, color:"#fff", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800 }}>{disc(p)}% OFF</span>
        {inCart && <span style={{ position:"absolute", top:10, right:10, background:"#27ae60", color:"#fff", borderRadius:5, padding:"2px 7px", fontSize:10, fontWeight:800 }}>✓</span>}
      </div>
      <div style={{ padding:"10px 12px 14px" }}>
        <Tag color={p.color}>{p.tag}</Tag>
        <div style={{ fontWeight:700, fontSize:13, color:DD_DARK, margin:"6px 0 4px", lineHeight:1.35 }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
          <span style={{ fontWeight:800, fontSize:16, color:DD_RED }}>₹{p.price.toLocaleString()}</span>
          <span style={{ fontSize:11, color:"#bbb", textDecoration:"line-through" }}>₹{p.orig.toLocaleString()}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => onShare(p)} style={{
            flex:1, background:DD_WHITE, border:`1.5px solid ${DD_BORDER}`,
            color:DD_GRAY, borderRadius:8, padding:"7px 0",
            fontSize:11, fontWeight:600,
          }}>💬 Share</button>
          <button onClick={() => onCart(p)} style={{
            flex:2,
            background: inCart ? "#27ae6014" : `linear-gradient(135deg,#e8734a,${DD_RED})`,
            border: inCart ? "1.5px solid #27ae60" : "none",
            color: inCart ? "#27ae60" : "#fff",
            borderRadius:8, padding:"7px 0", fontSize:11, fontWeight:700,
          }}>{inCart ? "✓ In Cart" : "+ Add to Cart"}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD INSIDE CHAT
───────────────────────────────────────────────────────────── */
function ChatProduct({ p, onCart, inCart }) {
  return (
    <div style={{
      background: DD_WHITE, border:`1.5px solid ${DD_BORDER}`,
      borderRadius:12, padding:"10px 12px",
      display:"flex", alignItems:"center", gap:10, marginTop:6,
      maxWidth:290, boxShadow:"0 2px 8px rgba(0,0,0,.07)",
    }}>
      <div style={{ fontSize:30, background:`${p.color}10`, borderRadius:8, padding:"6px 8px", lineHeight:1, flexShrink:0 }}>{p.emoji}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:700, fontSize:12, color:DD_DARK, marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontWeight:800, fontSize:14, color:DD_RED }}>₹{p.price.toLocaleString()}</span>
          <span style={{ background:DD_RED, color:"#fff", borderRadius:4, padding:"1px 5px", fontSize:9, fontWeight:800 }}>{disc(p)}%</span>
        </div>
      </div>
      <button onClick={() => onCart(p)} style={{
        background: inCart ? "#27ae6014" : `linear-gradient(135deg,#e8734a,${DD_RED})`,
        border: inCart ? "1.5px solid #27ae60" : "none",
        color: inCart ? "#27ae60" : "#fff",
        borderRadius:8, padding:"8px 11px", fontSize:11, fontWeight:700, flexShrink:0, whiteSpace:"nowrap",
      }}>{inCart ? "✓ Added" : "+ Cart"}</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT PICKER POPUP (shown above chat input)
───────────────────────────────────────────────────────────── */
function ProductPicker({ onSelect, onClose }) {
  const [q, setQ] = useState("");
  const filtered = q
    ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.tag.toLowerCase().includes(q.toLowerCase()))
    : PRODUCTS;
  return (
    <div className="picker" style={{
      position:"absolute", bottom:"calc(100% + 8px)", left:0, right:0,
      background:DD_WHITE, borderRadius:14, overflow:"hidden",
      border:`1.5px solid ${DD_BORDER}`, boxShadow:"0 -4px 32px rgba(0,0,0,.14)",
      zIndex:400,
    }}>
      <div style={{ padding:"12px 14px 10px", borderBottom:`1px solid ${DD_BORDER}`, display:"flex", alignItems:"center", gap:8 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products to share…"
          autoFocus
          style={{ flex:1, border:"none", fontSize:13, color:DD_DARK, background:"transparent", outline:"none" }}
        />
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:18, color:"#bbb", lineHeight:1, padding:4 }}>✕</button>
      </div>
      <div style={{ maxHeight:270, overflowY:"auto" }}>
        {filtered.map(p => (
          <div key={p.id} onClick={() => { onSelect(p); onClose(); }}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", cursor:"pointer", transition:"background .15s", borderBottom:`1px solid #fafafa` }}
            onMouseEnter={e => e.currentTarget.style.background = "#fff5f3"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize:26, lineHeight:1, background:`${p.color}10`, borderRadius:8, padding:"4px 6px", flexShrink:0 }}>{p.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:13, color:DD_DARK }}>{p.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                <span style={{ fontWeight:700, fontSize:12, color:DD_RED }}>₹{p.price.toLocaleString()}</span>
                <span style={{ fontSize:11, color:"#ccc", textDecoration:"line-through" }}>₹{p.orig.toLocaleString()}</span>
                <Tag color={p.color}>{p.tag}</Tag>
              </div>
            </div>
            <span style={{ color:DD_RED, fontSize:12, fontWeight:700, flexShrink:0 }}>Share →</span>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding:20, textAlign:"center", color:"#bbb", fontSize:13 }}>No products found</div>}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOM MEMBER CHIP
───────────────────────────────────────────────────────────── */
function MemberChip({ m, isMe, accent }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap", flexShrink:0,
      background: isMe ? `${accent}12` : "#f8f8f8",
      border: `1.5px solid ${isMe ? accent + "44" : DD_BORDER}`,
      borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:600,
    }}>
      <span>{m.avatar}</span>
      <span style={{ color: isMe ? accent : DD_DARK }}>{m.name}</span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   MAIN APP
═════════════════════════════════════════════════════════════ */
export default function DealDesiGroupShop() {
  const [screen, setScreen]   = useState("home");
  const [rooms, setRooms]     = useState(loadRooms);
  const [rid, setRid]         = useState(null);
  const [myName, setMyName]   = useState("");
  const [myAvatar]            = useState(() => AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr]   = useState("");
  const [cForm, setCForm]       = useState({ name:"", theme:THEMES[0], max:10 });
  const [chatTxt, setChatTxt]   = useState("");
  const [tab, setTab]           = useState("chat");
  const [copied, setCopied]     = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const chatEnd   = useRef(null);
  const inputRef  = useRef(null);
  const pickerRef = useRef(null);

  const room = rid ? rooms[rid] : null;

  const persist = useCallback(u => { setRooms(u); saveRooms(u); }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [room?.messages?.length, screen]);

  useEffect(() => {
    if (!showPicker) return;
    const h = e => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setShowPicker(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showPicker]);

  /* ── helpers ── */
  const goHome = () => { setScreen("home"); setRid(null); };
  const inCart  = id => !!room?.cart.find(x => x.id === id);
  const total   = room?.cart.reduce((s,p) => s+p.price, 0) || 0;
  const mc      = room?.members.length || 0;
  const full    = room ? mc >= room.max : false;
  const ready   = mc >= MIN;

  /* ── create ── */
  const doCreate = () => {
    if (!myName.trim() || !cForm.name.trim()) return;
    const id = mkRoomId(), code = mkCode();
    const r = {
      id, code, name:cForm.name, theme:cForm.theme, max:cForm.max,
      host:myName, createdAt:Date.now(),
      members:[{ name:myName, avatar:myAvatar, joinedAt:Date.now() }],
      cart:[], messages:[
        { id:uid(), type:"system", text:`${myName} created the room 🎉`, ts:Date.now() },
        { id:uid(), type:"system", text:`Invite friends with code: ${code}`, ts:Date.now()+1 },
      ],
    };
    persist({ ...rooms, [id]:r }); setRid(id); setTab("chat"); setScreen("room");
  };

  /* ── join ── */
  const doJoin = () => {
    if (!myName.trim()) return;
    const c = joinCode.trim().toUpperCase();
    const m = Object.values(rooms).find(r => r.code === c);
    if (!m) { setJoinErr("Room not found. Check the code."); return; }
    if (m.members.length >= m.max) { setJoinErr(`This room is full (max ${m.max} members).`); return; }
    if (m.members.find(x => x.name === myName)) { setRid(m.id); setTab("chat"); setScreen("room"); return; }
    const u = { ...rooms, [m.id]:{ ...m,
      members:[...m.members, { name:myName, avatar:myAvatar, joinedAt:Date.now() }],
      messages:[...m.messages, { id:uid(), type:"system", text:`${myAvatar} ${myName} joined ✨`, ts:Date.now() }],
    }};
    persist(u); setRid(m.id); setTab("chat"); setScreen("room");
  };

  /* ── send text ── */
  const sendText = () => {
    if (!chatTxt.trim() || !room) return;
    const msg = { id:uid(), type:"text", sender:myName, avatar:myAvatar, text:chatTxt.trim(), ts:Date.now() };
    persist({ ...rooms, [room.id]:{ ...room, messages:[...room.messages, msg] } });
    setChatTxt(""); inputRef.current?.focus();
  };

  /* ── send product via picker ── */
  const sendProduct = p => {
    if (!room) return;
    const msg = { id:uid(), type:"product", sender:myName, avatar:myAvatar, product:p, ts:Date.now() };
    persist({ ...rooms, [room.id]:{ ...room, messages:[...room.messages, msg] } });
  };

  /* ── share from shop grid ── */
  const shareFromShop = p => { sendProduct(p); setTab("chat"); };

  /* ── cart toggle ── */
  const toggleCart = p => {
    if (!room) return;
    const has = room.cart.find(x => x.id === p.id);
    const cart = has ? room.cart.filter(x => x.id !== p.id) : [...room.cart, p];
    const sys = has ? null : { id:uid(), type:"system", text:`${myName} added "${p.name}" to the group cart 🛒`, ts:Date.now() };
    persist({ ...rooms, [room.id]:{ ...room, cart, messages: sys ? [...room.messages, sys] : room.messages } });
  };

  /* ════════════════════════════════════════
     HOME SCREEN
  ════════════════════════════════════════ */
  if (screen === "home") {
    const recent = Object.values(rooms).sort((a,b) => b.createdAt-a.createdAt).slice(0,4);
    return (
      <div style={{ minHeight:"100vh", background:DD_LIGHT }}>
        <GlobalStyle/>
        <NavBar onLogoClick={goHome}/>

        {/* Hero banner — matches DealDesi homepage style */}
        <div style={{
          background:"linear-gradient(120deg,#fff5f2 0%,#fff 60%,#fff8f5 100%)",
          borderBottom:`1px solid ${DD_BORDER}`, padding:"52px 24px 48px", textAlign:"center",
        }}>
          <div style={{ maxWidth:580, margin:"0 auto" }}>
            <Tag>NEW FEATURE</Tag>
            <h1 style={{ fontWeight:900, fontSize:38, color:DD_DARK, lineHeight:1.15, margin:"16px 0 12px", letterSpacing:"-0.025em" }}>
              Shop Together,<br/><span style={{ color:DD_RED }}>Decide Together</span>
            </h1>
            <p style={{ color:DD_GRAY, fontSize:15, lineHeight:1.75, marginBottom:32 }}>
              Create a group room, invite friends, share products in chat<br/>and build a shared cart — all in real time.
            </p>

            {/* Name input */}
            <div style={{ background:DD_WHITE, border:`1.5px solid ${DD_BORDER}`, borderRadius:14, padding:"20px 24px", marginBottom:20, textAlign:"left", boxShadow:"0 4px 18px rgba(0,0,0,.07)", maxWidth:440, margin:"0 auto 20px" }}>
              <label style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Your Name</label>
              <input value={myName} onChange={e => setMyName(e.target.value)}
                onKeyDown={e => e.key==="Enter" && myName.trim() && setScreen("create")}
                placeholder="Enter your name to get started…"
                style={{ width:"100%", border:`1.5px solid ${DD_BORDER}`, borderRadius:9, padding:"12px 14px", fontSize:14, color:DD_DARK, background:"#fafafa" }}
              />
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <PrimaryBtn onClick={() => myName.trim() && setScreen("create")} style={{ minWidth:170, borderRadius:10, padding:"14px 28px", fontSize:15 }}>
                ✦ Create Room
              </PrimaryBtn>
              <OutlineBtn onClick={() => myName.trim() && setScreen("join")} style={{ minWidth:170, borderRadius:10, padding:"12px 28px", fontSize:15 }}>
                ↗ Join a Room
              </OutlineBtn>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div style={{ background:DD_WHITE, borderBottom:`1px solid ${DD_BORDER}`, padding:"18px 24px", display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          {[["👥","2–20 Friends"],["💬","Live Group Chat"],["🛍","Share Products"],["🛒","Shared Cart"],["🎉","Group Checkout"]].map(([e,l]) => (
            <div key={l} style={{ display:"flex", alignItems:"center", gap:7, padding:"7px 16px", borderRadius:30, border:`1px solid ${DD_BORDER}`, fontSize:12, fontWeight:600, color:DD_DARK }}>
              <span style={{fontSize:16}}>{e}</span> {l}
            </div>
          ))}
        </div>

        {/* Recent rooms */}
        {recent.length > 0 && (
          <div style={{ maxWidth:600, margin:"28px auto 0", padding:"0 20px 48px" }}>
            <div style={{ fontWeight:700, fontSize:13, color:DD_GRAY, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:14 }}>Recent Rooms</div>
            {recent.map(r => (
              <div key={r.id} onClick={() => {
                if (!myName.trim()) return;
                if (!r.members.find(m => m.name===myName)) {
                  if (r.members.length >= r.max) return;
                  const u = { ...rooms, [r.id]:{ ...r, members:[...r.members,{name:myName,avatar:myAvatar,joinedAt:Date.now()}], messages:[...r.messages,{id:uid(),type:"system",text:`${myAvatar} ${myName} rejoined ✨`,ts:Date.now()}] }};
                  persist(u);
                }
                setRid(r.id); setTab("chat"); setScreen("room");
              }} style={{
                background:DD_WHITE, border:`1.5px solid ${DD_BORDER}`,
                borderRadius:14, padding:"14px 18px",
                display:"flex", alignItems:"center", justifyContent:"space-between",
                marginBottom:10, cursor:"pointer", transition:"all .2s",
                boxShadow:"0 2px 8px rgba(0,0,0,.05)",
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=DD_RED+"55";e.currentTarget.style.boxShadow="0 4px 16px rgba(192,57,43,.12)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=DD_BORDER;e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.05)";}}
              >
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:DD_DARK }}>{r.theme.emoji} {r.name}</div>
                  <div style={{ fontSize:12, color:DD_GRAY, marginTop:3 }}>{r.members.length}/{r.max} members · by {r.host} · {r.theme.label}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  {r.members.length >= r.max && <Tag color="#e74c3c">Full</Tag>}
                  <span style={{ color:DD_RED, fontWeight:700, fontSize:20 }}>›</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════
     CREATE SCREEN
  ════════════════════════════════════════ */
  if (screen === "create") return (
    <div style={{ minHeight:"100vh", background:DD_LIGHT }}>
      <GlobalStyle/>
      <NavBar onLogoClick={goHome}/>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"32px 20px 60px" }}>
        <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:DD_GRAY, fontSize:13, fontWeight:600, marginBottom:24, padding:0 }}>← Back</button>
        <h2 style={{ fontWeight:800, fontSize:26, color:DD_DARK, marginBottom:4 }}>Create a Room</h2>
        <p style={{ color:DD_GRAY, fontSize:13, marginBottom:26 }}>Set up your group shopping session on DealDesi</p>

        <div style={{ background:DD_WHITE, borderRadius:16, padding:26, boxShadow:"0 4px 18px rgba(0,0,0,.07)", marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:8 }}>Room Name</label>
          <input value={cForm.name} onChange={e => setCForm(f=>({...f,name:e.target.value}))}
            placeholder="e.g. Diwali Shopping 🪔, Wedding Haul 💍"
            style={{ width:"100%", border:`1.5px solid ${DD_BORDER}`, borderRadius:10, padding:"12px 16px", fontSize:14, color:DD_DARK, marginBottom:22, background:"#fafafa" }}
          />

          <label style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:10 }}>Shopping Theme</label>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:22 }}>
            {THEMES.map(t => (
              <button key={t.label} onClick={() => setCForm(f=>({...f,theme:t}))} style={{
                padding:"8px 14px", borderRadius:20, fontSize:12, fontWeight:600,
                border:`1.5px solid ${cForm.theme.label===t.label ? t.accent : DD_BORDER}`,
                background: cForm.theme.label===t.label ? t.accent+"14" : "#fafafa",
                color: cForm.theme.label===t.label ? t.accent : DD_GRAY,
                transition:"all .2s",
              }}>{t.emoji} {t.label}</button>
            ))}
          </div>

          <label style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:10 }}>
            Max Members: <span style={{ color:DD_RED }}>{cForm.max}</span>
          </label>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <input type="range" min={MIN} max={MAX} value={cForm.max}
              onChange={e => setCForm(f=>({...f,max:+e.target.value}))}
              style={{ flex:1, accentColor:DD_RED }}
            />
            <div style={{ minWidth:44, textAlign:"center", fontWeight:900, fontSize:20, color:DD_RED, background:`${DD_RED}10`, borderRadius:8, padding:"4px 6px" }}>{cForm.max}</div>
          </div>
          <div style={{ fontSize:11, color:"#bbb", marginTop:8 }}>Min {MIN} members needed to checkout · Max {MAX}</div>
        </div>

        <PrimaryBtn onClick={doCreate} disabled={!cForm.name.trim()} fullWidth style={{ padding:"15px", borderRadius:12, fontSize:15 }}>
          ✦ Create Group Room
        </PrimaryBtn>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     JOIN SCREEN
  ════════════════════════════════════════ */
  if (screen === "join") return (
    <div style={{ minHeight:"100vh", background:DD_LIGHT }}>
      <GlobalStyle/>
      <NavBar onLogoClick={goHome}/>
      <div style={{ maxWidth:440, margin:"0 auto", padding:"32px 20px 60px" }}>
        <button onClick={() => setScreen("home")} style={{ background:"none", border:"none", color:DD_GRAY, fontSize:13, fontWeight:600, marginBottom:24, padding:0 }}>← Back</button>
        <h2 style={{ fontWeight:800, fontSize:26, color:DD_DARK, marginBottom:4 }}>Join a Room</h2>
        <p style={{ color:DD_GRAY, fontSize:13, marginBottom:26 }}>Enter the 6-character code your friend shared with you</p>

        <div style={{ background:DD_WHITE, borderRadius:16, padding:26, boxShadow:"0 4px 18px rgba(0,0,0,.07)", marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.08em", textTransform:"uppercase", display:"block", marginBottom:10 }}>Invite Code</label>
          <input value={joinCode} maxLength={6}
            onChange={e => { setJoinCode(e.target.value.toUpperCase().slice(0,6)); setJoinErr(""); }}
            onKeyDown={e => e.key==="Enter" && doJoin()}
            placeholder="AB1C2D"
            style={{ width:"100%", border:`1.5px solid ${DD_BORDER}`, borderRadius:10, padding:"16px", fontSize:30, fontWeight:900, letterSpacing:"0.35em", textAlign:"center", color:DD_DARK, background:"#fafafa" }}
          />
          {joinErr && <div style={{ color:DD_RED, fontSize:12, marginTop:10, textAlign:"center", fontWeight:600 }}>{joinErr}</div>}
        </div>

        <PrimaryBtn onClick={doJoin} disabled={joinCode.length < 4} fullWidth style={{ padding:"15px", borderRadius:12, fontSize:15 }}>
          ↗ Join Room
        </PrimaryBtn>
      </div>
    </div>
  );

  /* ════════════════════════════════════════
     ROOM SCREEN
  ════════════════════════════════════════ */
  if (screen === "room" && room) {
    const accent = room.theme.accent;

    return (
      <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:DD_LIGHT, overflow:"hidden" }}>
        <GlobalStyle/>
        <NavBar onLogoClick={goHome} roomName={room.name}/>

        {/* Room sub-header */}
        <div style={{ background:DD_WHITE, borderBottom:`1.5px solid ${DD_BORDER}`, padding:"10px 16px", flexShrink:0, boxShadow:"0 1px 6px rgba(0,0,0,.05)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <button onClick={goHome} style={{ background:"none", border:"none", fontSize:20, color:DD_GRAY, lineHeight:1, padding:0 }}>←</button>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:DD_DARK }}>{room.theme.emoji} {room.name}</div>
                <div style={{ fontSize:11, color:DD_GRAY, marginTop:1 }}>
                  {mc}/{room.max} members
                  {!ready && <span style={{ color:"#e67e22", marginLeft:6 }}>· Waiting for more friends</span>}
                  {ready && !full && <span style={{ color:"#27ae60", marginLeft:6 }}>· Shopping Live!</span>}
                  {full && <span style={{ color:DD_RED, marginLeft:6 }}>· Room Full</span>}
                </div>
              </div>
            </div>
            {/* Copy code button */}
            <button onClick={() => { navigator.clipboard.writeText(room.code).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); }} style={{
              background: copied ? "#27ae6012" : `${DD_RED}10`,
              border: `1.5px solid ${copied ? "#27ae60" : DD_RED+"44"}`,
              color: copied ? "#27ae60" : DD_RED,
              borderRadius:8, padding:"7px 16px", fontSize:11, fontWeight:700,
            }}>{copied ? "✓ COPIED" : `📋 Code: ${room.code}`}</button>
          </div>

          {/* Members row */}
          <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:2 }}>
            {room.members.map(m => <MemberChip key={m.name} m={m} isMe={m.name===myName} accent={accent}/>)}
            {mc < room.max && (
              <div style={{ display:"flex", alignItems:"center", whiteSpace:"nowrap", background:"#fafafa", border:`1.5px dashed ${DD_BORDER}`, borderRadius:20, padding:"4px 12px", fontSize:11, color:"#ccc", flexShrink:0 }}>
                +{room.max - mc} open
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:DD_WHITE, display:"flex", borderBottom:`1.5px solid ${DD_BORDER}`, flexShrink:0 }}>
          {[
            { id:"chat", label:"💬 Chat" },
            { id:"shop", label:"🛍 Shop" },
            { id:"cart", label:`🛒 Cart${room.cart.length > 0 ? ` (${room.cart.length})` : ""}` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, background:"none", border:"none",
              borderBottom:`3px solid ${tab===t.id ? DD_RED : "transparent"}`,
              color: tab===t.id ? DD_RED : DD_GRAY,
              padding:"13px 0", fontSize:13, fontWeight:700,
              transition:"all .2s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ─── CHAT TAB ─── */}
        {tab === "chat" && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", minHeight:0, background:"#f9f9f9" }}>
            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"16px 14px 8px", display:"flex", flexDirection:"column", gap:3 }}>
              {room.messages.map(msg => {
                if (msg.type === "system") return (
                  <div key={msg.id} style={{ textAlign:"center", color:"#ccc", fontSize:11, padding:"4px 0", fontStyle:"italic" }}>{msg.text}</div>
                );
                const me = msg.sender === myName;
                return (
                  <div key={msg.id} className="msg" style={{ display:"flex", flexDirection:me?"row-reverse":"row", alignItems:"flex-end", gap:8, marginBottom:4 }}>
                    {!me && <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{msg.avatar}</div>}
                    <div style={{ maxWidth:"72%", display:"flex", flexDirection:"column", alignItems:me?"flex-end":"flex-start" }}>
                      {!me && <div style={{ fontSize:10, color:DD_GRAY, fontWeight:700, marginBottom:3 }}>{msg.sender}</div>}

                      {msg.type === "text" && (
                        <div style={{
                          background: me ? `linear-gradient(135deg, #e8734a, ${DD_RED})` : DD_WHITE,
                          color: me ? "#fff" : DD_DARK,
                          border: me ? "none" : `1.5px solid ${DD_BORDER}`,
                          borderRadius: me ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          padding:"10px 14px", fontSize:13, lineHeight:1.55, wordBreak:"break-word",
                          boxShadow: me ? "0 2px 10px rgba(192,57,43,.22)" : "0 1px 4px rgba(0,0,0,.06)",
                        }}>{msg.text}</div>
                      )}

                      {msg.type === "product" && (
                        <div style={{ display:"flex", flexDirection:"column", alignItems:me?"flex-end":"flex-start" }}>
                          <div style={{
                            background: me ? `linear-gradient(135deg, #e8734a, ${DD_RED})` : DD_WHITE,
                            color: me ? "#fff" : DD_DARK,
                            border: me ? "none" : `1.5px solid ${DD_BORDER}`,
                            borderRadius:"16px 16px 16px 4px",
                            padding:"8px 14px", fontSize:12, lineHeight:1.4,
                            boxShadow: me ? "0 2px 10px rgba(192,57,43,.22)" : "0 1px 4px rgba(0,0,0,.06)",
                          }}>
                            {me ? "Check this out! 👇" : `${msg.sender} is sharing this 👇`}
                          </div>
                          <ChatProduct p={msg.product} onCart={toggleCart} inCart={inCart(msg.product.id)}/>
                        </div>
                      )}

                      <div style={{ fontSize:10, color:"#ccc", marginTop:3, paddingLeft:2, paddingRight:2 }}>{timeAgo(msg.ts)}</div>
                    </div>
                    {me && <div style={{ fontSize:22, lineHeight:1, flexShrink:0 }}>{myAvatar}</div>}
                  </div>
                );
              })}
              <div ref={chatEnd}/>
            </div>

            {/* Chat input bar */}
            <div style={{ flexShrink:0, padding:"10px 12px", background:DD_WHITE, borderTop:`1.5px solid ${DD_BORDER}`, position:"relative" }} ref={pickerRef}>
              {showPicker && <ProductPicker onSelect={p => { sendProduct(p); setShowPicker(false); }} onClose={() => setShowPicker(false)}/>}
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                {/* Product share button */}
                <button onClick={() => setShowPicker(v => !v)} title="Share a product in chat" style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  border: `1.5px solid ${showPicker ? DD_RED : DD_BORDER}`,
                  background: showPicker ? `${DD_RED}10` : "#fafafa",
                  color: showPicker ? DD_RED : DD_GRAY, fontSize:18,
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>🛍</button>

                <input ref={inputRef} value={chatTxt} onChange={e => setChatTxt(e.target.value)}
                  onKeyDown={e => e.key==="Enter" && !e.shiftKey && sendText()}
                  placeholder="Type a message…"
                  style={{ flex:1, border:`1.5px solid ${DD_BORDER}`, borderRadius:10, padding:"10px 14px", fontSize:13, color:DD_DARK, background:"#fafafa" }}
                />

                <button onClick={sendText} disabled={!chatTxt.trim()} style={{
                  width:40, height:40, borderRadius:10, border:"none", flexShrink:0,
                  background: chatTxt.trim() ? `linear-gradient(135deg,#e8734a,${DD_RED})` : DD_BORDER,
                  color: chatTxt.trim() ? "#fff" : "#bbb",
                  fontSize:18, display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow: chatTxt.trim() ? "0 2px 10px rgba(192,57,43,.25)" : "none",
                }}>↑</button>
              </div>
              <div style={{ fontSize:10, color:"#ccc", marginTop:5, paddingLeft:2 }}>
                Tap 🛍 to search &amp; share a DealDesi product in chat
              </div>
            </div>
          </div>
        )}

        {/* ─── SHOP TAB ─── */}
        {tab === "shop" && (
          <div style={{ flex:1, overflowY:"auto", background:DD_LIGHT }}>
            <div style={{ padding:"12px 14px 8px", fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.07em", textTransform:"uppercase" }}>
              Tap "Share" to send a product to the group chat
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, padding:"0 14px 24px" }}>
              {PRODUCTS.map(p => <ShopCard key={p.id} p={p} onShare={shareFromShop} onCart={toggleCart} inCart={inCart(p.id)}/>)}
            </div>
          </div>
        )}

        {/* ─── CART TAB ─── */}
        {tab === "cart" && (
          <div style={{ flex:1, overflowY:"auto", padding:16, background:DD_LIGHT }}>
            {room.cart.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:56, marginBottom:14 }}>🛒</div>
                <div style={{ fontSize:15, fontWeight:700, color:DD_DARK, marginBottom:6 }}>Your group cart is empty</div>
                <div style={{ fontSize:13, color:DD_GRAY, marginBottom:20 }}>Share products in chat or add them from the shop.</div>
                <PrimaryBtn onClick={() => setTab("shop")}>Browse Shop →</PrimaryBtn>
              </div>
            ) : (
              <>
                <div style={{ fontSize:11, fontWeight:700, color:DD_GRAY, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:14 }}>
                  Group Cart · {room.cart.length} Item{room.cart.length!==1?"s":""}
                </div>
                {room.cart.map(p => (
                  <div key={p.id} style={{ background:DD_WHITE, border:`1.5px solid ${DD_BORDER}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ fontSize:34, lineHeight:1, background:`${p.color}10`, borderRadius:10, padding:"8px 9px", flexShrink:0 }}>{p.emoji}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:DD_DARK }}>{p.name}</div>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                          <span style={{ fontWeight:800, fontSize:15, color:DD_RED }}>₹{p.price.toLocaleString()}</span>
                          <span style={{ fontSize:11, color:"#ccc", textDecoration:"line-through" }}>₹{p.orig.toLocaleString()}</span>
                          <Tag color={p.color}>{disc(p)}% off</Tag>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => toggleCart(p)} style={{ background:"#fff0f0", border:"1.5px solid #ffdddd", color:"#e74c3c", borderRadius:8, padding:"7px 14px", fontSize:11, fontWeight:700 }}>Remove</button>
                  </div>
                ))}

                {/* Cart summary */}
                <div style={{ background:DD_WHITE, border:`2px solid ${DD_RED}22`, borderRadius:16, padding:22, marginTop:8, boxShadow:"0 4px 18px rgba(0,0,0,.07)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                    <div>
                      <div style={{ fontSize:11, color:DD_GRAY, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>Group Total</div>
                      <div style={{ fontSize:34, fontWeight:900, color:DD_RED, lineHeight:1.1 }}>₹{total.toLocaleString()}</div>
                      <div style={{ fontSize:12, color:DD_GRAY, marginTop:4 }}>≈ ₹{Math.round(total/Math.max(mc,1)).toLocaleString()} per person ({mc} members)</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontSize:13, color:DD_GRAY, marginBottom:6 }}>{room.cart.length} item{room.cart.length!==1?"s":""}</div>
                      {!ready ? <Tag color="#e67e22">Need {MIN-mc} more</Tag> : <Tag color="#27ae60">Ready ✓</Tag>}
                    </div>
                  </div>

                  <PrimaryBtn onClick={() => {}} disabled={!ready} fullWidth style={{ padding:"16px", borderRadius:12, fontSize:15 }}>
                    {ready ? `Checkout · ₹${total.toLocaleString()}` : `Need ${MIN-mc} more friend${MIN-mc!==1?"s":""} to checkout`}
                  </PrimaryBtn>
                  {!ready && <div style={{ textAlign:"center", fontSize:11, color:DD_GRAY, marginTop:10 }}>At least {MIN} members must be in the room to checkout</div>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}
