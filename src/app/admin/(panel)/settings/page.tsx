import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { Notice, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin";
import { normalizeSettings } from "@/lib/products";
import type { Category } from "@/lib/types";
import { addCategory, deleteCategory, saveSettings } from "../actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const [{ data: settingsRow }, { data: catRows }, { data: usage }] = await Promise.all([
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("categories").select("id, name, slug, sort_order").order("sort_order"),
    supabase.from("products").select("category_id"),
  ]);
  const s = normalizeSettings(settingsRow);
  const categories = (catRows ?? []) as Category[];
  const counts = new Map<string, number>();
  for (const r of (usage ?? []) as { category_id: string | null }[]) {
    if (r.category_id) counts.set(r.category_id, (counts.get(r.category_id) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader title="Settings" />
      {sp.saved ? <Notice>Saved. Changes are live in the shop.</Notice> : null}
      {sp.error ? <Notice tone="error">{sp.error}</Notice> : null}

      <div className="flex flex-wrap items-start gap-6">
        <form action={saveSettings} className="admin-card flex min-w-0 flex-[999_1_480px] flex-col gap-5 p-6">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Store</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <label htmlFor="delivery_fee" className="field-label">
                Delivery fee (Rs.)
              </label>
              <input
                id="delivery_fee"
                name="delivery_fee"
                type="number"
                min={0}
                step={1}
                defaultValue={s.delivery_fee}
                className="field"
              />
            </div>
            <div>
              <label htmlFor="free_delivery_threshold" className="field-label">
                Free delivery from (Rs.)
              </label>
              <input
                id="free_delivery_threshold"
                name="free_delivery_threshold"
                type="number"
                min={0}
                step={1}
                defaultValue={s.free_delivery_threshold ?? ""}
                placeholder="Empty = never free"
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="announcement" className="field-label">
              Announcement bar
            </label>
            <input
              id="announcement"
              name="announcement"
              maxLength={160}
              defaultValue={s.announcement}
              placeholder="Shown at the very top of the shop. Leave empty to hide."
              className="field"
            />
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            <div>
              <label htmlFor="whatsapp_number" className="field-label">
                Your WhatsApp number
              </label>
              <input
                id="whatsapp_number"
                name="whatsapp_number"
                type="tel"
                defaultValue={s.whatsapp_number}
                placeholder="0300 1234567"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="contact_email" className="field-label">
                Contact email
              </label>
              <input
                id="contact_email"
                name="contact_email"
                type="email"
                defaultValue={s.contact_email}
                className="field"
              />
            </div>
          </div>
          <div>
            <label htmlFor="instagram_url" className="field-label">
              Instagram link
            </label>
            <input
              id="instagram_url"
              name="instagram_url"
              type="url"
              defaultValue={s.instagram_url}
              placeholder="https://instagram.com/yourpage"
              className="field"
            />
          </div>
          <button type="submit" className="btn btn-primary self-start">
            Save settings
          </button>
        </form>

        <section id="categories" className="admin-card flex flex-[1_1_300px] scroll-mt-6 flex-col gap-4 p-6">
          <h2 className="m-0 font-serif text-[26px] font-semibold">Categories</h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
                <span>
                  {c.name} <span className="text-sm text-mauve">· {counts.get(c.id) ?? 0}</span>
                </span>
                <form action={deleteCategory}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit
                    message={`Delete the "${c.name}" category? Its bracelets stay in the shop without a category.`}
                    className="min-h-9 cursor-pointer border-0 bg-transparent px-1 text-sm text-danger underline underline-offset-[3px]"
                  >
                    Delete
                  </ConfirmSubmit>
                </form>
              </li>
            ))}
            {categories.length === 0 ? <li className="py-2 text-mauve">No categories yet.</li> : null}
          </ul>
          <form action={addCategory} className="flex flex-col gap-2">
            <label htmlFor="new-category" className="field-label">
              New category
            </label>
            <div className="flex gap-2">
              <input id="new-category" name="name" required maxLength={40} className="field min-h-11" />
              <button type="submit" className="btn btn-outline btn-sm min-h-11 flex-none">
                Add
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
