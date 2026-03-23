/**
 * Mock product catalogue.
 * In production, replace this with a fetch() to your existing DealDesi
 * product microservice:
 *
 *   export async function fetchProducts() {
 *     const res = await fetch("https://dealdesi-product-service.onrender.com/api/products");
 *     return res.json();
 *   }
 */

export const PRODUCTS = [
  { id: 1,  name: "Linen Kurta Set",      price: 899,  orig: 1499, emoji: "👘", tag: "Women", color: "#c0392b" },
  { id: 2,  name: "Formal Blazer",        price: 1299, orig: 2199, emoji: "🧥", tag: "Men",   color: "#2c3e50" },
  { id: 3,  name: "Crop Top",             price: 499,  orig: 799,  emoji: "👚", tag: "GenZ",  color: "#8e44ad" },
  { id: 4,  name: "Palazzo Trousers",     price: 699,  orig: 1199, emoji: "👖", tag: "Women", color: "#c0392b" },
  { id: 5,  name: "Banarasi Silk Saree",  price: 2499, orig: 3999, emoji: "🥻", tag: "Women", color: "#922b21" },
  { id: 6,  name: "Denim Jacket",         price: 1199, orig: 1999, emoji: "👔", tag: "Men",   color: "#2980b9" },
  { id: 7,  name: "Anarkali Dress",       price: 1599, orig: 2799, emoji: "👗", tag: "Women", color: "#8e44ad" },
  { id: 8,  name: "Casual Linen Shirt",   price: 599,  orig: 999,  emoji: "🩱", tag: "Men",   color: "#27ae60" },
  { id: 9,  name: "Indo-Western Jacket",  price: 1899, orig: 2999, emoji: "🪄", tag: "GenZ",  color: "#e67e22" },
  { id: 10, name: "Lehenga Set",          price: 3499, orig: 5999, emoji: "💃", tag: "Women", color: "#c0392b" },
];

export const THEMES = [
  { label: "Festive Shopping", emoji: "🪔", accent: "#c0392b" },
  { label: "Wedding Season",   emoji: "💍", accent: "#8e44ad" },
  { label: "Casual Haul",      emoji: "👟", accent: "#e67e22" },
  { label: "Office Wear",      emoji: "💼", accent: "#2980b9" },
  { label: "GenZ Picks",       emoji: "✨", accent: "#c0392b" },
];

export const AVATARS = [
  "🦋","🌸","✨","🌿","🎀","🍓","🌙","🦚",
  "🐝","🦊","🌺","🍀","🌊","🦁","🎸","🦄","🍭","🎭","🌈","🔮",
];

export const disc = (p) => Math.round((1 - p.price / p.orig) * 100);

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
