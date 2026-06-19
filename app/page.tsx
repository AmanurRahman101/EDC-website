import Link from "next/link";
import { db } from "@/lib/db";
import { Prisma, ProductStatus } from "@prisma/client";
import { addToCartAction } from "./actions/cart";
import SortSelect from "@/components/SortSelect";
import { formatTk } from "@/lib/money";

type SortOption = "newest" | "price-desc" | "price-asc" | "in-stock";

const PAGE_SIZE = 9;

interface SearchParams {
  category?: string;
  sort?: string;
  status?: string;
  q?: string;
  page?: string;
}

function getSortFromParam(sortParam?: string): SortOption {
  if (sortParam === "PRICE_DESCENDING" || sortParam === "price-desc") return "price-desc";
  if (sortParam === "PRICE_ASCENDING" || sortParam === "price-asc") return "price-asc";
  if (sortParam === "IN_STOCK_ONLY" || sortParam === "in-stock") return "in-stock";
  return "newest";
}

function mapCategoryParam(cat?: string) {
  if (!cat || cat === "all" || cat.toLowerCase() === "browse_all") return undefined;
  const lower = cat.toLowerCase();
  if (["knives", "tools", "lights"].includes(lower)) return lower;
  return undefined;
}

export default async function Storefront({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const categorySlug = mapCategoryParam(sp.category);
  const sort = getSortFromParam(sp.sort);
  const query = (sp.q || "").toLowerCase().trim();
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  // Build where clause
  const where: Prisma.ProductWhereInput = {};
  if (categorySlug) {
    const cat = await db.category.findUnique({ where: { slug: categorySlug } });
    if (cat) where.categoryId = cat.id;
  }
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { subtitle: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (sort === "in-stock") {
    where.status = { not: ProductStatus.OUT_OF_STOCK };
  }
  if (sp.status === "limited") {
    where.status = ProductStatus.LIMITED_RUN;
  }

  // Count for header
  const totalCount = await db.product.count({ where });

  // Sorting
  let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = { createdAt: "desc" };
  if (sort === "price-desc") orderBy = { priceCents: "desc" };
  if (sort === "price-asc") orderBy = { priceCents: "asc" };
  if (sort === "in-stock") orderBy = [{ status: "asc" }, { createdAt: "desc" }];

  const products = await db.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      specs: { orderBy: { position: "asc" }, take: 2 },
      category: true,
    },
  });

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // For sidebar active states (simplified)
  const currentCat = categorySlug || "all";

  // Status chip styling
  function statusChip(status: ProductStatus) {
    if (status === ProductStatus.LIMITED_RUN) {
      return "bg-primary text-on-primary";
    }
    if (status === ProductStatus.IN_STOCK) {
      return "bg-surface-tint text-on-primary";
    }
    if (status === ProductStatus.BACKORDERED) {
      return "bg-secondary text-on-primary";
    }
    return "bg-outline text-on-primary";
  }

  const statusLabel = (s: ProductStatus) =>
    s === ProductStatus.LIMITED_RUN ? "LIMITED_RUN" : s === ProductStatus.IN_STOCK ? "IN_STOCK" : s === ProductStatus.BACKORDERED ? "BACKORDERED" : "OUT_OF_STOCK";

  const currentSortValue =
    sort === "price-desc" ? "PRICE_DESCENDING" :
    sort === "price-asc" ? "PRICE_ASCENDING" :
    sort === "in-stock" ? "IN_STOCK_ONLY" :
    "NEWEST_FIRST";

  return (
    <div className="flex min-h-screen">
      {/* TopNavBar (Mobile Only) */}
      <nav className="md:hidden w-full top-0 sticky bg-surface border-b border-secondary z-50 flex justify-between items-center px-margin-mobile py-unit">
        <Link href="/" className="font-display-lg text-headline-lg-mobile uppercase tracking-tighter text-on-surface">MACHINED_EDC</Link>
        <div className="flex gap-4">
          <Link href="/account/wishlist" className="text-on-surface-variant hover:text-primary transition-colors duration-100">
            <span className="material-symbols-outlined" data-icon="favorite_border">favorite_border</span>
          </Link>
          <Link href="/cart" className="text-on-surface-variant hover:text-primary transition-colors duration-100">
            <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
          </Link>
        </div>
      </nav>

      {/* SideNavBar (Desktop) */}
      <aside className="hidden md:flex flex-col gap-unit p-gutter bg-surface-container-low h-screen w-64 left-0 top-0 fixed border-r border-secondary z-40 overflow-auto">
        <div className="mb-8 mt-4">
          <div className="font-headline-sm text-headline-sm text-on-surface">FILTER_LAB</div>
          <div className="font-label-caps text-label-caps text-secondary mt-1">PRECISION_TUNED</div>
        </div>

        <nav className="flex-1 flex flex-col gap-2">
          <Link
            href="/"
            className={`flex items-center gap-3 p-3 font-label-caps text-label-caps border-l-4 transition-all duration-100 ${currentCat === "all" ? "bg-primary text-on-primary border-on-primary" : "text-on-surface-variant hover:bg-surface-container-high border-transparent"}`}
          >
            <span className="material-symbols-outlined" data-icon="grid_view" data-weight="fill" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            BROWSE_ALL
          </Link>

          <Link href="/?sort=newest" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 font-label-caps text-label-caps border-l-4 border-transparent">
            <span className="material-symbols-outlined" data-icon="new_releases">new_releases</span>
            NEW_ARRIVALS
          </Link>

          <Link href="/?status=limited" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 font-label-caps text-label-caps border-l-4 border-transparent">
            <span className="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
            LIMITED_RUNS
          </Link>

          <Link href="/?sort=in-stock" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 font-label-caps text-label-caps border-l-4 border-transparent">
            <span className="material-symbols-outlined" data-icon="architecture">architecture</span>
            TECHNICAL_SPECS
          </Link>
        </nav>

        <div className="mt-auto pt-8 border-t border-secondary">
          <Link href="/" className="w-full py-3 px-4 border border-secondary text-on-background font-label-caps text-label-caps hover:bg-surface-container-highest transition-colors duration-100 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[16px]" data-icon="refresh">refresh</span>
            RESET_FILTERS
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 md:ml-64 w-full max-w-[1440px] mx-auto min-h-screen flex flex-col">
        {/* TopNavBar (Desktop) */}
        <nav className="hidden md:flex w-full top-0 sticky bg-surface border-b border-secondary z-30 justify-between items-center px-margin-desktop py-unit">
          <Link href="/" className="font-display-lg text-display-lg uppercase tracking-tighter text-on-surface">MACHINED_EDC</Link>
          <div className="flex gap-8 items-center">
            <Link href="/?category=knives" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100">KNIVES</Link>
            <Link href="/?category=tools" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100">TOOLS</Link>
            <Link href="/?category=lights" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100">LIGHTS</Link>
            <Link href="/" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100">EDITION_01</Link>
          </div>
          <div className="flex gap-6 items-center">
            {/* Search */}
            <form action="/" method="get" className="relative flex items-center border-b border-secondary pb-1 focus-within:border-primary focus-within:border-b-2 transition-all">
              <span className="material-symbols-outlined text-secondary mr-2" data-icon="search">search</span>
              <input
                name="q"
                defaultValue={query}
                className="bg-transparent border-none focus:ring-0 p-0 font-label-caps text-label-caps text-on-surface w-32 placeholder:text-secondary"
                placeholder="SEARCH_INVENTORY"
              />
            </form>

            <Link href="/account/wishlist" className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined" data-icon="favorite_border">favorite_border</span> WISHLIST
            </Link>
            <Link href="/cart" className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 border border-secondary px-4 py-2 hover:bg-surface-container-highest">
              <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span> CART
            </Link>
          </div>
        </nav>

        {/* Page Content */}
        <div className="px-margin-mobile md:px-margin-desktop py-gutter flex-1">
          {/* New Arrivals Banner */}
          <div className="w-full bg-on-background text-on-primary p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-secondary mb-section-gap relative overflow-hidden group">
            <div className="relative z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps text-primary">DROP_04 LIVE</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-on-primary m-0">TITANIUM ALLOY SERIES</h1>
              <p className="font-spec-data text-spec-data text-tertiary-fixed-dim max-w-xl">
                Machined from Grade 5 Titanium. Ultra-lightweight, corrosion-resistant, and engineered to exact tolerances. Limited serialized production run.
              </p>
            </div>
            <Link
              href="/?sort=newest"
              className="mt-6 md:mt-0 z-10 bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps hover:bg-primary-container transition-colors duration-100 flex items-center gap-2 shrink-0"
            >
              SHOP_COLLECTION <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
            </Link>
          </div>

          {/* Header / Sorting */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-secondary pb-4 mb-8 gap-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">BROWSE_INVENTORY</h2>
              <p className="font-spec-data text-spec-data text-secondary mt-1">{totalCount} ITEMS FOUND</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="font-label-caps text-label-caps text-secondary">SORT_BY:</label>
              <SortSelect currentSort={currentSortValue} />
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="py-16 text-center text-secondary font-spec-data">No products found. Try clearing filters.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {products.map((p) => {
                const img = p.images[0];
                const specs = p.specs;
                const disabled = p.stock <= 0 || p.status === ProductStatus.OUT_OF_STOCK || p.status === ProductStatus.BACKORDERED;

                return (
                  <article key={p.id} className="bg-surface-container-lowest border border-secondary flex flex-col relative group card-active-lock" tabIndex={0}>
                    {/* Status Chip */}
                    <div className={`absolute top-4 left-4 z-10 px-2 py-1 font-label-caps text-label-caps text-on-primary ${statusChip(p.status)}`}>
                      {statusLabel(p.status)}
                    </div>

                    {/* Image Area */}
                    <div className="h-64 md:h-80 w-full bg-surface-container flex items-center justify-center p-8 border-b border-secondary relative overflow-hidden">
                      <Link href={`/products/${p.slug}`} className="absolute inset-0 flex items-center justify-center p-8" aria-label={p.name}>
                        {img ? (
                          <img
                            src={img.url}
                            alt={img.alt || p.name}
                            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 product-image"
                          />
                        ) : (
                          <div className="text-secondary">No image</div>
                        )}
                      </Link>

                      {/* Hover Actions (siblings of the image Link to avoid nested anchors) */}
                      {!disabled && (
                        <div className="absolute inset-0 bg-on-surface/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4 pointer-events-none">
                          <Link
                            href={`/products/${p.slug}`}
                            aria-label="Quick View"
                            className="w-12 h-12 bg-surface border border-secondary flex items-center justify-center hover:border-primary text-on-surface hover:text-primary transition-colors pointer-events-auto"
                          >
                            <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
                          </Link>

                          <form action={addToCartAction} className="pointer-events-auto">
                            <input type="hidden" name="productId" value={p.id} />
                            <button
                              type="submit"
                              aria-label="Add to Cart"
                              className="w-12 h-12 bg-on-background text-on-primary flex items-center justify-center hover:bg-primary transition-colors btn-primary"
                            >
                              <span className="material-symbols-outlined" data-icon="add_shopping_cart">add_shopping_cart</span>
                            </button>
                          </form>
                        </div>
                      )}

                      {disabled && (
                        <div className="absolute inset-0 bg-surface/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center flex-col gap-2 backdrop-blur-sm pointer-events-none">
                          <span className="font-label-caps text-label-caps text-on-surface bg-surface border border-secondary px-4 py-2">
                            {p.status === ProductStatus.BACKORDERED ? "EXPECTED_Q3" : "UNAVAILABLE"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata Area */}
                    <div className="p-4 flex flex-col gap-3 flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                          {p.name} <br /> <span className="text-secondary font-body-md text-sm">{p.subtitle}</span>
                        </h3>
                        <span className="font-spec-data text-spec-data text-on-surface bg-surface-container px-2 py-1">
                          {formatTk(p.priceCents)}
                        </span>
                      </div>
                      <div className="font-spec-data text-[11px] uppercase tracking-widest text-secondary">
                        {p.stock > 0 ? `${p.stock} units available` : "Out of stock"}
                      </div>

                      {/* Spec Table Lite */}
                      <div className="mt-auto pt-4 border-t border-secondary flex flex-col gap-1">
                        {specs.length > 0 ? (
                          specs.map((spec, idx) => (
                            <div key={idx} className={`flex justify-between items-center py-1 ${idx % 2 === 0 ? "bg-surface-container-low" : "bg-transparent"} px-2`}>
                              <span className="font-label-caps text-label-caps text-secondary">{spec.label}</span>
                              <span className="font-spec-data text-spec-data text-on-surface">{spec.value}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-secondary text-xs">No specs</div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-section-gap flex justify-center items-center gap-4">
              {page > 1 ? (
                <Link
                  href={`/?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ""}${sp.sort ? `&sort=${sp.sort}` : ""}${sp.status ? `&status=${sp.status}` : ""}${query ? `&q=${query}` : ""}`}
                  className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
                </Link>
              ) : (
                <span className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface opacity-40">
                  <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
                </span>
              )}

              <span className="font-spec-data text-spec-data text-on-surface border-b border-on-surface pb-1">PAGE_{String(page).padStart(2, "0")}</span>

              {page < totalPages ? (
                <Link
                  href={`/?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ""}${sp.sort ? `&sort=${sp.sort}` : ""}${sp.status ? `&status=${sp.status}` : ""}${query ? `&q=${query}` : ""}`}
                  className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
                </Link>
              ) : (
                <span className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface opacity-40">
                  <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="w-full mt-section-gap border-t border-secondary bg-surface-container-highest">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-gap w-full max-w-[1440px] mx-auto">
            <div className="flex flex-col gap-4 col-span-1 md:col-span-2">
              <div className="font-headline-md text-headline-md text-primary">MACHINED_EDC</div>
              <p className="font-spec-data text-spec-data text-on-surface max-w-sm">©2024 MACHINED_EDC. ENGINEERED FOR LONGEVITY.</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="/terms">TERMS_OF_SERVICE</Link>
              <Link className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="/privacy">PRIVACY_POLICY</Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="/shipping">SHIPPING_LOGISTICS</Link>
              <Link className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="/repair">REPAIR_PROGRAM</Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
