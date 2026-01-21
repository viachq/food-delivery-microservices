import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/orders': 'Замовлення',
  '/menu': 'Меню',
  '/categories': 'Категорії',
  '/restaurant': 'Ресторан',
  '/reviews': 'Відгуки',
  '/users': 'Користувачі',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">Головна</span>
      </Link>

      {pathnames.map((path, index) => {
        const routePath = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const name = routeNames[routePath] || path;

        return (
          <div key={routePath} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="font-semibold text-gray-900">{name}</span>
            ) : (
              <Link
                to={routePath}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                {name}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}


