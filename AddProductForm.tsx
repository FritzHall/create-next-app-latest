"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";

// Payload type that FakeStore API expects
export type ProductPayload = {
  title: string;
  price: number;
  description: string;
  image: string; // base64 string or URL
  category: string;
};

// Response type from FakeStore (simplified)
export type ProductResponse = ProductPayload & { id: number };

// Optional callback lets a parent (e.g., ProductsPage) update its list when a new item is added
export default function AddProductForm({
  onSuccess,
}: {
  onSuccess?: (created: ProductResponse) => void;
}) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  // We'll store a Base64-encoded string in `imageB64` for submission
  const [imageB64, setImageB64] = useState<string>("");
  // For preview, either use Base64 or a temporary object URL
  const [previewSrc, setPreviewSrc] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const allValid =
    title.trim().length > 0 &&
    Number(price) > 0 &&
    description.trim().length > 0 &&
    category.trim().length > 0 &&
    imageB64.trim().length > 0 &&
    !submitting;

  function resetForm() {
    setTitle("");
    setPrice("");
    setDescription("");
    setCategory("");
    setImageB64("");
    setPreviewSrc("");
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file); // produces a data:URI (base64)
    });
  }

  async function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: basic client-side file type check
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    try {
      setError(null);
      const base64 = await fileToBase64(file);
      setImageB64(base64);
      // Use base64 for preview as well
      setPreviewSrc(base64);
    } catch (err: any) {
      setError("Failed to read image file.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload: ProductPayload = {
      title: title.trim(),
      price: Number(price),
      description: description.trim(),
      image: imageB64, // base64 string
      category: category.trim(),
    };

    try {
      const res = await fetch("https://fakestoreapi.com/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status} — ${text}`);
      }

      const data = (await res.json()) as ProductResponse;
      setSuccess("Product created successfully!");
      onSuccess?.(data);
      resetForm();
    } catch (err: any) {
      setError(err?.message ?? "Failed to submit product.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Add New Product</h2>
      <p className="mt-1 text-sm text-gray-600">
        Fill out the form and submit to create a new item in FakeStore API. The image will be encoded as
        Base64 before sending.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="e.g., Classic Cotton T-Shirt"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g., 19.99"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="e.g., men's clothing"
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Brief description of the product"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
            required
          />
          {previewSrc && (
            <div className="mt-3">
              <img
                src={previewSrc}
                alt="Selected preview"
                className="h-40 w-auto rounded-xl border border-gray-200 object-contain"
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!allValid}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Product"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
