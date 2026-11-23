"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, PawPrint, Plus, Trash2, Loader2, ShoppingBag, RotateCcw } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { displayVariant, formatPrice, getProductById, stockLabel, totalStock, animalLabels } from "@/lib/catalog";
import { validateAddress } from "@/lib/validation";
import { EmptyState } from "@/components/ui/misc";
import type { Product } from "@/lib/types";
import type { OrderItem } from "@/db/schema";

const NAV = [
  { href: "/account", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/pets", label: "Pet profiles", icon: PawPrint },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();
  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28">
      <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:px-0">
        {NAV.map((n) => {
          const active = n.href === "/account" ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <li key={n.href} className="shrink-0">
              <Link href={n.href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-4 text-[14px] font-semibold whitespace-nowrap ${active ? "bg-slate text-white" : "text-ink hover:bg-pale"}`}>
                <n.icon className="size-4" aria-hidden />{n.label}
              </Link>
            </li>
          );
        })}
        <li className="shrink-0">
          <button onClick={async () => { await logout(); router.push("/"); router.refresh(); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-[14px] font-semibold whitespace-nowrap text-muted hover:bg-pale hover:text-error">
            <LogOut className="size-4" aria-hidden />Sign out
          </button>
        </li>
      </ul>
    </nav>
  );
}

export function ProfileForm({ name: n0, phone: p0, email }: { name: string; phone: string | null; email: string }) {
  const { toast, refreshUser } = useStore();
  const [name, setName] = useState(n0);
  const [phone, setPhone] = useState(p0 ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setErr("Enter your name."); return; }
    setSaving(true); setErr(null);
    const r = await fetch("/api/auth/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) }).catch(() => null);
    setSaving(false);
    if (!r?.ok) { toast("Couldn't save your profile. Please try again.", "error"); return; }
    toast("Profile updated"); refreshUser();
  };
  return (
    <form onSubmit={save} noValidate className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
      <h2 className="text-lg font-bold sm:col-span-2">Profile</h2>
      <div><label htmlFor="pf-name" className="label">Name</label><input id="pf-name" className="field" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err} />{err && <p className="error-text">{err}</p>}</div>
      <div><label htmlFor="pf-phone" className="label">Phone <span className="font-normal text-muted">(optional)</span></label><input id="pf-phone" type="tel" className="field" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      <div className="sm:col-span-2"><label htmlFor="pf-email" className="label">Email</label><input id="pf-email" className="field bg-pale" value={email} readOnly aria-readonly /></div>
      <div className="sm:col-span-2"><button className="btn-primary" disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />}Save changes</button></div>
    </form>
  );
}

type Address = { id: number; label: string; fullName: string; phone: string; line1: string; line2: string | null; city: string; state: string; postalCode: string; isDefault: boolean };
const blankAddr = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", isDefault: false };

export function AddressesPanel() {
  const { toast } = useStore();
  const [list, setList] = useState<Address[] | null>(null);
  const [form, setForm] = useState<typeof blankAddr | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const load = useCallback(() => { fetch("/api/addresses").then((r) => r.json()).then((d) => setList(d.addresses ?? [])).catch(() => setList([])); }, []);
  useEffect(load, [load]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const errs = validateAddress(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const r = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) { const d = await r.json().catch(() => ({})); setErrors(d.errors ?? {}); toast("Couldn't save address", "error"); return; }
    toast("Address saved"); setForm(null); load();
  };
  const remove = async (id: number) => { await fetch(`/api/addresses?id=${id}`, { method: "DELETE" }); toast("Address removed", "info"); load(); };
  const fields: [keyof typeof blankAddr, string, string?][] = [["label", "Label (e.g. Home, Work)"], ["fullName", "Full name"], ["phone", "Phone"], ["line1", "Address line 1", "sm:col-span-2"], ["line2", "Address line 2 (optional)", "sm:col-span-2"], ["city", "City"], ["state", "State"], ["postalCode", "PIN code"]];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold text-slate">Saved addresses</h1>{!form && <button onClick={() => setForm(blankAddr)} className="btn-primary btn-sm"><Plus className="size-4" />Add address</button>}</div>
      {form && (
        <form onSubmit={save} noValidate className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          {fields.map(([k, label, cls]) => (
            <div key={k} className={cls}><label htmlFor={`ad-${k}`} className="label">{label}</label><input id={`ad-${k}`} className="field" value={String(form[k])} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errors[k]} />{errors[k] && <p className="error-text">{errors[k]}</p>}</div>
          ))}
          <label className="flex items-center gap-2 text-[14px] sm:col-span-2"><input type="checkbox" className="size-4 accent-slate" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />Set as default address</label>
          <div className="flex gap-2 sm:col-span-2"><button className="btn-primary">Save address</button><button type="button" onClick={() => { setForm(null); setErrors({}); }} className="btn-ghost">Cancel</button></div>
        </form>
      )}
      {list === null ? <div className="h-32 animate-pulse rounded-2xl bg-pale" /> : list.length === 0 && !form ? (
        <EmptyState icon={<MapPin className="size-7" />} title="No saved addresses" text="Add an address for a faster checkout next time." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="card p-5 text-[14px]">
              <div className="flex items-center justify-between"><p className="font-bold">{a.label}{a.isDefault && <span className="ml-2 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-success">Default</span>}</p>
                <button onClick={() => remove(a.id)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-pale hover:text-error" aria-label={`Delete ${a.label} address`}><Trash2 className="size-4" /></button></div>
              <p className="mt-2 text-muted">{a.fullName}<br />{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Pet = { id: number; name: string; animal: string; breed: string | null; ageRange: string | null; dietary: string | null; sensitivities: string | null };
const blankPet = { name: "", animal: "", breed: "", ageRange: "", dietary: "", sensitivities: "" };

export function PetsPanel() {
  const { toast } = useStore();
  const [pets, setPets] = useState<Pet[] | null>(null);
  const [form, setForm] = useState<typeof blankPet | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const load = useCallback(() => { fetch("/api/pets").then((r) => r.json()).then((d) => setPets(d.pets ?? [])).catch(() => setPets([])); }, []);
  useEffect(load, [load]);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Enter your pet's name.";
    if (!form.animal) errs.animal = "Choose an animal type.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const r = await fetch("/api/pets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (!r.ok) { toast("Couldn't save pet profile", "error"); return; }
    toast(`${form.name}'s profile saved`); setForm(null); load();
  };
  const remove = async (p: Pet) => { await fetch(`/api/pets?id=${p.id}`, { method: "DELETE" }); toast(`${p.name}'s profile removed`, "info"); load(); };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold text-slate">Pet profiles</h1><p className="text-[14px] text-muted">Optional details we use only to tailor browsing and recommendations.</p></div>{!form && <button onClick={() => setForm(blankPet)} className="btn-primary btn-sm"><Plus className="size-4" />Add a pet</button>}</div>
      {form && (
        <form onSubmit={save} noValidate className="card grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div><label htmlFor="pt-name" className="label">Pet name</label><input id="pt-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={!!errors.name} />{errors.name && <p className="error-text">{errors.name}</p>}</div>
          <div><label htmlFor="pt-animal" className="label">Animal type</label><select id="pt-animal" className="field" value={form.animal} onChange={(e) => setForm({ ...form, animal: e.target.value })} aria-invalid={!!errors.animal}><option value="">Choose…</option>{Object.entries(animalLabels).map(([v, l]) => <option key={v} value={v}>{l.replace(/s$/, "")}</option>)}</select>{errors.animal && <p className="error-text">{errors.animal}</p>}</div>
          <div><label htmlFor="pt-breed" className="label">Breed <span className="font-normal text-muted">(optional)</span></label><input id="pt-breed" className="field" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></div>
          <div><label htmlFor="pt-age" className="label">Age range <span className="font-normal text-muted">(optional)</span></label><select id="pt-age" className="field" value={form.ageRange} onChange={(e) => setForm({ ...form, ageRange: e.target.value })}><option value="">Prefer not to say</option><option>Baby (under 1 year)</option><option>Adult (1–7 years)</option><option>Senior (7+ years)</option></select></div>
          <div className="sm:col-span-2"><label htmlFor="pt-diet" className="label">Dietary preferences <span className="font-normal text-muted">(optional)</span></label><input id="pt-diet" className="field" placeholder="e.g. prefers chicken, grain-free" value={form.dietary} onChange={(e) => setForm({ ...form, dietary: e.target.value })} /></div>
          <div className="sm:col-span-2"><label htmlFor="pt-sens" className="label">Product sensitivities <span className="font-normal text-muted">(optional)</span></label><input id="pt-sens" className="field" placeholder="e.g. avoids strong fragrances" value={form.sensitivities} onChange={(e) => setForm({ ...form, sensitivities: e.target.value })} /></div>
          <p className="text-[12px] text-muted sm:col-span-2">Recommendations are product suggestions only and are not veterinary advice. Please consult your vet for health or dietary needs.</p>
          <div className="flex gap-2 sm:col-span-2"><button className="btn-primary">Save profile</button><button type="button" onClick={() => setForm(null)} className="btn-ghost">Cancel</button></div>
        </form>
      )}
      {pets === null ? <div className="h-32 animate-pulse rounded-2xl bg-pale" /> : pets.length === 0 && !form ? (
        <EmptyState icon={<PawPrint className="size-7" />} title="No pets added yet" text="Add your companion to see more relevant products across the store." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {pets.map((p) => (
            <li key={p.id} className="card p-5 text-[14px]">
              <div className="flex items-center justify-between"><p className="text-lg font-bold">{p.name} <span className="text-[13px] font-medium text-muted">· {animalLabels[p.animal]?.replace(/s$/, "")}</span></p>
                <button onClick={() => remove(p)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-pale hover:text-error" aria-label={`Delete ${p.name}'s profile`}><Trash2 className="size-4" /></button></div>
              <dl className="mt-2 space-y-1 text-muted">{p.breed && <div><dt className="inline font-semibold text-ink">Breed: </dt><dd className="inline">{p.breed}</dd></div>}{p.ageRange && <div><dt className="inline font-semibold text-ink">Age: </dt><dd className="inline">{p.ageRange}</dd></div>}{p.dietary && <div><dt className="inline font-semibold text-ink">Diet: </dt><dd className="inline">{p.dietary}</dd></div>}{p.sensitivities && <div><dt className="inline font-semibold text-ink">Sensitivities: </dt><dd className="inline">{p.sensitivities}</dd></div>}</dl>
              <Link href={`/shop?animal=${p.animal}`} className="mt-3 inline-block text-[13px] font-semibold text-slate hover:underline">Shop for {p.name} →</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WishlistView() {
  const { wishlist, hydrated, addToCart, toggleWishlist } = useStore();
  if (!hydrated) return <div className="h-64 animate-pulse rounded-3xl bg-pale" />;
  const items = wishlist.map(getProductById).filter(Boolean) as Product[];
  if (!items.length) return <EmptyState icon={<Heart className="size-7" />} title="Your wishlist is empty" text="Tap the heart on any product to save it for later." action={<Link href="/shop" className="btn-primary">Discover products</Link>} />;
  return (
    <div>
      <p className="mb-4 text-[13px] text-muted">Saved items are not reserved — availability and prices may change.</p>
      <ul className="grid gap-3">
        {items.map((p) => {
          const v = displayVariant(p);
          const stock = stockLabel(totalStock(p));
          const multi = p.variants.length > 1;
          return (
            <li key={p.id} className="card flex flex-wrap items-center gap-4 p-3 sm:flex-nowrap sm:p-4">
              <Link href={`/products/${p.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-[#F3F5F6] sm:size-24"><Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="96px" className={p.images[0].fit === "cover" ? "object-cover" : "object-contain p-1"} /></Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                <p className="text-[14px] font-bold">{multi ? "From " : ""}{formatPrice(v.price)}</p>
                <p className={`text-[12px] font-semibold ${stock.tone === "error" ? "text-error" : stock.tone === "warn" ? "text-warn" : "text-success"}`}>{stock.label}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                {multi ? <Link href={`/products/${p.slug}`} className="btn-primary btn-sm flex-1">Choose options</Link> : (
                  <button disabled={v.stock <= 0} onClick={() => { if (addToCart(p.id, v.sku)) toggleWishlist(p.id); }} className="btn-primary btn-sm flex-1"><ShoppingBag className="size-4" />Move to cart</button>
                )}
                <button onClick={() => toggleWishlist(p.id)} className="btn-ghost btn-sm" aria-label={`Remove ${p.name} from wishlist`}><Trash2 className="size-4" /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BuyAgainButton({ items }: { items: OrderItem[] }) {
  const { addToCart, setCartOpen } = useStore();
  return (
    <button
      className="btn-ghost btn-sm"
      onClick={() => { let n = 0; for (const it of items) { const p = getProductById(it.productId); if (p && addToCart(p.id, it.sku, it.quantity)) n++; } if (n) setCartOpen(true); }}
    >
      <RotateCcw className="size-4" aria-hidden />Buy again
    </button>
  );
}
