import Link from "next/link";
import { getCart, updateCartItemAction, removeCartItemAction, checkoutAction, clearCartAction } from "../actions/cart";
import { redirect } from "next/navigation";
import { formatTk } from "@/lib/money";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";
import { ProductStatus } from "@prisma/client";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const { items, totalCents, cartId } = await getCart();
  const user = await getCurrentUser();
  const isLoggedIn = !!user?.id;

  async function handleCheckout(formData: FormData) {
    "use server";
    const result = await checkoutAction(formData);
    if (result?.success && result.orderId) {
      redirect(`/account/orders/${result.orderId}?paid=true`);
    }
    if (result?.error) {
      redirect(`/cart?error=${encodeURIComponent(result.error)}`);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-gutter">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-md text-headline-md text-on-surface">YOUR CART</h1>
        <Link href="/" className="font-label-caps text-label-caps text-secondary hover:text-primary">Continue shopping →</Link>
      </div>

      {!cartId || items.length === 0 ? (
        <div className="border border-secondary p-12 text-center bg-surface">
          <p className="font-spec-data text-spec-data text-secondary">Your cart is empty.</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 border border-secondary hover:bg-surface-container-high font-label-caps text-label-caps">BROWSE INVENTORY</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-gutter">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => {
              const img = item.product.images[0];
              return (
                <div key={item.id} className="flex gap-4 bg-surface border border-secondary p-4">
                  <Link href={`/products/${item.product.slug}`} className="w-24 h-24 flex-shrink-0 bg-surface-container flex items-center justify-center border border-secondary">
                    {img && <img src={img.url} alt="" className="max-h-20 object-contain mix-blend-multiply" />}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <Link href={`/products/${item.product.slug}`} className="font-headline-sm text-headline-sm text-on-surface hover:text-primary">
                        {item.product.name}
                      </Link>
                      <div className="font-spec-data text-spec-data text-on-surface whitespace-nowrap">
                        {formatTk(item.product.priceCents)}
                      </div>
                    </div>

                    <form action={updateCartItemAction} className="mt-3 flex items-center gap-3">
                      <input type="hidden" name="itemId" value={item.id} />
                      <label className="font-label-caps text-label-caps text-secondary">QTY</label>
                      <input
                        type="number"
                        name="qty"
                        defaultValue={item.qty}
                        min={1}
                        max={Math.max(1, item.product.stock)}
                        disabled={item.product.stock <= 0}
                        className="w-16 bg-surface-container-low border border-secondary px-2 py-1 font-spec-data text-spec-data"
                      />
                      <button
                        type="submit"
                        disabled={item.product.stock <= 0}
                        className="text-xs border px-2 py-1 border-secondary hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        UPDATE
                      </button>
                    </form>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-secondary">
                      {item.product.status === ProductStatus.BACKORDERED
                        ? "Backordered"
                        : item.product.stock > 0
                        ? `${item.product.stock} in stock`
                        : "Out of stock"}
                    </div>

                    <form action={removeCartItemAction} className="mt-1">
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="text-xs text-secondary hover:text-error underline">Remove</button>
                    </form>
                  </div>

                  <div className="font-spec-data text-spec-data text-right self-start">
                    {formatTk(item.product.priceCents * item.qty)}
                  </div>
                </div>
              );
            })}

            <form action={clearCartAction}>
              <button type="submit" className="text-xs text-secondary hover:text-error">Clear cart</button>
            </form>
          </div>

          {/* Summary + Checkout */}
          <div className="md:col-span-1">
            <div className="bg-surface border border-secondary p-6 sticky top-4">
              <div className="font-label-caps text-label-caps text-secondary mb-4">CHECKOUT</div>
              {sp.error && (
                <div className="mb-4 text-error text-sm border border-error/30 bg-error-container/10 p-3">
                  {sp.error}
                </div>
              )}

              {isLoggedIn ? (
                <CheckoutForm
                  subtotalCents={totalCents}
                  action={handleCheckout}
                  defaultName={user?.name || ""}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Subtotal</span>
                    <span className="font-headline-sm">{formatTk(totalCents)}</span>
                  </div>
                  <p className="text-sm text-secondary">Please sign in to complete your order.</p>
                  <Link
                    href="/login?redirect=/cart"
                    className="block text-center w-full py-3 bg-on-background text-on-primary font-label-caps text-label-caps hover:bg-primary transition-colors"
                  >
                    SIGN IN TO CHECKOUT
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
