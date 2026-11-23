import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { TrackOrderForm } from "@/components/order/TrackOrder";

export const metadata: Metadata = { title: "Track your order", description: "Look up your order status with your order reference and email." };

export default function Page() {
  return (
    <>
      <PageHeader title="Track Your Order" sub="Enter your order reference and the email address used at checkout." crumbs={[{ label: "Home", href: "/" }, { label: "Track order" }]} />
      <div className="container-site py-10"><TrackOrderForm /></div>
    </>
  );
}
