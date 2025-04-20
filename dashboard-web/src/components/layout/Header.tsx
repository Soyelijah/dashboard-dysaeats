import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-4 py-2">
      {/* Barra de búsqueda */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">🔍</span>
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Buscar..."
          />
        </div>
      </div>

      {/* Acciones del usuario */}
      <div className="flex items-center space-x-4">
        {/* Selector de temas */}
        <div className="relative">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <span>🔔</span>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">Notificaciones</h3>
              </div>
              <div className="p-2 max-h-96 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                  >
                    <div className="text-sm font-medium">Nuevo pedido #{i}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Hace {i} minutos
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/notifications"
                  className="block text-center text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                >
                  Ver todas las notificaciones
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Perfil de usuario */}
        <div className="relative">
          <button className="flex items-center space-x-2 focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700">
              U
            </div>
            <span className="hidden md:inline text-sm font-medium">Usuario</span>
          </button>
        </div>
      </div>
    </header>
  );
}