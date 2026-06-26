"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === 'NEWEST_FIRST') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <select 
      className="bg-surface border border-secondary font-spec-data text-spec-data text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary"
      onChange={handleSortChange}
      defaultValue={searchParams.get('sort') || 'NEWEST_FIRST'}
    >
      <option value="NEWEST_FIRST">NEWEST_FIRST</option>
      <option value="PRICE_DESCENDING">PRICE_DESCENDING</option>
      <option value="PRICE_ASCENDING">PRICE_ASCENDING</option>
      <option value="IN_STOCK_ONLY">IN_STOCK_ONLY</option>
    </select>
  );
}
