import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/misc";
import { WishlistView } from "@/components/account/AccountPanels";
import { Recommended } from "@/components/home/Recommended";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default function Page() {
  return (
    <>
      <PageHeader title="Your Wishlist" sub="Saved on this device. Sign in to keep it in sync across devices." crumbs={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
      <div className="container-site py-10">
        <WishlistView />
        <div className="mt-20"><Recommended /></div>
      </div>
    </>
  );
}
