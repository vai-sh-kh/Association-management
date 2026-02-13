import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Users, IdCard, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Members", icon: Users, href: "/members" },
  { name: "ID Studio", icon: IdCard, href: "/id-card-studio" },
];

const SIDEBAR_TOP = 64; // h-16 header height

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    toast.success("Signed out successfully");
  };

  return (
    <>
      {/* Backdrop: visible on mobile when sidebar is open */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`w-60 bg-white flex flex-col fixed left-0 z-40 transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ top: SIDEBAR_TOP, bottom: 0 }}
      >
        {/* Navigation */}
        <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 min-h-[44px] transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-surface-gray hover:text-text-main"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                <span
                  className={`text-[15px] ${isActive ? "font-semibold" : "font-medium"}`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 bg-white border-t border-[#e0e0e0]">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full min-h-[44px] text-left text-text-secondary hover:bg-surface-gray hover:text-text-main text-[15px] font-medium transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
