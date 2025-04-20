import { useState } from 'react';
import { Menu, Bell, Settings, LogOut, User, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

interface AdminHeaderProps {
  toggleSidebar: () => void;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ toggleSidebar, user }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/es/admin/login');
  };

  // Mostrar nombre o email si está disponible
  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 lg:hidden"
          >
            <MenuIcon className="h-6 w-6" />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 ml-2 lg:ml-0">
            Panel de Administración
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                <User className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {displayName}
              </span>
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <div className="px-4 py-2 text-xs text-gray-500 border-b">
                  Sesión iniciada como
                  <div className="font-semibold text-gray-700">{displayName}</div>
                  <div className="text-xs italic">{user.role || 'Admin'}</div>
                </div>
                
                <a 
                  href="#" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </a>
                
                <a 
                  href="#" 
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </a>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;