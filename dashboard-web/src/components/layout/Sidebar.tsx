import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Iconos (deberás instalar react-icons o similar)
// import { FiHome, FiUsers, FiShoppingBag, FiTruck, FiCreditCard, FiBarChart2, FiSettings } from 'react-icons/fi';

type SidebarItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems: SidebarItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: <div className="w-5 h-5">🏠</div>,
    },
    {
      name: 'Restaurantes',
      href: '/dashboard/restaurants',
      icon: <div className="w-5 h-5">🍔</div>,
    },
    {
      name: 'Pedidos',
      href: '/dashboard/orders',
      icon: <div className="w-5 h-5">🛒</div>,
    },
    {
      name: 'Entregas',
      href: '/dashboard/deliveries',
      icon: <div className="w-5 h-5">🚚</div>,
    },
    {
      name: 'Pagos',
      href: '/dashboard/payments',
      icon: <div className="w-5 h-5">💳</div>,
    },
    {
      name: 'Analíticas',
      href: '/dashboard/analytics',
      icon: <div className="w-5 h-5">📊</div>,
    },
    {
      name: 'Configuración',
      href: '/dashboard/settings',
      icon: <div className="w-5 h-5">⚙️</div>,
    },
  ];

  return (
    <aside
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="p-4 flex items-center justify-between">
            {!collapsed && (
              <Link href="/dashboard" className="text-xl font-bold text-primary-700">
                DysaEats
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {collapsed ? '→' : '←'}
            </button>
          </div>

          {/* Navegación */}
          <nav className="mt-6">
            <ul className="space-y-2 px-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center p-3 rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                      collapsed ? 'justify-center' : 'justify-start'
                    )}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Perfil de usuario */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div
            className={cn(
              'flex items-center p-2 rounded-md',
              collapsed ? 'justify-center' : 'justify-start'
            )}
          >
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
              U
            </div>
            {!collapsed && (
              <div className="ml-3 truncate">
                <div className="text-sm font-medium">Usuario</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}