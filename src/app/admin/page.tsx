import { getProducts } from "../actions";
import AdminForm from "./AdminForm";

export default async function AdminPage() {
  const products = await getProducts();

  return (
    <div className="flex flex-col min-h-screen p-8 bg-background text-on-background w-full">
      <header className="mb-8 border-b border-outline-variant pb-4">
        <h1 className="font-display-lg">Admin Dashboard</h1>
        <p className="text-on-surface-variant mt-2 font-body-lg">Manage products and inventory</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-1/3">
          <AdminForm />
        </aside>

        <main className="w-full lg:w-2/3">
          <h2 className="font-headline-md mb-6">Inventory ({products.length})</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div key={product.id} className="flex gap-4 p-4 border border-outline-variant rounded-xl bg-surface">
                <div className="w-24 h-24 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-headline-sm">{product.name}</h3>
                    <p className="font-label-caps text-primary mt-1">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-spec-data text-on-surface-variant">Stock: {product.stock}</span>
                    <span className="text-xs px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full">
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {products.length === 0 && (
              <p className="text-on-surface-variant italic">No products in inventory yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
