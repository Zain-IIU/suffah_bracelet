import type { Metadata } from "next";
import { BagView } from "@/components/shop/BagView";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Your bag" };

export default async function BagPage() {
  const settings = await getSettings();
  return <BagView settings={settings} />;
}
