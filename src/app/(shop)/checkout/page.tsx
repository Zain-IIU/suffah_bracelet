import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutForm settings={settings} />;
}
