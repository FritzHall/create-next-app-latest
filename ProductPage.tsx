"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { TdHTMLAttributes, ThHTMLAttributes, ReactNode } from "react";
import AddProductForm from "./AddProductForm";
type Product = {
  id: number;
  title: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating?: {
    rate: number;
    count: number; // FakeStore provides `count` (we'll treat it as stock qty)
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="p-6 text-sm text-gray-500">Loading products…</p>;
  if (error)
    return (
      <div className="p-6 text-red-600">
        <p className="font-semibold">Could not load products.</p>
        <p className="text-sm">{error}</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-10">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Assignment IV – Products</h1>
          <p className="text-sm text-gray-500">Table view and card view using FakeStore API</p>
        </div>
      </header>
      <AddProductForm
        onSuccess={(created) => {
      // Add the new product to the top of the existing list
          setProducts((prev) => [
            { ...created, rating: { rate: 0, count: 0 } },
            ...prev,
          ]);
        }}
      />

      {/* ===== TABLE VIEW ===== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Product Table</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <Th>ID</Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-center">Rating</Th>
                <Th className="text-center">Stock</Th>
                <Th>Image</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100/60">
                  <Td className="w-16 text-center font-medium">{p.id}</Td>
                  <Td className="max-w-[30ch] truncate" title={p.title}>
                    {p.title}
                  </Td>
                  <Td className="capitalize">{p.category}</Td>
                  <Td className="text-right">${p.price.toFixed(2)}</Td>
                  <Td className="text-center">{p.rating?.rate?.toFixed(1) ?? "-"}</Td>
                  {/* FakeStore doesn't provide stock; we use rating.count as a proxy qty */}
                  <Td className="text-center">{p.rating?.count ?? "-"}</Td>
                  <Td>
                    <div className="py-1">
                      <Image
                        src={p.image}
                        alt={p.title}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-lg object-contain ring-1 ring-gray-200 bg-white"
                      />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== CARD GRID ===== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Product Cards</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <article
              key={p.id}
              className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-500">{p.category}</span>
                <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                  #{p.id}
                </span>
              </div>

              <div className="my-3 flex h-40 w-full items-center justify-center">
                <Image
                  src={p.image}
                  alt={p.title}
                  width={256}
                  height={256}
                  className="max-h-40 w-auto object-contain drop-shadow-sm"
                />
              </div>

              <h3 className="line-clamp-2 h-12 text-sm font-medium leading-snug">{p.title}</h3>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-base font-semibold">${p.price.toFixed(2)}</p>
                <div className="text-xs text-gray-600">
                  <span className="font-semibold">{p.rating?.rate?.toFixed(1) ?? "-"}</span>
                  <span className="ml-1">/ 5</span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">Stock: {p.rating?.count ?? "-"}</div>

              <button
                className="mt-4 w-full rounded-xl bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                type="button"
              >
                View
              </button>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
}

function Th({ children, className = "", ...rest }: ThProps) {
return (
<th className={`px-3 py-2 text-xs font-semibold text-gray-700 ${className}`} {...rest}>
{children}
</th>
);
}


type ThProps = ThHTMLAttributes<HTMLTableCellElement> & { children: ReactNode };


function Td({ children, className = "", ...rest }: TdProps) {
return (
<td className={`px-3 py-2 align-middle text-gray-800 ${className}`} {...rest}>
{children}
</td>
);
}


type TdProps = TdHTMLAttributes<HTMLTableCellElement> & { children: ReactNode };