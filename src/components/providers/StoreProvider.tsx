"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProductById, getVariant, priceCart } from "@/lib/catalog";
import { siteConfig } from "@/config/site";
import type { CartLine } from "@/lib/types";

type Tone = "success" | "error" | "info";
export interface Toast { id: number; message: string; tone: Tone; action?: { label: string; onClick: () => void } }
export interface User { id: number; email: string; name: string; phone?: string | null }

interface StoreCtx {
  hydrated: boolean;
  cart: CartLine[];
  wishlist: string[];
  recent: string[];
  coupon: string | null;
  user: User | null;
  userLoaded: boolean;
  totals: ReturnType<typeof priceCart>;
  addToCart: (productId: string, sku: string, qty?: number, sourceImg?: HTMLElement | null) => boolean;
  setQuantity: (sku: string, qty: number) => void;
  removeLine: (sku: string) => void;
  changeVariant: (oldSku: string, newSku: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => boolean;
  inWishlist: (productId: string) => boolean;
  addRecent: (productId: string) => void;
  setCoupon: (code: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  toast: (message: string, tone?: Tone, action?: Toast["action"]) => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  announce: (msg: string) => void;
}

const Ctx = createContext<StoreCtx | null>(null);
export const useStore = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
};

const LS = { cart: "scp.cart", wish: "scp.wishlist", recent: "scp.recent", coupon: "scp.coupon" };
const read = <T,>(k: string, fallback: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
};

/** Decorative: flies a clone of the product image to the cart icon. Never blocks state updates. */
let flying = false;
function flyToCart(source: HTMLElement | null | undefined) {
  if (!source || flying || typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const target = [...document.querySelectorAll<HTMLElement>("[data-cart-target]")].find((el) => el.offsetParent !== null);
  if (!target) return;
  const s = source.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (!s.width) return;
  const clone = source.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    position: "fixed", left: `${s.left}px`, top: `${s.top}px`, width: `${s.width}px`, height: `${s.height}px`,
    zIndex: "100", pointerEvents: "none", borderRadius: "16px", overflow: "hidden", margin: "0",
  });
  document.body.appendChild(clone);
  flying = true;
  const dx = t.left + t.width / 2 - (s.left + s.width / 2);
  const dy = t.top + t.height / 2 - (s.top + s.height / 2);
  const anim = clone.animate(
    [
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 60}px) scale(0.5)`, opacity: 0.9, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.3 },
    ],
    { duration: 720, easing: "cubic-bezier(0.55, 0, 0.3, 1)" },
  );
  const done = () => {
    clone.remove();
    flying = false;
    target.animate([{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
  };
  anim.onfinish = done;
  anim.oncancel = done;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [coupon, setCouponState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");
  const syncedFor = useRef<number | null>(null);
  const toastId = useRef(0);

  // Hydrate from localStorage
  useEffect(() => {
    setCart(read<CartLine[]>(LS.cart, []).filter((l) => getProductById(l.productId) && getVariant(getProductById(l.productId)!, l.sku)));
    setWishlist(read<string[]>(LS.wish, []).filter((id) => getProductById(id)));
    setRecent(read<string[]>(LS.recent, []));
    setCouponState(read<string | null>(LS.coupon, null));
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem(LS.cart, JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(LS.wish, JSON.stringify(wishlist)); }, [wishlist, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(LS.recent, JSON.stringify(recent)); }, [recent, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem(LS.coupon, JSON.stringify(coupon)); }, [coupon, hydrated]);

  const refreshUser = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      const d = await r.json();
      setUser(d.user ?? null);
    } catch { setUser(null); }
    setUserLoaded(true);
  }, []);
  useEffect(() => { refreshUser(); }, [refreshUser]);

  // On sign-in: merge local cart/wishlist with account (server sanitises everything).
  useEffect(() => {
    if (!hydrated || !user || syncedFor.current === user.id) return;
    syncedFor.current = user.id;
    fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart, wishlist }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setCart(d.cart); setWishlist(d.wishlist); } })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hydrated]);

  // While signed in: debounce-push changes to the account.
  useEffect(() => {
    if (!hydrated || !user || syncedFor.current !== user.id) return;
    const t = setTimeout(() => {
      fetch("/api/sync", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cart, wishlist }) }).catch(() => {});
    }, 600);
    return () => clearTimeout(t);
  }, [cart, wishlist, user, hydrated]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const toast = useCallback<StoreCtx["toast"]>((message, tone = "success", action) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.slice(-2), { id, message, tone, action }]);
    setTimeout(() => dismissToast(id), tone === "error" ? 7000 : 3800);
  }, [dismissToast]);

  const announce = useCallback((m: string) => { setLiveMsg(""); requestAnimationFrame(() => setLiveMsg(m)); }, []);
  const max = siteConfig.commerce.maxQuantityPerLine;

  const addToCart = useCallback<StoreCtx["addToCart"]>((productId, sku, qty = 1, sourceImg) => {
    const p = getProductById(productId);
    const v = p && getVariant(p, sku);
    if (!p || !v) { toast("That option isn't available.", "error"); return false; }
    if (v.stock <= 0) { toast(`${p.name} is out of stock in this option.`, "error"); return false; }
    const existing = cart.find((l) => l.sku === sku)?.quantity ?? 0;
    const limit = Math.min(max, v.stock);
    const nextQty = Math.min(limit, existing + qty);
    if (nextQty === existing) { toast(`You've reached the maximum quantity (${limit}) for this item.`, "error"); return false; }
    setCart((c) => (c.some((l) => l.sku === sku) ? c.map((l) => (l.sku === sku ? { ...l, quantity: nextQty } : l)) : [...c, { productId, sku, quantity: nextQty }]));
    flyToCart(sourceImg);
    toast(`${p.name} added to your cart`, "success", { label: "View cart", onClick: () => setCartOpen(true) });
    announce(`${p.name} added to cart. Quantity ${nextQty}.`);
    return true;
  }, [cart, max, toast, announce]);

  const setQuantity = useCallback((sku: string, qty: number) => {
    setCart((c) => c.map((l) => {
      if (l.sku !== sku) return l;
      const v = getVariant(getProductById(l.productId)!, sku);
      return { ...l, quantity: Math.max(1, Math.min(max, v?.stock ?? max, Math.floor(qty) || 1)) };
    }));
  }, [max]);

  const removeLine = useCallback((sku: string) => {
    const line = cart.find((l) => l.sku === sku);
    if (!line) return;
    setCart((c) => c.filter((l) => l.sku !== sku));
    const name = getProductById(line.productId)?.name ?? "Item";
    toast(`${name} removed`, "info", { label: "Undo", onClick: () => setCart((c) => (c.some((l) => l.sku === sku) ? c : [...c, line])) });
    announce(`${name} removed from cart.`);
  }, [cart, toast, announce]);

  const changeVariant = useCallback((oldSku: string, newSku: string) => {
    setCart((c) => {
      const line = c.find((l) => l.sku === oldSku);
      if (!line) return c;
      const merged = c.find((l) => l.sku === newSku);
      const rest = c.filter((l) => l.sku !== oldSku && l.sku !== newSku);
      return [...rest, { ...line, sku: newSku, quantity: Math.min(max, line.quantity + (merged?.quantity ?? 0)) }];
    });
  }, [max]);

  const toggleWishlist = useCallback((productId: string) => {
    const p = getProductById(productId);
    const has = wishlist.includes(productId);
    setWishlist((w) => (has ? w.filter((x) => x !== productId) : [...new Set([...w, productId])]));
    toast(has ? `Removed ${p?.name} from your wishlist` : `Saved ${p?.name} to your wishlist`, has ? "info" : "success");
    announce(has ? "Removed from wishlist" : "Added to wishlist");
    return !has;
  }, [wishlist, toast, announce]);

  const addRecent = useCallback((id: string) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)), []);
  const setCoupon = useCallback((c: string | null) => setCouponState(c ? c.trim().toUpperCase() : null), []);
  const clearCart = useCallback(() => { setCart([]); setCouponState(null); }, []);
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
    syncedFor.current = null;
    // Account data stays on the server; clear the local copy for privacy on shared devices.
    setCart([]); setWishlist([]);
    toast("You've been signed out", "info");
  }, [toast]);

  const totals = useMemo(() => priceCart(cart, coupon), [cart, coupon]);

  const value: StoreCtx = {
    hydrated, cart, wishlist, recent, coupon, user, userLoaded, totals,
    addToCart, setQuantity, removeLine, changeVariant, clearCart, toggleWishlist,
    inWishlist: (id) => wishlist.includes(id), addRecent, setCoupon, refreshUser, logout,
    toast, toasts, dismissToast, cartOpen, setCartOpen, announce,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>
    </Ctx.Provider>
  );
}
