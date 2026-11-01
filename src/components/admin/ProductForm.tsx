"use client";

import { useActionState, useRef, useState, startTransition } from "react";
import { saveProduct, type ProductFormState } from "@/app/admin/(panel)/actions";
import { slugify } from "@/lib/format";
import { imageUrl } from "@/lib/products";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/env";
import type { Category, Product } from "@/lib/types";

type Img = { path: string; alt: string };

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return msg ? (
    <p id={`${id}-error`} className="field-error">
      {msg}
    </p>
  ) : null;
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(saveProduct, {});
  const [images, setImages] = useState<Img[]>(product?.images.map((i) => ({ path: i.path, alt: i.alt })) ?? []);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [name, setName] = useState(product?.name ?? "");
  const fileInput = useRef<HTMLInputElement>(null);
  const fe = state.fieldErrors ?? {};

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const supabase = createSupabaseBrowser();
    const list = Array.from(files).slice(0, 12 - images.length);
    setUploading((n) => n + list.length);

    for (const file of list) {
      try {
        if (!ALLOWED.includes(file.type)) throw new Error(`${file.name}: use a JPG, PNG or WebP photo.`);
        if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 5 MB. Please use a smaller photo.`);
        const path = `${crypto.randomUUID()}.${EXT[file.type]}`;
        const { error } = await supabase.storage
          .from(PRODUCT_IMAGES_BUCKET)
          .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });
        if (error) throw new Error(`${file.name}: ${error.message}`);
        setImages((prev) => [...prev, { path, alt: "" }]);
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  function move(index: number, dir: -1 | 1) {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Calling the action directly keeps what was typed if there's an error.
    startTransition(() => formAction(fd));
  }

  const busy = pending || uploading > 0;

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-6" noValidate>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="flex min-w-0 flex-[999_1_480px] flex-col gap-6">
        <section className="admin-card flex flex-col gap-5 p-6">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Details</h2>
          <div>
            <label htmlFor="name" className="field-label">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="field"
              aria-invalid={!!fe.name}
              aria-describedby={fe.name ? "name-error" : undefined}
            />
            <FieldError id="name" msg={fe.name} />
          </div>
          <div>
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={product?.description ?? ""}
              placeholder="Materials, size, how it fits…"
              className="field"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <label htmlFor="category_id" className="field-label">
                Category
              </label>
              <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="field">
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tag" className="field-label">
                Label (optional)
              </label>
              <input
                id="tag"
                name="tag"
                list="tag-suggestions"
                defaultValue={product?.tag ?? ""}
                placeholder="e.g. New, Bestseller"
                maxLength={30}
                className="field"
              />
              <datalist id="tag-suggestions">
                <option value="New" />
                <option value="Bestseller" />
                <option value="Gift set" />
                <option value="Sale" />
                <option value="Limited" />
              </datalist>
            </div>
          </div>
        </section>

        <section className="admin-card flex flex-col gap-5 p-6">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Pricing</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <label htmlFor="price" className="field-label">
                Price (Rs.)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                defaultValue={product?.price ?? ""}
                required
                className="field"
                aria-invalid={!!fe.price}
                aria-describedby={fe.price ? "price-error" : undefined}
              />
              <FieldError id="price" msg={fe.price} />
            </div>
            <div>
              <label htmlFor="sale_price" className="field-label">
                Sale price (Rs., optional)
              </label>
              <input
                id="sale_price"
                name="sale_price"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={product?.sale_price ?? ""}
                placeholder="Leave empty for no sale"
                className="field"
                aria-invalid={!!fe.sale_price}
                aria-describedby={fe.sale_price ? "sale_price-error" : undefined}
              />
              <FieldError id="sale_price" msg={fe.sale_price} />
            </div>
          </div>
          <p className="m-0 text-[13px] text-mauve">
            With a sale price, the shop shows it in pink with the regular price crossed out. Clear it to end the sale.
          </p>
        </section>

        <section className="admin-card flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="m-0 font-serif text-[26px] font-semibold">Photos</h2>
            <span className="text-sm text-mauve">{images.length} / 12 · the first photo is the cover</span>
          </div>

          {images.length > 0 ? (
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 p-0">
              {images.map((img, i) => (
                <li key={img.path} className="flex flex-col gap-2 rounded-xl border border-line p-2">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-blush">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl(img.path)} alt={img.alt} className="h-full w-full object-cover" />
                    {i === 0 ? (
                      <span className="absolute left-2 top-2 rounded-full bg-plum px-2 py-0.5 text-[11px] font-semibold text-cream">
                        Cover
                      </span>
                    ) : null}
                  </div>
                  <label className="sr-only" htmlFor={`alt-${i}`}>
                    Photo {i + 1} description
                  </label>
                  <input
                    id={`alt-${i}`}
                    value={img.alt}
                    onChange={(e) =>
                      setImages((prev) => prev.map((p, j) => (j === i ? { ...p, alt: e.target.value.slice(0, 200) } : p)))
                    }
                    placeholder="Describe photo (optional)"
                    className="field min-h-9 px-2.5 text-[13px]"
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move photo ${i + 1} earlier`}
                      className="btn btn-outline btn-sm min-h-9 flex-1 px-0"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      aria-label={`Move photo ${i + 1} later`}
                      className="btn btn-outline btn-sm min-h-9 flex-1 px-0"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      aria-label={`Remove photo ${i + 1}`}
                      className="btn btn-danger btn-sm min-h-9 flex-1 px-0"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}

          <div>
            <input
              ref={fileInput}
              id="photos"
              type="file"
              accept={ALLOWED.join(",")}
              multiple
              className="sr-only"
              onChange={(e) => onFiles(e.target.files)}
              disabled={images.length >= 12}
            />
            <label
              htmlFor="photos"
              className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-field bg-cream px-4 text-center hover:border-rose ${
                images.length >= 12 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <span className="font-medium">{uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}</span>
              <span className="text-[13px] text-mauve">JPG, PNG or WebP, up to 5 MB each. Square photos look best.</span>
            </label>
            {uploadError ? <p className="field-error">{uploadError}</p> : null}
            {fe.images ? <p className="field-error">{fe.images}</p> : null}
          </div>
          <p className="m-0 text-[13px] text-mauve">Removed photos are deleted when you press Save.</p>
        </section>
      </div>

      <aside className="admin-card flex flex-[1_1_280px] flex-col gap-5 p-6 lg:sticky lg:top-6">
        <h2 className="m-0 font-serif text-[26px] font-semibold">Visibility</h2>
        {[
          { name: "is_active", label: "Show in shop", hint: "Untick to hide without deleting.", def: product?.is_active ?? true },
          { name: "in_stock", label: "In stock", hint: "Untick to show “Sold out”.", def: product?.in_stock ?? true },
          {
            name: "is_featured",
            label: "Feature on homepage",
            hint: "Shown in the big homepage picture.",
            def: product?.is_featured ?? false,
          },
        ].map((c) => (
          <label key={c.name} className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name={c.name}
              defaultChecked={c.def}
              className="mt-0.5 h-5 w-5 flex-none accent-plum"
            />
            <span className="flex flex-col">
              <span className="font-medium">{c.label}</span>
              <span className="text-[13px] text-mauve">{c.hint}</span>
            </span>
          </label>
        ))}

        <div>
          <label htmlFor="slug" className="field-label">
            Web address
          </label>
          <div className="flex items-center gap-1 text-sm text-mauve">
            <span className="flex-none">/product/</span>
            <input
              id="slug"
              name="slug"
              defaultValue={product?.slug ?? ""}
              placeholder={slugify(name) || "auto"}
              className="field min-h-10 px-2.5 text-sm"
              aria-invalid={!!fe.slug}
              aria-describedby={fe.slug ? "slug-error" : undefined}
            />
          </div>
          <FieldError id="slug" msg={fe.slug} />
        </div>
        <div>
          <label htmlFor="sort_order" className="field-label">
            Display order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            step={1}
            defaultValue={product?.sort_order ?? 0}
            className="field min-h-10"
          />
          <p className="m-0 mt-1 text-[13px] text-mauve">Lower numbers show first.</p>
        </div>

        {state.error ? (
          <p role="alert" className="m-0 rounded-xl bg-[#FCEDEF] px-3.5 py-3 text-sm text-danger">
            {state.error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn btn-primary min-h-[52px]">
          {pending ? "Saving…" : uploading > 0 ? "Wait for photos…" : product ? "Save changes" : "Add bracelet"}
        </button>
      </aside>
    </form>
  );
}
