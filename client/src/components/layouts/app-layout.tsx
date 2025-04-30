import React, { useState } from "react";
import Sidebar from "@/components/shared/sidebar";
import Header from "@/components/shared/header";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for mobile */}
      <div
        className={`${
          sidebarOpen ? "fixed inset-0 z-40 w-full md:hidden" : "hidden"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col w-64 bg-white border-r border-zinc-200">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
