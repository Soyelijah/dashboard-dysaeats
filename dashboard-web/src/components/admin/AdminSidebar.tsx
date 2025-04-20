import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  X,
  Utensils,
  CookingPot,
  Package,
  Clock,
  Truck,
  BarChart3
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    restaurants: true,
    users: false,
    orders: false,
  });

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const isActive = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:min-h-screen`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <Link href="/es/admin" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">DysaEats</span>
            </Link>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Sidebar Menu */}
          <nav className="flex-1 py-4 px-2 overflow-y-auto">
            <ul className="space-y-1">
              {/* Dashboard */}
              <li>
                <Link 
                  href="/es/admin" 
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/es/admin') && !isActive('/es/admin/restaurants') && !isActive('/es/admin/users') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="h-5 w-5 mr-3" />
                  Dashboard
                </Link>
              </li>
              
              {/* Restaurants Menu */}
              <li>
                <button 
                  onClick={() => toggleMenu('restaurants')}
                  className={`flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/es/admin/restaurants') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Utensils className="h-5 w-5 mr-3" />
                    Restaurantes
                  </div>
                  {expandedMenus.restaurants ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedMenus.restaurants && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link 
                        href="/es/admin/restaurants" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/restaurants') && !isActive('/es/admin/restaurants/new')
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Lista
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/restaurants/new" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/restaurants/new') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Nuevo Restaurante
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/menu-categories" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/menu-categories') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Categorías
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/menu-items" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/menu-items') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Elementos de Menú
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Users Menu */}
              <li>
                <button 
                  onClick={() => toggleMenu('users')}
                  className={`flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/es/admin/users') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3" />
                    Usuarios
                  </div>
                  {expandedMenus.users ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedMenus.users && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link 
                        href="/es/admin/users" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/users') && !isActive('/es/admin/users/new')
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Lista
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/users/new" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/users/new') 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Nuevo Usuario
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Orders Menu */}
              <li>
                <button 
                  onClick={() => toggleMenu('orders')}
                  className={`flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/es/admin/orders') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-3" />
                    Pedidos
                  </div>
                  {expandedMenus.orders ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                
                {expandedMenus.orders && (
                  <ul className="pl-10 mt-1 space-y-1">
                    <li>
                      <Link 
                        href="/es/admin/orders/pending" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/orders/pending')
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Pendientes
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/orders/processing" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/orders/processing')
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        En Proceso
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href="/es/admin/orders/delivered" 
                        className={`block px-2 py-1.5 text-sm rounded-md ${
                          isActive('/es/admin/orders/delivered')
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Entregados
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              
              {/* Configuration */}
              <li>
                <Link 
                  href="/es/admin/settings" 
                  className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive('/es/admin/settings') 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Configuración
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t text-xs text-gray-500">
            <p>© 2025 DysaEats</p>
            <p>Versión 1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;