import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-pitch-50 dark:bg-navy-950">
      <Navbar />

      <main className="pt-5 pb-8">
        <Outlet />
      </main>
    </div>
  );
}
