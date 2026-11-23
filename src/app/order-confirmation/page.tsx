import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/order/TrackOrder";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  return <div className="container-site py-10"><OrderConfirmation reference={ref ?? ""} /></div>;
}
