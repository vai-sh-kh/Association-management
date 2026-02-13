import { useAuth } from "../../contexts/AuthContext";
import { User, Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <header
      className="w-full h-16 bg-white flex items-center justify-between shrink-0 fixed top-0 left-0 right-0 z-50 border-b border-[#e0e0e0] shadow-sm"
      style={{
        paddingLeft: "max(1rem, env(safe-area-inset-left, 1rem))",
        paddingRight: "max(1rem, env(safe-area-inset-right, 1rem))",
        boxSizing: "border-box",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2.5 -ml-1 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-main hover:bg-surface-gray rounded transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-text-main text-lg md:text-xl font-bold tracking-tight truncate">
          Association
        </h1>
      </div>
      <div
        className="flex items-center gap-2 shrink-0"
        title={user?.email ?? "Profile"}
      >
        <div className="w-9 h-9 bg-primary/10 flex items-center justify-center">
          <User size={20} className="text-primary" />
        </div>
        <span className="text-text-secondary text-sm truncate max-w-[160px] hidden sm:inline">
          {user?.email ?? "User"}
        </span>
      </div>
    </header>
  );
};

export default Header;
