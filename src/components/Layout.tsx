import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, Home, LogOut } from 'lucide-react';
import { logout } from '../services/api';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <NavLink to="/" className="flex items-center gap-2">
          <ClipboardList size={24} />
          <span className="font-semibold text-lg">RICS Survey</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-sm text-gray-300 hover:text-white min-h-[48px] px-3"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`
          }
        >
          <Home size={20} />
          <span>Surveys</span>
        </NavLink>
        <NavLink
          to="/template"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-3 text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`
          }
        >
          <ClipboardList size={20} />
          <span>Template</span>
        </NavLink>
      </nav>
    </div>
  );
}
