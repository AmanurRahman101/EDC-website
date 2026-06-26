import { getProducts } from './actions';
import SortSelect from './SortSelect';
import { Suspense } from 'react';

export default async function Home(props: { searchParams: Promise<{ category?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category;
  const sort = searchParams?.sort;
  const products = await getProducts(category, sort);
  return (
    <>
      

<nav className="md:hidden w-full top-0 sticky bg-surface border-b border-secondary z-50 flex justify-between items-center px-margin-mobile py-unit">
<a href="/" className="font-display-lg text-headline-lg-mobile uppercase tracking-tighter text-on-surface">MACHINED_EDC</a>
<div className="flex gap-4">
<button className="text-on-surface-variant hover:text-primary transition-colors duration-100"><span className="material-symbols-outlined" data-icon="search">search</span></button>
<button className="text-on-surface-variant hover:text-primary transition-colors duration-100"><span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span></button>
</div>
</nav>

<aside className="hidden md:flex flex-col gap-unit p-gutter bg-surface-container-low h-screen w-64 left-0 top-0 fixed border-r border-secondary z-40">

<div className="mb-8 mt-4">
<div className="font-headline-sm text-headline-sm text-on-surface">FILTER_LAB</div>
<div className="font-label-caps text-label-caps text-secondary mt-1">PRECISION_TUNED</div>
</div>

<nav className="flex-1 flex flex-col gap-2">

<a className="flex items-center gap-3 p-3 bg-primary text-on-primary border-l-4 border-on-primary font-label-caps text-label-caps hover:scale-95 duration-100 transition-transform" href="/">
<span className="material-symbols-outlined" data-icon="grid_view" data-weight="fill" style={{ fontVariationSettings: '"FILL" 1' }}>grid_view</span>
                BROWSE_ALL
            </a>
</nav>

<div className="mt-auto pt-8 border-t border-secondary">
<button className="w-full py-3 px-4 border border-secondary text-on-background font-label-caps text-label-caps hover:bg-surface-container-highest transition-colors duration-100 flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[16px]" data-icon="refresh">refresh</span>
                RESET_FILTERS
            </button>
</div>
</aside>

<main className="flex-1 md:ml-64 w-full max-w-[1440px] mx-auto min-h-screen flex flex-col">

<nav className="hidden md:flex w-full top-0 sticky bg-surface border-b border-secondary z-30 justify-between items-center px-margin-desktop py-unit gap-8">
<a href="/" className="font-display-lg text-display-lg uppercase tracking-tighter text-on-surface shrink-0">MACHINED_EDC</a>
<div className="flex gap-8 items-center flex-1">

<a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100" href="/?category=KNIVES">KNIVES</a>
<a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100" href="/?category=TOOLS">TOOLS</a>
<a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-100" href="/?category=LIGHTS">LIGHTS</a>
</div>
<div className="flex gap-6 items-center">

<div className="relative flex items-center border-b border-secondary pb-1 focus-within:border-primary focus-within:border-b-2 transition-all">
<span className="material-symbols-outlined text-secondary mr-2" data-icon="search">search</span>
<input className="bg-transparent border-none focus:ring-0 p-0 font-label-caps text-label-caps text-on-surface w-32 placeholder:text-secondary" placeholder="SEARCH_INVENTORY" type="text" />
</div>

<button className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2">
<span className="material-symbols-outlined" data-icon="favorite_border">favorite_border</span> WISHLIST
                </button>
<button className="font-label-caps text-label-caps text-on-surface hover:text-primary transition-colors flex items-center gap-2 border border-secondary px-4 py-2 hover:bg-surface-container-highest">
<span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span> CART
                </button>
</div>
</nav>

<div className="px-margin-mobile md:px-margin-desktop py-gutter flex-1">

<div className="w-full bg-on-background text-on-primary p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-secondary mb-section-gap relative overflow-hidden group">
<div className="relative z-10 flex flex-col gap-2">
<div className="flex items-center gap-2">
<span></span>
<span className="font-label-caps text-label-caps text-primary">DROP_04 LIVE</span>
</div>
<h1 className="font-headline-md text-headline-md text-on-primary m-0">TITANIUM ALLOY SERIES</h1>
<p className="font-spec-data text-spec-data text-tertiary-fixed-dim max-w-xl">Machined from Grade 5 Titanium. Ultra-lightweight, corrosion-resistant, and engineered to exact tolerances. Limited serialized production run.</p>
</div>
<button className="mt-6 md:mt-0 z-10 bg-primary text-on-primary px-6 py-3 font-label-caps text-label-caps hover:bg-primary-container transition-colors duration-100 flex items-center gap-2 shrink-0">
                    SHOP_COLLECTION <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</button>

<div></div>
</div>

<div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-secondary pb-4 mb-8 gap-4">
<div>
<h2 className="font-headline-sm text-headline-sm text-on-surface">BROWSE_INVENTORY</h2>
<p className="font-spec-data text-spec-data text-secondary mt-1">42 ITEMS FOUND</p>
</div>
<div className="flex items-center gap-4">
<label className="font-label-caps text-label-caps text-secondary">SORT_BY:</label>
<Suspense fallback={<div className="w-32 h-10 bg-surface border border-secondary animate-pulse" />}>
  <SortSelect />
</Suspense>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">

{products.map(product => (
  <article key={product.id} className="bg-surface-container-lowest border border-secondary flex flex-col relative group card-active-lock" tabIndex={0}>
    
    <div className={"absolute top-4 left-4 z-10 px-2 py-1 font-label-caps text-label-caps " + (product.status === "IN_STOCK" ? "bg-surface-tint text-on-primary" : product.status === "LIMITED_RUN" ? "bg-primary text-on-primary" : "bg-secondary text-on-primary")}>
      {product.status}
    </div>

    <div className="h-64 md:h-80 w-full bg-surface-container flex items-center justify-center p-8 border-b border-secondary relative overflow-hidden">
      <img alt={product.name} className={"max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 " + (product.status === "BACKORDERED" ? "opacity-70" : "")} src={product.image} />

      <div className="absolute inset-0 bg-on-surface/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-4">
        <button aria-label="Quick View" className="w-12 h-12 bg-surface border border-secondary flex items-center justify-center hover:border-primary text-on-surface hover:text-primary transition-colors">
          <span className="material-symbols-outlined" data-icon="visibility">visibility</span>
        </button>
        <button aria-label="Add to Cart" className="w-12 h-12 bg-on-background text-on-primary flex items-center justify-center hover:bg-primary transition-colors btn-primary">
          <span className="material-symbols-outlined" data-icon="add_shopping_cart">add_shopping_cart</span>
        </button>
      </div>
    </div>

    <div className={"p-4 flex flex-col gap-3 flex-1 " + (product.status === "BACKORDERED" ? "opacity-70" : "")}>
      <div className="flex justify-between items-start">
        <h3 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{product.name}</h3>
        <span className="font-spec-data text-spec-data text-on-surface bg-surface-container px-2 py-1">${product.price.toFixed(2)}</span>
      </div>

      <div className="mt-auto pt-4 border-t border-secondary flex flex-col gap-1">
        <div className="flex justify-between items-center py-1 bg-surface-container-low px-2">
          <span className="font-label-caps text-label-caps text-secondary">STOCK</span>
          <span className="font-spec-data text-spec-data text-on-surface">{product.stock}</span>
        </div>
        <div className="flex justify-between items-center py-1 bg-transparent px-2">
          <span className="font-label-caps text-label-caps text-secondary">CATEGORY</span>
          <span className="font-spec-data text-spec-data text-on-surface">{product.category}</span>
        </div>
      </div>
    </div>
  </article>
))}

</div>

<div className="mt-section-gap flex justify-center items-center gap-4">
<button className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled="">
<span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<span className="font-spec-data text-spec-data text-on-surface border-b border-on-surface pb-1">PAGE_01</span>
<button className="w-10 h-10 border border-secondary flex items-center justify-center text-on-surface hover:border-primary hover:text-primary transition-colors">
<span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>

<footer className="w-full mt-section-gap border-t border-secondary bg-surface-container-highest">
<div className="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop py-section-gap w-full max-w-[1440px] mx-auto">

<div className="flex flex-col gap-4 col-span-1 md:col-span-2">
<div className="font-headline-md text-headline-md text-primary">MACHINED_EDC</div>
<p className="font-spec-data text-spec-data text-on-surface max-w-sm">
                        ©2024 MACHINED_EDC. ENGINEERED FOR LONGEVITY.
                    </p>
</div>

<div className="flex flex-col gap-2">
<a className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="#">TERMS_OF_SERVICE</a>
<a className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="#">PRIVACY_POLICY</a>
</div>
<div className="flex flex-col gap-2">
<a className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="#">SHIPPING_LOGISTICS</a>
<a className="font-spec-data text-spec-data text-on-surface-variant hover:text-primary transition-all duration-100 uppercase tracking-wider" href="#">REPAIR_PROGRAM</a>
</div>
</div>
</footer>
</main>

    </>
  );
}
