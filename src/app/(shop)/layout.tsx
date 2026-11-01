import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <Header announcement={settings.announcement} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </div>
  );
}
