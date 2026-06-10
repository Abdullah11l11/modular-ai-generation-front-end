import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] font-sans">
      <Navbar />
      <main
        className="mx-auto px-(--space-page-x) py-6"
        style={{ maxWidth: "var(--container-main)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
