import { WishlistView } from "@/components/account/AccountPanels";
export default function Page() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold text-slate">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
