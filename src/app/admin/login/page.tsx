import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import { signOut } from "./actions";

export const metadata: Metadata = { title: "Admin login", robots: { index: false } };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-blush px-6 py-12">
      <div className="w-full max-w-[420px] rounded-3xl bg-cream p-9">
        <p className="m-0 font-serif text-[44px] font-semibold italic leading-none">Suffah</p>
        <p className="eyebrow mb-6 mt-2">Admin</p>
        {denied ? (
          <div className="flex flex-col gap-4">
            <p role="alert" className="m-0 rounded-xl bg-[#FCEDEF] px-3.5 py-3 text-sm text-danger">
              This account doesn&apos;t have admin access. Ask the store owner to add you, then sign in again.
            </p>
            <form action={signOut}>
              <button type="submit" className="btn btn-outline w-full">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}
