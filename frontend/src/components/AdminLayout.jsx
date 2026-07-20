import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconDoc,
  IconHome,
  IconLogout,
  IconMenu,
  IconTable,
  IconUserPlus,
} from './icons.jsx';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: IconHome },
  { to: '/admin/intern-forms', label: 'Data Magang', icon: IconTable },
  { to: '/admin/reports', label: 'Laporan Magang', icon: IconDoc },
  { to: '/admin/create-user', label: 'Tambah User', icon: IconUserPlus },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false); // drawer mobile
  const [collapsed, setCollapsed] = useState(false); // sidebar desktop

  // Tutup drawer mobile otomatis tiap kali pindah halaman
  useEffect(() => setOpen(false), [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Topbar mobile */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-ink text-paper px-4 h-14 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="p-2 -ml-2 rounded-lg hover:bg-white/10 active:bg-white/15"
        >
          <IconMenu />
        </button>
        <p className="font-display font-bold tracking-tight">BID TIK</p>
        <div className="w-9" />
      </header>

      {/* Overlay saat drawer terbuka (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[1px] md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Tombol kecil untuk membuka kembali sidebar saat ditutup (desktop) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Buka sidebar"
          className="hidden md:flex fixed top-4 left-4 z-20 items-center justify-center w-9 h-9 rounded-full bg-ink text-paper shadow-md hover:bg-ink/90 transition-colors"
        >
          <IconChevronRight />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 shrink-0 bg-ink text-paper
        transform transition-all duration-200 ease-out overflow-hidden
        md:static md:z-auto md:translate-x-0
        ${open ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
        ${collapsed ? 'md:w-0' : 'md:w-64'}`}
      >
        {/* Lebar konten dikunci supaya tidak "menyusut" aneh saat aside di-animasikan */}
        <div className="w-72 md:w-64 h-full flex flex-col">
          <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="font-display font-extrabold text-lg tracking-tight">BID TIK</p>
              <p className="text-xs text-paper/50 mt-0.5">Panel Administrator</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Tutup sidebar"
                className="hidden md:inline-flex p-1.5 -mr-1.5 rounded-lg hover:bg-white/10"
              >
                <IconChevronLeft />
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup menu"
                className="md:hidden p-1.5 -mr-1.5 rounded-lg hover:bg-white/10"
              >
                <IconClose />
              </button>
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin/intern-forms'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-signal text-white' : 'text-paper/70 hover:bg-white/5 hover:text-paper'
                  }`
                }
              >
                <l.icon className="shrink-0" />
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-4 py-4 border-t border-white/10">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-xs text-paper/40 truncate mb-3">{user?.email}</p>
            <button
              onClick={handleLogout}
              className="btn btn-ghost w-full !border-white/20 !text-paper hover:!bg-white/10 text-xs gap-2"
            >
              <IconLogout className="!w-4 !h-4" />
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
