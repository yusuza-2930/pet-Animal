import Image from "next/image";
import { Check, Package } from "lucide-react";
import { formatPrice } from "@/lib/catalog";
import type { OrderEvent, OrderItem, ShippingAddress } from "@/db/schema";

export type OrderView = {
  reference: string; email: string; items: OrderItem[]; shippingAddress: ShippingAddress; shippingMethod: string; paymentMethod: string; paymentStatus: string;
  couponCode: string | null; subtotal: number; discount: number; shipping: number; tax: number; total: number; status: string; events: OrderEvent[];
  trackingNumber: string | null; carrier: string | null; createdAt: string | Date;
};

const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "processing", label: "Processing" },
  { key: "dispatched", label: "Dispatched" },
  { key: "in_transit", label: "In transit" },
  { key: "delivered", label: "Delivered" },
];

export function OrderTimeline({ status, events }: { status: string; events: OrderEvent[] }) {
  if (status === "cancelled") return <p className="rounded-xl bg-error/10 p-3 text-sm font-semibold text-error">This order was cancelled.</p>;
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2" aria-label="Order status">
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const ev = events.find((e) => e.status === s.key);
        return (
          <li key={s.key} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2" aria-current={i === idx ? "step" : undefined}>
            <div className="flex items-center sm:w-full">
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${done ? "bg-success text-white" : "border-2 border-line bg-white text-muted"}`}>{done ? <Check className="size-4" aria-hidden /> : <span className="text-[12px] font-bold">{i + 1}</span>}</span>
              {i < STEPS.length - 1 && <span className={`ml-2 hidden h-0.5 flex-1 rounded sm:block ${i < idx ? "bg-success" : "bg-line"}`} aria-hidden />}
            </div>
            <div>
              <p className={`text-[13px] font-semibold ${done ? "text-ink" : "text-muted"}`}>{s.label}</p>
              {ev && <p className="text-[12px] text-muted">{new Date(ev.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetails({ order }: { order: OrderView }) {
  const a = order.shippingAddress;
  return (
    <div className="space-y-6">
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold tracking-wide text-muted uppercase">Order</p>
            <p className="font-display text-xl font-extrabold">{order.reference}</p>
          </div>
          <p className="text-[13px] text-muted">Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <OrderTimeline status={order.status} events={order.events} />
        {order.trackingNumber ? (
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-pale p-3 text-[14px]"><Package className="size-4" aria-hidden />{order.carrier ?? "Carrier"} tracking number: <strong>{order.trackingNumber}</strong></p>
        ) : (
          <p className="mt-5 text-[13px] text-muted">A tracking number will appear here once your order has been dispatched.</p>
        )}
      </div>
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div className="card p-5 sm:p-6">
          <h3 className="mb-3 font-bold">Items</h3>
          <ul className="divide-y divide-line">
            {order.items.map((it) => (
              <li key={it.sku} className="flex items-center gap-3 py-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-[#F3F5F6]"><Image src={it.image} alt="" fill sizes="64px" className="object-cover" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold">{it.name}</p>
                  <p className="text-[12px] text-muted">{Object.entries(it.options).map(([k, v]) => `${k}: ${v}`).join(" · ") || "Standard"} · Qty {it.quantity}</p>
                </div>
                <p className="text-[14px] font-bold">{formatPrice(it.price * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-success"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd>−{formatPrice(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping ? formatPrice(order.shipping) : "Free"}</dd></div>
            <div className="flex justify-between pt-1 text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </div>
        <div className="card space-y-4 p-5 text-[14px] sm:p-6">
          <div><h3 className="font-bold">Delivery address</h3><p className="mt-1 text-muted">{a.fullName}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state} {a.postalCode}<br />{a.phone}</p></div>
          <div><h3 className="font-bold">Delivery method</h3><p className="mt-1 text-muted">{order.shippingMethod}</p></div>
          <div><h3 className="font-bold">Payment</h3><p className="mt-1 text-muted">{order.paymentMethod} · {order.paymentStatus === "pending" ? "Payable on delivery" : order.paymentStatus}</p></div>
        </div>
      </div>
    </div>
  );
}
