import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Store,
  Star,
  Users,
  LogOut,
  Menu,
  X,
  FolderOpen,
  ChevronDown
} from 'lucide-react';
import Breadcrumbs from './Breadcrumbs';

interface LayoutProps {
  children: ReactNode;
}

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
}

const navigationSections: NavSection[] = [
  {
    title: 'Головне',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Контент',
    items: [
      { name: 'Menu', href: '/menu', icon: UtensilsCrossed },
      { name: 'Categories', href: '/categories', icon: FolderOpen },
    ],
  },
  {
    title: 'Операції',
    items: [
      { name: 'Orders', href: '/orders', icon: ShoppingBag },
      { name: 'Reviews', href: '/reviews', icon: Star },
    ],
  },
  {
    title: 'Налаштування',
    items: [
      { name: 'Restaurant', href: '/restaurant', icon: Store },
      { name: 'Users', href: '/users', icon: Users },
    ],
  },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(navigationSections.map((s) => s.title))
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-6">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    {section.title}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedSections.has(section.title) ? '' : '-rotate-90'
                      }`}
                    />
                  </button>
                  {expandedSections.has(section.title) && (
                    <div className="mt-2 space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                              isActive
                                ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r">
          <div className="flex h-16 items-center px-6 border-b bg-gradient-to-r from-red-600 to-orange-500">
            <h1 className="text-xl font-extrabold text-white">🍕 Admin Panel</h1>
          </div>
          <nav className="flex-1 p-4 space-y-6">
            {navigationSections.map((section) => (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  {section.title}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      expandedSections.has(section.title) ? '' : '-rotate-90'
                    }`}
                  />
                </button>
                {expandedSections.has(section.title) && (
                  <div className="mt-2 space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex flex-1 items-center px-4">
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        </div>
        <main className="p-4 lg:p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}

