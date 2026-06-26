const fs = require('fs');
let p = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Add imports
p = "import { getProducts } from './actions';\n\n" + p;

// 2. Make Home async and fetch products
p = p.replace(/export default function Home\(\) {/, "export default async function Home() {\n  const products = await getProducts();");

// 3. Replace the grid of articles with the mapped products
const gridStart = '<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">';
const gridEnd = '</div>\n\n<div className="mt-section-gap flex justify-center items-center gap-4">';

// Extract the part to replace
const startIndex = p.indexOf(gridStart) + gridStart.length;
const endIndex = p.indexOf(gridEnd);

const productTemplate = `
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
        <span className="font-spec-data text-spec-data text-on-surface bg-surface-container px-2 py-1">\${product.price.toFixed(2)}</span>
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
`;

p = p.substring(0, startIndex) + '\n' + productTemplate + '\n' + p.substring(endIndex);

// Also fix tabindex to tabIndex
p = p.replace(/tabindex="0"/g, 'tabIndex={0}');

fs.writeFileSync('src/app/page.tsx', p);
console.log('Successfully injected products into page.tsx');
