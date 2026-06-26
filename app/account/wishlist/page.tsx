import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toggleWishlist } from "../../actions/wishlist";
import { formatTk } from "@/lib/money";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return <div className="text-secondary">Please sign in to view your wishlist.</div>;
  }
  const userId = user.id;

  const items = await db.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: { take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="font-headline-sm mb-4">Wishlist</h2>

      {items.length === 0 && <p className="text-secondary">No saved items yet.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
        {items.map(({ product }) => (
          <div key={product.id} className="bg-surface border border-secondary p-4 flex flex-col">
            <Link href={`/products/${product.slug}`} className="block h-48 bg-surface-container flex items-center justify-center mb-4">
              {product.images[0] && <img src={product.images[0].url} alt="" className="max-h-40 object-contain mix-blend-multiply" />}
            </Link>

            <div className="flex-1">
              <div className="font-headline-sm">{product.name}</div>
              <div className="text-sm text-secondary">{product.subtitle}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="font-spec-data">{formatTk(product.priceCents)}</span>

              <form action={async () => { "use server"; await toggleWishlist(product.id); }}>
                <button className="text-xs border px-3 py-1 border-secondary hover:bg-surface-container-high">REMOVE</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
