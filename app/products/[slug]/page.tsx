import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { addToCartAction } from "../../actions/cart";
import { formatTk } from "@/lib/money";
import { getCurrentUser } from "@/lib/auth";
import { toggleWishlist } from "../../actions/wishlist";
import { isPurchasable, statusLabel, statusChipClass } from "@/lib/product";

export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      specs: { orderBy: { position: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  const user = await getCurrentUser();
  const userId = user?.id;
  const inWishlist = userId
    ? !!(await db.wishlistItem.findUnique({
        where: { userId_productId: { userId, productId: product.id } },
      }))
    : false;

  async function handleWishlist() {
    "use server";
    const current = await getCurrentUser();
    if (!current?.id) {
      redirect(`/login?redirect=/products/${slug}`);
    }
    await toggleWishlist(product!.id);
    revalidatePath(`/products/${slug}`);
  }

  const isAvailable = isPurchasable(product);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
        <div className="mb-6">
          <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">← BACK TO INVENTORY</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-gutter">
          {/* Image */}
          <div className="bg-surface-container border border-secondary p-8 flex items-center justify-center min-h-[420px]">
            {product.images[0] ? (
              <img
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                className="max-h-[380px] object-contain mix-blend-multiply"
              />
            ) : (
              <div className="text-secondary">No image available</div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className={`self-start mb-3 px-3 py-1 font-label-caps text-label-caps text-on-primary ${statusChipClass(product.status)}`}>
              {statusLabel(product.status)}
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface">{product.name}</h1>
            {product.subtitle && <p className="text-secondary font-body-md mt-1">{product.subtitle}</p>}

            <div className="mt-4 text-3xl font-headline-sm text-on-surface">
              {formatTk(product.priceCents)}
            </div>
            <div className="mt-2 font-spec-data text-[11px] uppercase tracking-widest text-secondary">
              {product.stock > 0 ? `${product.stock} units available` : "Out of stock"}
            </div>

            {product.description && (
              <p className="mt-6 text-on-surface/90 leading-relaxed">{product.description}</p>
            )}

            {/* Specs */}
            {product.specs.length > 0 && (
              <div className="mt-8 border-t border-secondary pt-4">
                <div className="font-label-caps text-label-caps text-secondary mb-3">SPECIFICATIONS</div>
                <div className="grid grid-cols-1 gap-px bg-secondary/20">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="bg-surface flex justify-between px-4 py-2 font-spec-data text-spec-data">
                      <span className="text-secondary">{spec.label}</span>
                      <span className="text-on-surface">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-8 flex flex-col gap-3">
              {isAvailable ? (
                <form action={addToCartAction} className="w-full">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="w-full py-3 bg-on-background text-on-primary font-label-caps text-label-caps hover:bg-primary transition-colors btn-primary flex items-center justify-center gap-2"
                  >
                    ADD TO CART <span className="material-symbols-outlined">add_shopping_cart</span>
                  </button>
                </form>
              ) : (
                <div className="w-full py-3 text-center border border-secondary font-label-caps text-label-caps text-secondary">CURRENTLY UNAVAILABLE</div>
              )}

              <form action={handleWishlist} className="w-full">
                <button
                  type="submit"
                  className="w-full py-3 border border-secondary font-label-caps text-label-caps hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">{inWishlist ? "favorite" : "favorite_border"}</span>
                  {inWishlist ? "REMOVE FROM WISHLIST" : "ADD TO WISHLIST"}
                </button>
              </form>

              <Link href="/" className="text-center py-2 font-label-caps text-label-caps text-secondary hover:text-primary">Continue browsing</Link>
            </div>

            <div className="mt-6 text-xs text-secondary font-spec-data">Category: {product.category.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
