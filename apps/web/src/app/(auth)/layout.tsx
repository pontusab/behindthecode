import { Logo } from "@btc/ui/components/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex justify-center">
          <Logo className="text-lg" />
        </Link>
        <div className="border border-border bg-card p-6 sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
