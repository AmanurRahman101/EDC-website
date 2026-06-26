"use client";

import { createProduct } from "../actions";

export default function AdminForm() {
  return (
    <form action={createProduct} className="flex flex-col gap-4 max-w-md bg-surface-container-low p-6 rounded-xl border border-outline-variant">
      <h2 className="font-headline-sm text-on-surface">Add New Product</h2>
      
      <div className="flex flex-col gap-1">
        <label className="font-label-caps text-on-surface-variant">Name</label>
        <input name="name" required className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label-caps text-on-surface-variant">Description</label>
        <textarea name="description" required className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none" rows={3} />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-label-caps text-on-surface-variant">Price</label>
          <input name="price" type="number" step="0.01" required className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-label-caps text-on-surface-variant">Stock</label>
          <input name="stock" type="number" required className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-label-caps text-on-surface-variant">Category</label>
          <select name="category" className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none">
            <option value="KNIVES">KNIVES</option>
            <option value="LIGHTS">LIGHTS</option>
            <option value="TOOLS">TOOLS</option>
            <option value="PENS">PENS</option>
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="font-label-caps text-on-surface-variant">Status</label>
          <select name="status" className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none">
            <option value="IN_STOCK">IN_STOCK</option>
            <option value="LIMITED_RUN">LIMITED_RUN</option>
            <option value="BACKORDERED">BACKORDERED</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="font-label-caps text-on-surface-variant">Image URL (Optional)</label>
        <input name="image" placeholder="Leave blank for placeholder" className="p-2 border border-outline rounded bg-surface text-on-surface focus:border-primary outline-none" />
      </div>

      <button type="submit" className="mt-4 bg-primary text-on-primary py-3 rounded-full font-label-caps hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors">
        Create Product
      </button>
    </form>
  );
}
