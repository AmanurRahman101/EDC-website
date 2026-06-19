'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      name="sort"
      value={currentSort}
      className="bg-surface border border-secondary font-spec-data text-spec-data text-on-surface py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary"
      onChange={handleChange}
    >
      <option value="NEWEST_FIRST">NEWEST_FIRST</option>
      <option value="PRICE_DESCENDING">PRICE_DESCENDING</option>
      <option value="PRICE_ASCENDING">PRICE_ASCENDING</option>
      <option value="IN_STOCK_ONLY">IN_STOCK_ONLY</option>
    </select>
  );
}
