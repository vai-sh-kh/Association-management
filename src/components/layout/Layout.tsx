import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 240; // w-60 = 15rem = 240px
const HEADER_HEIGHT = 64; // h-16

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!isDesktop && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main
        className="flex-1 flex flex-col p-4 md:p-8 gap-6 overflow-x-hidden bg-background-light md:ml-60"
        style={{ paddingTop: HEADER_HEIGHT + 32 }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
export { SIDEBAR_WIDTH, HEADER_HEIGHT };
