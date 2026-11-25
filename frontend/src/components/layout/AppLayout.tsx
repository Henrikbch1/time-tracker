import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-svh" style={{ background: "var(--bg)" }}>
      <Sidebar />

      <div className="lg:pl-[264px]">
        <TopNavbar />
        <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
